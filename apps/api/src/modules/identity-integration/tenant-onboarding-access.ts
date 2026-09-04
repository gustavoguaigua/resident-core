import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import type { TenantInitialAdminIdentity } from "../tenants/tenant-lifecycle.contract.js";
import { TenantLifecycleError } from "../tenants/tenant-lifecycle.contract.js";

export const TENANT_BASE_ROLE_CODES = [
  "TenantAdmin",
  "Treasurer",
  "BoardMember",
  "TenantAuditor",
  "Resident",
  "PropertyOwner",
  "TenantStaff",
  "Guard",
  "ExternalAccountant",
] as const;

const TENANT_PERMISSION_CODES = [
  "audit.read",
  "tenants.branding.read",
  "tenants.branding.update",
  "tenants.profile.read",
  "tenants.profile.update",
  "tenants.wordpress.update",
  "tenantSettings.read",
  "tenantSettings.update",
  "propertyUnits.read",
  "propertyUnits.create",
  "propertyUnits.update",
  "propertyUnits.archive",
  "propertyUnits.read.own",
  "persons.read",
  "persons.create",
  "persons.update",
  "persons.archive",
  "persons.linkIdentity",
  "persons.read.own",
  "legalEntities.read",
  "legalEntities.create",
  "legalEntities.update",
  "legalEntities.archive",
  "propertyOwnerships.read",
  "propertyOwnerships.create",
  "propertyOwnerships.update",
  "propertyOwnerships.end",
  "residencies.read",
  "residencies.create",
  "residencies.update",
  "residencies.end",
  "residencies.read.own",
  "leases.read",
  "leases.create",
  "leases.update",
  "leases.end",
  "users.disable",
  "users.invite",
  "users.membership.revoke",
  "users.permissions.read",
  "users.read",
  "users.roles.assign",
  "users.roles.remove",
  "users.update",
] as const;

const ROLE_PERMISSION_CODES: Readonly<
  Record<(typeof TENANT_BASE_ROLE_CODES)[number], readonly string[]>
> = {
  TenantAdmin: TENANT_PERMISSION_CODES,
  Treasurer: ["users.read", "propertyUnits.read"],
  BoardMember: ["audit.read", "users.read"],
  TenantAuditor: ["audit.read", "users.read"],
  Resident: [
    "propertyUnits.read.own",
    "persons.read.own",
    "residencies.read.own",
  ],
  PropertyOwner: ["propertyUnits.read.own", "persons.read.own"],
  TenantStaff: [
    "users.read",
    "propertyUnits.read",
    "persons.read",
    "legalEntities.read",
    "propertyOwnerships.read",
    "residencies.read",
    "leases.read",
  ],
  Guard: [],
  ExternalAccountant: ["audit.read"],
};

export interface TenantInitialAccessResult {
  readonly userProfileId: string;
  readonly membershipId: string;
  readonly membershipRoleId: string;
  readonly tenantAdminRoleId: string;
  readonly email: string;
  readonly profileMutation: "created" | "linked" | "activated" | "none";
}

@Injectable()
export class TenantOnboardingAccess {
  public async provision(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    identity: TenantInitialAdminIdentity,
    actorUserProfileId: string,
  ): Promise<TenantInitialAccessResult> {
    const permissions = await this.ensurePermissions(transaction);
    const roles = await this.createBaseRoles(
      transaction,
      tenantId,
      permissions,
    );
    const profile = await this.createOrLinkProfile(transaction, identity);
    const membership = await transaction.userTenantMembership.create({
      data: {
        invitedBy: actorUserProfileId,
        joinedAt: new Date(),
        status: "ACTIVE",
        tenantId,
        userProfileId: profile.id,
      },
    });
    const tenantAdminRole = roles.get("TenantAdmin");
    if (tenantAdminRole === undefined) {
      throw new TenantLifecycleError("TENANT_CANNOT_BE_ACTIVATED");
    }
    const membershipRole = await transaction.membershipRole.create({
      data: {
        assignedBy: actorUserProfileId,
        membershipId: membership.id,
        roleId: tenantAdminRole.id,
      },
    });

    return {
      email: identity.email,
      membershipId: membership.id,
      membershipRoleId: membershipRole.id,
      profileMutation: profile.mutation,
      tenantAdminRoleId: tenantAdminRole.id,
      userProfileId: profile.id,
    };
  }

  private async ensurePermissions(transaction: Prisma.TransactionClient) {
    const permissions = new Map<string, { id: string }>();
    for (const code of TENANT_PERMISSION_CODES) {
      const segments = code.split(".");
      const action = segments.pop();
      if (action === undefined) {
        throw new TenantLifecycleError("TENANT_INVALID_INPUT");
      }
      const permission = await transaction.permission.upsert({
        create: {
          action,
          code,
          description: `System permission ${code}`,
          module: segments.join("."),
        },
        update: {},
        where: { code },
      });
      if (!permission.isSystem) {
        throw new TenantLifecycleError("TENANT_PERMISSION_DENIED");
      }
      permissions.set(code, permission);
    }
    return permissions;
  }

  private async createBaseRoles(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    permissions: ReadonlyMap<string, { id: string }>,
  ) {
    const roles = new Map<string, { id: string }>();
    for (const code of TENANT_BASE_ROLE_CODES) {
      const role = await transaction.role.create({
        data: {
          code,
          description: `System tenant role ${code}`,
          name: code.replaceAll(/([a-z])([A-Z])/gu, "$1 $2"),
          scope: "TENANT",
          tenantId,
        },
      });
      roles.set(code, role);
      for (const permissionCode of ROLE_PERMISSION_CODES[code]) {
        const permission = permissions.get(permissionCode);
        if (permission === undefined) {
          throw new TenantLifecycleError("TENANT_PERMISSION_DENIED");
        }
        await transaction.rolePermission.create({
          data: { permissionId: permission.id, roleId: role.id },
        });
      }
    }
    return roles;
  }

  private async createOrLinkProfile(
    transaction: Prisma.TransactionClient,
    identity: TenantInitialAdminIdentity,
  ): Promise<{
    id: string;
    mutation: TenantInitialAccessResult["profileMutation"];
  }> {
    const matches = await transaction.userProfile.findMany({
      where: {
        OR: [
          { email: identity.email },
          { keycloakSubjectId: identity.subject },
        ],
      },
    });
    if (matches.length > 1) {
      throw new TenantLifecycleError("IDENTITY_LINK_CONFLICT");
    }
    const existing = matches[0];
    if (existing === undefined) {
      const created = await transaction.userProfile.create({
        data: {
          displayName: identity.displayName,
          email: identity.email,
          keycloakSubjectId: identity.subject,
          status: "ACTIVE",
        },
      });
      return { id: created.id, mutation: "created" };
    }
    if (
      existing.email !== identity.email ||
      (existing.keycloakSubjectId !== null &&
        existing.keycloakSubjectId !== identity.subject) ||
      existing.userType !== "HUMAN" ||
      existing.authProvider !== "KEYCLOAK" ||
      !["ACTIVE", "PENDING"].includes(existing.status)
    ) {
      throw new TenantLifecycleError("IDENTITY_LINK_CONFLICT");
    }
    const mutation =
      existing.keycloakSubjectId === null
        ? "linked"
        : existing.status === "PENDING"
          ? "activated"
          : "none";
    if (mutation === "none") {
      return { id: existing.id, mutation };
    }
    const updated = await transaction.userProfile.update({
      data: { keycloakSubjectId: identity.subject, status: "ACTIVE" },
      where: { id: existing.id },
    });
    return { id: updated.id, mutation };
  }
}

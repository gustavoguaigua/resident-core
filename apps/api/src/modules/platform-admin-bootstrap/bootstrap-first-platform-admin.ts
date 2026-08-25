import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@prisma/client";

import type { AuditWriterPort } from "../audit/audit-writer.port.js";
import type { DomainAuditEvent } from "../audit/domain-audit-event.js";
import {
  normalizeBootstrapEmail,
  PlatformAdminBootstrapError,
  type PlatformIdentityLookupPort,
  type VerifiedPlatformIdentity,
} from "./bootstrap-contract.js";

const PLATFORM_ADMIN_ROLE = "PlatformAdmin";
const BOOTSTRAP_LOCK_KEY = 1_901_021_004;
const MAX_SERIALIZATION_ATTEMPTS = 3;

export const PLATFORM_PERMISSION_CODES = [
  "platform.tenants.create",
  "platform.tenants.read",
  "platform.tenants.update",
  "platform.tenants.activate",
  "platform.tenants.suspend",
  "platform.tenants.reactivate",
  "platform.tenants.archive",
  "platform.users.create",
  "platform.users.read",
  "platform.users.update",
  "platform.users.disable",
  "platform.users.enable",
  "platform.roles.read",
  "platform.roles.assign",
  "platform.permissions.read",
  "platform.audit.read",
  "platformSettingDefinitions.read",
] as const;

const GLOBAL_ROLE_PERMISSIONS = {
  SuperAdmin: PLATFORM_PERMISSION_CODES,
  PlatformAdmin: PLATFORM_PERMISSION_CODES,
  PlatformOperator: [
    "platform.tenants.read",
    "platform.tenants.update",
    "platform.users.read",
    "platform.users.update",
    "platform.roles.read",
    "platform.permissions.read",
  ],
  PlatformSupport: [
    "platform.tenants.read",
    "platform.users.read",
    "platform.roles.read",
  ],
  PlatformAuditor: [
    "platform.tenants.read",
    "platform.users.read",
    "platform.roles.read",
    "platform.permissions.read",
    "platform.audit.read",
  ],
} as const;

type BootstrapTransaction = Prisma.TransactionClient;

export interface PlatformAdminBootstrapResult {
  readonly status: "created" | "existing";
  readonly userProfileId: string;
}

export class BootstrapFirstPlatformAdmin {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly identityLookup: PlatformIdentityLookupPort,
    private readonly auditWriter: AuditWriterPort,
  ) {}

  public async execute(
    emailInput: string,
  ): Promise<PlatformAdminBootstrapResult> {
    const email = normalizeBootstrapEmail(emailInput);
    const identity = await this.identityLookup.resolveByEmail(email);
    this.validateIdentity(identity, email);

    for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (transaction) => this.executeTransaction(transaction, identity),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 10_000,
            timeout: 20_000,
          },
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < MAX_SERIALIZATION_ATTEMPTS
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new PlatformAdminBootstrapError("BOOTSTRAP_STATE_INVALID");
  }

  private async executeTransaction(
    transaction: BootstrapTransaction,
    identity: VerifiedPlatformIdentity,
  ): Promise<PlatformAdminBootstrapResult> {
    await transaction.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(${BOOTSTRAP_LOCK_KEY}) IS NULL AS acquired`,
    );

    const platformAdminRole = await this.findSingleGlobalRole(
      transaction,
      PLATFORM_ADMIN_ROLE,
    );
    if (platformAdminRole !== null) {
      const completedAssignments = await transaction.userGlobalRole.findMany({
        include: { userProfile: true },
        where: {
          removedAt: null,
          roleId: platformAdminRole.id,
          userProfile: { status: "ACTIVE" },
        },
      });
      if (completedAssignments.length > 0) {
        const existing = completedAssignments.find(
          (assignment) =>
            assignment.userProfile.keycloakSubjectId === identity.subject,
        );
        if (
          existing !== undefined &&
          existing.userProfile.email === identity.email
        ) {
          return {
            status: "existing",
            userProfileId: existing.userProfileId,
          };
        }
        throw new PlatformAdminBootstrapError("BOOTSTRAP_ALREADY_COMPLETED");
      }
    }

    const roles = await this.ensureAccessCatalog(transaction);
    const userProfile = await this.createOrLinkProfile(transaction, identity);
    const role = roles.get(PLATFORM_ADMIN_ROLE);
    if (
      role === undefined ||
      role.scope !== "GLOBAL" ||
      role.tenantId !== null
    ) {
      throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
    }
    const existingAssignment = await transaction.userGlobalRole.findUnique({
      where: {
        userProfileId_roleId: {
          roleId: role.id,
          userProfileId: userProfile.id,
        },
      },
    });
    if (existingAssignment !== null) {
      throw new PlatformAdminBootstrapError("BOOTSTRAP_STATE_INVALID");
    }
    await transaction.userGlobalRole.create({
      data: { roleId: role.id, userProfileId: userProfile.id },
    });

    const event: DomainAuditEvent = {
      action: "platformAdmin.bootstrap.completed",
      occurredAt: new Date(),
      resourceId: userProfile.id,
    };
    await this.auditWriter.recordConfirmed(
      transaction,
      {
        actor: { type: "SYSTEM" },
        traceId: `bootstrap-${randomUUID()}`,
      },
      event,
    );
    return { status: "created", userProfileId: userProfile.id };
  }

  private async ensureAccessCatalog(
    transaction: BootstrapTransaction,
  ): Promise<
    Map<string, { id: string; scope: string; tenantId: string | null }>
  > {
    const permissions = new Map<string, { id: string }>();
    for (const code of PLATFORM_PERMISSION_CODES) {
      const segments = code.split(".");
      const action = segments.pop();
      if (action === undefined) {
        throw new PlatformAdminBootstrapError("BOOTSTRAP_STATE_INVALID");
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
        throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
      }
      permissions.set(code, permission);
    }

    const roles = new Map<
      string,
      { id: string; scope: string; tenantId: string | null }
    >();
    for (const [code, permissionCodes] of Object.entries(
      GLOBAL_ROLE_PERMISSIONS,
    )) {
      let role = await this.findSingleGlobalRole(transaction, code);
      role ??= await transaction.role.create({
        data: {
          code,
          description: `System global role ${code}`,
          name: code.replaceAll(/([a-z])([A-Z])/gu, "$1 $2"),
          scope: "GLOBAL",
        },
      });
      if (role.scope !== "GLOBAL" || role.tenantId !== null || !role.isSystem) {
        throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
      }
      roles.set(code, role);
      for (const permissionCode of permissionCodes) {
        const permission = permissions.get(permissionCode);
        if (permission === undefined) {
          throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
        }
        await transaction.rolePermission.upsert({
          create: { permissionId: permission.id, roleId: role.id },
          update: {},
          where: {
            roleId_permissionId: {
              permissionId: permission.id,
              roleId: role.id,
            },
          },
        });
      }
    }
    return roles;
  }

  private async findSingleGlobalRole(
    transaction: BootstrapTransaction,
    code: string,
  ) {
    const roles = await transaction.role.findMany({
      where: { code, tenantId: null },
    });
    if (roles.length > 1) {
      throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
    }
    const role = roles[0] ?? null;
    if (role !== null && (role.scope !== "GLOBAL" || !role.isSystem)) {
      throw new PlatformAdminBootstrapError("BOOTSTRAP_ROLE_INVALID");
    }
    return role;
  }

  private async createOrLinkProfile(
    transaction: BootstrapTransaction,
    identity: VerifiedPlatformIdentity,
  ) {
    const matches = await transaction.userProfile.findMany({
      where: {
        OR: [
          { email: identity.email },
          { keycloakSubjectId: identity.subject },
        ],
      },
    });
    if (matches.length > 1) {
      throw new PlatformAdminBootstrapError("IDENTITY_LINK_CONFLICT");
    }
    const existing = matches[0];
    if (existing === undefined) {
      return transaction.userProfile.create({
        data: {
          displayName: identity.displayName,
          email: identity.email,
          keycloakSubjectId: identity.subject,
          status: "ACTIVE",
        },
      });
    }
    if (
      existing.email !== identity.email ||
      (existing.keycloakSubjectId !== null &&
        existing.keycloakSubjectId !== identity.subject) ||
      existing.userType !== "HUMAN" ||
      existing.authProvider !== "KEYCLOAK" ||
      !["ACTIVE", "PENDING"].includes(existing.status)
    ) {
      throw new PlatformAdminBootstrapError("IDENTITY_LINK_CONFLICT");
    }
    return transaction.userProfile.update({
      data: { keycloakSubjectId: identity.subject, status: "ACTIVE" },
      where: { id: existing.id },
    });
  }

  private validateIdentity(
    identity: VerifiedPlatformIdentity,
    expectedEmail: string,
  ): void {
    if (
      !identity.enabled ||
      !identity.emailVerified ||
      normalizeBootstrapEmail(identity.email) !== expectedEmail
    ) {
      throw new PlatformAdminBootstrapError("IDENTITY_NOT_ELIGIBLE");
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,254}$/u.test(identity.subject)) {
      throw new PlatformAdminBootstrapError("IDENTITY_SUBJECT_INVALID");
    }
  }
}

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AuthenticatedDiscoveryController } from "../../src/modules/users-roles/authenticated-discovery.controller.js";
import { AuthenticatedDiscoveryError } from "../../src/modules/users-roles/authenticated-discovery.contract.js";
import { AuthenticatedDiscoveryService } from "../../src/modules/users-roles/authenticated-discovery.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import {
  setAuthenticatedPrincipal,
  setTenantContext,
} from "../../src/platform/security/request-security-context.js";

const enabled = process.env.AUTHENTICATED_DISCOVERY_TEST === "1";

if (!enabled) {
  describe.skip("GAP-S4-001 authenticated discovery", () => {
    it("runs only through the authenticated discovery gate", () => undefined);
  });
} else {
  const prisma = new PrismaService();
  const service = new AuthenticatedDiscoveryService(prisma);
  const controller = new AuthenticatedDiscoveryController(service);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  let userProfileId: string;
  let platformAdminId: string;
  let inactiveUserProfileId: string;
  let tenantId: string;
  let otherTenantId: string;
  let inactiveTenantId: string;
  let membershipId: string;
  let revokedMembershipId: string;
  let inactiveTenantMembershipId: string;

  describe.sequential("GAP-S4-001 authenticated discovery", () => {
    beforeAll(async () => {
      await prisma.$connect();
      const user = await prisma.userProfile.create({
        data: {
          displayName: "Synthetic Discovery Admin",
          email: `discovery-${suffix}@example.com`,
          keycloakSubjectId: `discovery-subject-${suffix}`,
          status: "ACTIVE",
        },
      });
      userProfileId = user.id;
      const platformAdmin = await prisma.userProfile.create({
        data: {
          displayName: "Synthetic Platform Admin",
          email: `platform-discovery-${suffix}@example.com`,
          keycloakSubjectId: `platform-discovery-subject-${suffix}`,
          status: "ACTIVE",
        },
      });
      platformAdminId = platformAdmin.id;
      const inactiveUser = await prisma.userProfile.create({
        data: {
          displayName: "Synthetic Inactive User",
          email: `inactive-discovery-${suffix}@example.com`,
          keycloakSubjectId: `inactive-discovery-subject-${suffix}`,
          status: "INACTIVE",
        },
      });
      inactiveUserProfileId = inactiveUser.id;

      const [tenant, otherTenant, inactiveTenant] = await Promise.all([
        prisma.tenant.create({
          data: {
            name: "Discovery Active",
            slug: `discovery-a-${suffix}`,
            status: "ACTIVE",
          },
        }),
        prisma.tenant.create({
          data: {
            name: "Discovery Revoked",
            slug: `discovery-b-${suffix}`,
            status: "ACTIVE",
          },
        }),
        prisma.tenant.create({
          data: {
            name: "Discovery Inactive",
            slug: `discovery-c-${suffix}`,
            status: "SUSPENDED",
          },
        }),
      ]);
      tenantId = tenant.id;
      otherTenantId = otherTenant.id;
      inactiveTenantId = inactiveTenant.id;

      const [membership, revokedMembership, inactiveTenantMembership] =
        await Promise.all([
          prisma.userTenantMembership.create({
            data: {
              joinedAt: new Date(),
              status: "ACTIVE",
              tenantId,
              userProfileId,
            },
          }),
          prisma.userTenantMembership.create({
            data: {
              status: "REVOKED",
              tenantId: otherTenant.id,
              userProfileId,
            },
          }),
          prisma.userTenantMembership.create({
            data: {
              joinedAt: new Date(),
              status: "ACTIVE",
              tenantId: inactiveTenant.id,
              userProfileId,
            },
          }),
        ]);
      membershipId = membership.id;
      revokedMembershipId = revokedMembership.id;
      inactiveTenantMembershipId = inactiveTenantMembership.id;

      const [readPermission, updatePermission] = await Promise.all([
        prisma.permission.create({
          data: {
            action: "read",
            code: `discovery.read.${suffix}`,
            module: "discovery",
          },
        }),
        prisma.permission.create({
          data: {
            action: "update",
            code: `discovery.update.${suffix}`,
            module: "discovery",
          },
        }),
      ]);
      const activeRole = await prisma.role.create({
        data: {
          code: `DiscoveryAdmin-${suffix}`,
          name: "Discovery Admin",
          scope: "TENANT",
          tenantId,
        },
      });
      const removedRole = await prisma.role.create({
        data: {
          code: `RemovedDiscovery-${suffix}`,
          name: "Removed Discovery",
          scope: "TENANT",
          tenantId,
        },
      });
      await prisma.rolePermission.createMany({
        data: [
          { permissionId: readPermission.id, roleId: activeRole.id },
          { permissionId: updatePermission.id, roleId: activeRole.id },
          { permissionId: updatePermission.id, roleId: removedRole.id },
        ],
      });
      await prisma.membershipRole.createMany({
        data: [
          { membershipId, roleId: activeRole.id },
          { membershipId, removedAt: new Date(), roleId: removedRole.id },
        ],
      });
    });

    afterAll(async () => prisma.$disconnect());

    it("returns only the minimal active Core profile", async () => {
      await expect(service.getCurrentUser(userProfileId)).resolves.toEqual({
        displayName: "Synthetic Discovery Admin",
        status: "active",
        userProfileId,
      });
    });

    it("lists only active memberships whose tenant is active", async () => {
      await expect(
        service.listAccessibleTenants(userProfileId),
      ).resolves.toEqual([
        {
          membershipStatus: "active",
          name: "Discovery Active",
          slug: `discovery-a-${suffix}`,
          tenantId,
        },
      ]);
    });

    it("returns deduplicated effective tenant permissions and ignores request claims", async () => {
      const request = {
        claims: { realm_access: { roles: ["PlatformAdmin", "TenantAdmin"] } },
      };
      setAuthenticatedPrincipal(request, {
        subject: `discovery-subject-${suffix}`,
        userProfileId,
      });
      setTenantContext(request, { membershipId, tenantId });

      const response = await controller.getEffectivePermissions(request);

      expect(response.data).toEqual({
        permissions: [`discovery.read.${suffix}`, `discovery.update.${suffix}`],
        tenantId,
      });
      expect(JSON.stringify(response)).not.toContain("PlatformAdmin");
      expect(JSON.stringify(response)).not.toContain("realm_access");
    });

    it("fails closed for a cross-tenant context and a PlatformAdmin without membership", async () => {
      await expect(
        service.getEffectivePermissions(userProfileId, {
          membershipId,
          tenantId: otherTenantId,
        }),
      ).rejects.toBeInstanceOf(AuthenticatedDiscoveryError);
      await expect(
        service.getEffectivePermissions(platformAdminId, {
          membershipId,
          tenantId,
        }),
      ).rejects.toBeInstanceOf(AuthenticatedDiscoveryError);
    });

    it("fails closed for unknown or inactive identities, memberships, and tenants", async () => {
      await expect(service.getCurrentUser(randomUUID())).rejects.toBeInstanceOf(
        AuthenticatedDiscoveryError,
      );
      await expect(
        service.listAccessibleTenants(inactiveUserProfileId),
      ).rejects.toBeInstanceOf(AuthenticatedDiscoveryError);
      await expect(
        service.getEffectivePermissions(userProfileId, {
          membershipId: revokedMembershipId,
          tenantId: otherTenantId,
        }),
      ).rejects.toBeInstanceOf(AuthenticatedDiscoveryError);
      await expect(
        service.getEffectivePermissions(userProfileId, {
          membershipId: inactiveTenantMembershipId,
          tenantId: inactiveTenantId,
        }),
      ).rejects.toBeInstanceOf(AuthenticatedDiscoveryError);
    });

    it("maps an inactive identity on tenant discovery to the canonical HTTP error", async () => {
      const request = {};
      setAuthenticatedPrincipal(request, {
        subject: `inactive-discovery-subject-${suffix}`,
        userProfileId: inactiveUserProfileId,
      });

      await expect(
        controller.listAccessibleTenants(request),
      ).rejects.toMatchObject({
        response: { code: "ACCESS_DENIED" },
        status: 403,
      });
    });

    it("does not create Audit events for successful read-only discovery", async () => {
      await service.getCurrentUser(userProfileId);
      await service.listAccessibleTenants(userProfileId);
      await service.getEffectivePermissions(userProfileId, {
        membershipId,
        tenantId,
      });
      await expect(
        prisma.auditLog.count({
          where: {
            actorUserProfileId: userProfileId,
            action: { contains: "discovery" },
          },
        }),
      ).resolves.toBe(0);
    });
  });
}

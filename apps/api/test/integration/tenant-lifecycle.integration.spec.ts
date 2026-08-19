import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import {
  TenantOnboardingAccess,
  TENANT_BASE_ROLE_CODES,
} from "../../src/modules/identity-integration/tenant-onboarding-access.js";
import { KeycloakPlatformIdentityClient } from "../../src/modules/platform-admin-bootstrap/keycloak-platform-identity-client.js";
import { TenantLifecycleService } from "../../src/modules/tenants/tenant-lifecycle.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";

const slug = (label: string) =>
  `phase6-${label}-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
const trace = (label: string) => `phase6-${label}-${randomUUID()}`;
const enabled = process.env.TENANT_PHASE6_TEST === "1";

if (!enabled) {
  describe.skip("Phase 6 tenant onboarding and lifecycle", () => {
    it("runs only through the phase 6 gate", () => undefined);
  });
} else {
  const prisma = new PrismaService();
  const auditWriter = new PrismaAuditWriter(prisma);
  const identityLookup = KeycloakPlatformIdentityClient.fromEnvironment();
  const service = new TenantLifecycleService(
    prisma,
    identityLookup,
    new TenantOnboardingAccess(),
    auditWriter,
  );
  const initialAdminEmail = "tenant.admin@example.com";
  let platformAdminId: string;

  describe.sequential("Phase 6 tenant onboarding and lifecycle", () => {
    beforeAll(async () => {
      await prisma.$connect();
      const platformAdmin = await prisma.userProfile.findUnique({
        where: { email: "platform.admin@example.com" },
      });
      if (platformAdmin === null) {
        throw new Error(
          "Phase 6 requires the integrated PlatformAdmin bootstrap.",
        );
      }
      platformAdminId = platformAdmin.id;
    });

    afterAll(async () => prisma.$disconnect());

    it("creates the complete tenant access graph in pendingSetup with durable audit", async () => {
      const tenantSlug = slug("create");
      const result = await service.create(
        {
          branding: { primaryColor: "#1E88E5" },
          initialAdmin: { email: initialAdminEmail },
          name: "Phase 6 Created Tenant",
          profile: { city: "Santo Domingo" },
          slug: tenantSlug,
        },
        platformAdminId,
        trace("create"),
      );

      expect(result.tenant.status).toBe("PENDING_SETUP");
      expect(result.initialAdmin).toMatchObject({
        email: initialAdminEmail,
        membershipStatus: "active",
        role: "TenantAdmin",
      });
      const persisted = await prisma.tenant.findUniqueOrThrow({
        include: {
          auditLogs: true,
          memberships: { include: { roles: { include: { role: true } } } },
          profile: true,
          roles: true,
        },
        where: { id: result.tenant.id },
      });
      expect(persisted.profile?.displayName).toBe("Phase 6 Created Tenant");
      expect(new Set(persisted.roles.map((role) => role.code))).toEqual(
        new Set(TENANT_BASE_ROLE_CODES),
      );
      expect(persisted.memberships).toHaveLength(1);
      expect(persisted.memberships[0]?.status).toBe("ACTIVE");
      expect(persisted.memberships[0]?.roles[0]?.role.code).toBe("TenantAdmin");
      expect(persisted.auditLogs.map((event) => event.action)).toEqual(
        expect.arrayContaining([
          "membership.created",
          "membership.roleAssigned",
          "tenant.baseRoles.created",
          "tenant.created",
        ]),
      );
    });

    it("handles duplicate onboarding as a conflict without duplicates", async () => {
      const tenantSlug = slug("duplicate");
      const input = {
        initialAdmin: { email: initialAdminEmail },
        name: "Phase 6 Duplicate Tenant",
        slug: tenantSlug,
      };
      await service.create(input, platformAdminId, trace("duplicate-first"));
      await expect(
        service.create(input, platformAdminId, trace("duplicate-second")),
      ).rejects.toMatchObject({ code: "TENANT_SLUG_ALREADY_EXISTS" });
      await expect(
        prisma.tenant.count({ where: { slug: tenantSlug } }),
      ).resolves.toBe(1);
    });

    it("fails closed for a Core actor without the persisted global permission", async () => {
      const unauthorized = await prisma.userProfile.create({
        data: {
          displayName: "Claims Cannot Elevate",
          email: `${slug("claims")}@example.test`,
          keycloakSubjectId: randomUUID(),
          status: "ACTIVE",
        },
      });
      const tenantSlug = slug("unauthorized");
      await expect(
        service.create(
          {
            initialAdmin: { email: initialAdminEmail },
            name: "Unauthorized Tenant",
            slug: tenantSlug,
          },
          unauthorized.id,
          trace("unauthorized"),
        ),
      ).rejects.toMatchObject({ code: "TENANT_PERMISSION_DENIED" });
      await expect(
        prisma.tenant.findUnique({ where: { slug: tenantSlug } }),
      ).resolves.toBeNull();
    });

    it("applies valid transitions and rejects repeated or prohibited transitions", async () => {
      const created = await service.create(
        {
          initialAdmin: { email: initialAdminEmail },
          name: "Phase 6 Lifecycle Tenant",
          slug: slug("lifecycle"),
        },
        platformAdminId,
        trace("lifecycle-create"),
      );
      await expect(
        service.activate(created.tenant.id, platformAdminId, trace("activate")),
      ).resolves.toMatchObject({ status: "ACTIVE" });
      await expect(
        service.activate(
          created.tenant.id,
          platformAdminId,
          trace("activate-repeat"),
        ),
      ).rejects.toMatchObject({ code: "TENANT_STATUS_TRANSITION_INVALID" });
      await expect(
        service.suspend(
          created.tenant.id,
          platformAdminId,
          trace("suspend"),
          "Synthetic administrative suspension",
        ),
      ).resolves.toMatchObject({ status: "SUSPENDED" });
      await expect(
        service.reactivate(
          created.tenant.id,
          platformAdminId,
          trace("reactivate"),
        ),
      ).resolves.toMatchObject({ status: "ACTIVE" });
      await service.suspend(
        created.tenant.id,
        platformAdminId,
        trace("suspend-archive"),
        "Synthetic archive preparation",
      );
      await expect(
        service.archive(
          created.tenant.id,
          platformAdminId,
          trace("archive"),
          "Synthetic historical retention",
        ),
      ).resolves.toMatchObject({ status: "ARCHIVED" });
      await expect(
        service.reactivate(
          created.tenant.id,
          platformAdminId,
          trace("archived-reactivate"),
        ),
      ).rejects.toMatchObject({ code: "TENANT_STATUS_TRANSITION_INVALID" });

      const events = await prisma.auditLog.findMany({
        where: {
          action: {
            in: [
              "tenant.activated",
              "tenant.archived",
              "tenant.reactivated",
              "tenant.suspended",
            ],
          },
          tenantId: created.tenant.id,
        },
      });
      expect(events).toHaveLength(5);
      expect(
        events.every((event) => event.actorUserProfileId === platformAdminId),
      ).toBe(true);
    });

    it("rejects activation without the active TenantAdmin graph even with a pending invitation", async () => {
      const incomplete = await prisma.tenant.create({
        data: {
          name: "Incomplete Phase 6 Tenant",
          profile: { create: { displayName: "Incomplete Phase 6 Tenant" } },
          slug: slug("incomplete"),
        },
      });
      const role = await prisma.role.create({
        data: {
          code: "TenantAdmin",
          name: "Tenant Admin",
          scope: "TENANT",
          tenantId: incomplete.id,
        },
      });
      await prisma.invitation.create({
        data: {
          email: initialAdminEmail,
          expiresAt: new Date(Date.now() + 60_000),
          roleId: role.id,
          tenantId: incomplete.id,
          tokenHash: randomUUID(),
        },
      });
      await expect(
        service.activate(incomplete.id, platformAdminId, trace("incomplete")),
      ).rejects.toMatchObject({ code: "TENANT_CANNOT_BE_ACTIVATED" });
    });

    it("keeps tenant-owned roles and memberships isolated", async () => {
      const [left, right] = await Promise.all([
        service.create(
          {
            initialAdmin: { email: initialAdminEmail },
            name: "Phase 6 Left Tenant",
            slug: slug("left"),
          },
          platformAdminId,
          trace("left"),
        ),
        service.create(
          {
            initialAdmin: { email: initialAdminEmail },
            name: "Phase 6 Right Tenant",
            slug: slug("right"),
          },
          platformAdminId,
          trace("right"),
        ),
      ]);
      const crossTenantRole = await prisma.membershipRole.findFirst({
        where: {
          membership: { tenantId: left.tenant.id },
          role: { tenantId: right.tenant.id },
        },
      });
      expect(crossTenantRole).toBeNull();
      await expect(
        prisma.userTenantMembership.count({
          where: {
            tenantId: { in: [left.tenant.id, right.tenant.id] },
            userProfileId: left.initialAdmin.userProfileId,
          },
        }),
      ).resolves.toBe(2);
    });

    it("rolls back the complete onboarding when durable audit fails", async () => {
      const failingAuditWriter: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("Synthetic audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failingService = new TenantLifecycleService(
        prisma,
        identityLookup,
        new TenantOnboardingAccess(),
        failingAuditWriter,
      );
      const tenantSlug = slug("rollback");
      await expect(
        failingService.create(
          {
            initialAdmin: { email: initialAdminEmail },
            name: "Phase 6 Rollback Tenant",
            slug: tenantSlug,
          },
          platformAdminId,
          trace("rollback"),
        ),
      ).rejects.toThrow("Synthetic audit failure");
      await expect(
        prisma.tenant.findUnique({ where: { slug: tenantSlug } }),
      ).resolves.toBeNull();
      await expect(
        prisma.role.count({ where: { tenant: { slug: tenantSlug } } }),
      ).resolves.toBe(0);
      await expect(
        prisma.userTenantMembership.count({
          where: { tenant: { slug: tenantSlug } },
        }),
      ).resolves.toBe(0);
    });

    it("fails closed for unknown tenants", async () => {
      await expect(
        service.activate(randomUUID(), platformAdminId, trace("missing")),
      ).rejects.toMatchObject({ code: "TENANT_NOT_FOUND" });
    });
  });
}

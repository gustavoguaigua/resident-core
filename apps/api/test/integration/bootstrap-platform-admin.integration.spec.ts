import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import type { PlatformAdminBootstrapError } from "../../src/modules/platform-admin-bootstrap/bootstrap-contract.js";
import {
  BootstrapFirstPlatformAdmin,
  PLATFORM_PERMISSION_CODES,
} from "../../src/modules/platform-admin-bootstrap/bootstrap-first-platform-admin.js";
import { KeycloakPlatformIdentityClient } from "../../src/modules/platform-admin-bootstrap/keycloak-platform-identity-client.js";

const enabled = process.env.BOOTSTRAP_PHASE4_TEST === "1";

const countBootstrapGraph = async (prisma: PrismaClient) => {
  const [
    auditLogs,
    permissions,
    rolePermissions,
    roles,
    userGlobalRoles,
    userProfiles,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.permission.count(),
    prisma.rolePermission.count(),
    prisma.role.count(),
    prisma.userGlobalRole.count(),
    prisma.userProfile.count(),
  ]);
  return {
    auditLogs,
    permissions,
    rolePermissions,
    roles,
    userGlobalRoles,
    userProfiles,
  };
};

const requiredEnvironment = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing phase 4 environment: ${name}`);
  }
  return value;
};

if (!enabled) {
  describe.skip("PlatformAdmin bootstrap integration", () => {
    it("runs only through the phase 4 gate", () => undefined);
  });
} else {
  describe("PlatformAdmin bootstrap integration", () => {
    const prisma = new PrismaClient({
      datasourceUrl: requiredEnvironment("DATABASE_URL"),
    });
    const identityLookup = KeycloakPlatformIdentityClient.fromEnvironment();
    const auditWriter = new PrismaAuditWriter(prisma as never);
    const useCase = new BootstrapFirstPlatformAdmin(
      prisma,
      identityLookup,
      auditWriter,
    );

    beforeAll(async () => {
      await prisma.$connect();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it("fails closed on a malformed global role without partial writes", async () => {
      const malformedRole = await prisma.role.create({
        data: {
          code: "PlatformAdmin",
          name: "Malformed Platform Admin",
          scope: "TENANT",
        },
      });
      const baseline = await countBootstrapGraph(prisma);
      try {
        await expect(
          useCase.execute("platform.admin@example.com"),
        ).rejects.toEqual(
          expect.objectContaining<Partial<PlatformAdminBootstrapError>>({
            code: "BOOTSTRAP_ROLE_INVALID",
          }),
        );
        expect(await countBootstrapGraph(prisma)).toEqual(baseline);
      } finally {
        await prisma.role.delete({ where: { id: malformedRole.id } });
      }
    });

    it("rolls back the whole graph when durable audit fails", async () => {
      const failingAuditWriter: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("synthetic audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failingUseCase = new BootstrapFirstPlatformAdmin(
        prisma,
        identityLookup,
        failingAuditWriter,
      );
      const baseline = await countBootstrapGraph(prisma);
      await expect(
        failingUseCase.execute("platform.admin@example.com"),
      ).rejects.toThrow("synthetic audit failure");
      expect(await countBootstrapGraph(prisma)).toEqual(baseline);
    });

    it("serializes concurrent attempts and remains idempotent", async () => {
      const baseline = await countBootstrapGraph(prisma);
      const existingPlatformPermissions = await prisma.permission.count({
        where: { code: { in: [...PLATFORM_PERMISSION_CODES] } },
      });
      const results = await Promise.all([
        useCase.execute("platform.admin@example.com"),
        useCase.execute("platform.admin@example.com"),
      ]);
      expect(results.map(({ status }) => status).sort()).toEqual([
        "created",
        "existing",
      ]);
      expect(
        new Set(results.map(({ userProfileId }) => userProfileId)).size,
      ).toBe(1);

      const repeated = await useCase.execute("platform.admin@example.com");
      expect(repeated).toEqual({
        status: "existing",
        userProfileId: results[0]?.userProfileId,
      });
      expect(await prisma.tenant.count()).toBe(0);
      expect(await prisma.userProfile.count()).toBe(1);
      expect(await prisma.permission.count()).toBe(
        baseline.permissions +
          PLATFORM_PERMISSION_CODES.length -
          existingPlatformPermissions,
      );
      expect(await prisma.role.count()).toBe(5);
      expect(await prisma.userGlobalRole.count()).toBe(1);
      expect(await prisma.userTenantMembership.count()).toBe(0);
      expect(await prisma.auditLog.count()).toBe(1);
    });

    it("rejects a different verified subject after completion", async () => {
      await expect(useCase.execute("tenant.admin@example.com")).rejects.toEqual(
        expect.objectContaining<Partial<PlatformAdminBootstrapError>>({
          code: "BOOTSTRAP_ALREADY_COMPLETED",
        }),
      );
      expect(await prisma.userProfile.count()).toBe(1);
      expect(await prisma.userGlobalRole.count()).toBe(1);
      expect(await prisma.auditLog.count()).toBe(1);
    });

    it("persists only the authorized role and sanitized system audit", async () => {
      const assignment = await prisma.userGlobalRole.findFirstOrThrow({
        include: {
          role: { include: { permissions: true } },
          userProfile: true,
        },
      });
      expect(assignment.role).toMatchObject({
        code: "PlatformAdmin",
        scope: "GLOBAL",
        tenantId: null,
      });
      expect(assignment.role.permissions).toHaveLength(
        PLATFORM_PERMISSION_CODES.length,
      );
      expect(assignment.userProfile).toMatchObject({
        authProvider: "KEYCLOAK",
        email: "platform.admin@example.com",
        status: "ACTIVE",
        userType: "HUMAN",
      });
      expect(assignment.userProfile.keycloakSubjectId).toBeTruthy();
      const audit = await prisma.auditLog.findFirstOrThrow();
      expect(audit).toMatchObject({
        action: "platformAdmin.bootstrap.completed",
        actorType: "SYSTEM",
        category: "PLATFORM",
        metadata: null,
        outcome: "SUCCESS",
        resourceId: assignment.userProfileId,
        resourceType: "UserProfile",
        tenantId: null,
      });
    });
  });
}

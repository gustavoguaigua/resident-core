import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { PrismaPermissionEvaluator } from "../../src/modules/access-control/prisma-access-control.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { PrismaIdentityResolver } from "../../src/modules/identity-integration/prisma-identity-resolver.js";

const subject = `phase5-platform-${randomUUID()}`;
const unknownSubject = `phase5-unknown-${randomUUID()}`;
const prisma = new PrismaService();
const auditWriter = new PrismaAuditWriter(prisma);

describe("Phase 5 identity and global authorization", () => {
  let userProfileId: string;
  let globalPermissionCode: string;
  let evaluator: PrismaPermissionEvaluator;

  beforeAll(async () => {
    await prisma.$connect();
    const permission = await prisma.permission.create({
      data: {
        action: "read",
        code: `platform.phase5.read.${randomUUID()}`,
        module: "platform.phase5",
      },
    });
    const role = await prisma.role.create({
      data: {
        code: `PlatformAdminPhase5-${randomUUID()}`,
        name: "Platform Admin Phase 5",
        scope: "GLOBAL",
      },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: role.id },
    });
    const profile = await prisma.userProfile.create({
      data: {
        displayName: "Synthetic Phase 5 Platform Admin",
        email: `phase5-platform-${randomUUID()}@example.test`,
        keycloakSubjectId: subject,
        status: "ACTIVE",
      },
    });
    userProfileId = profile.id;
    await prisma.userGlobalRole.create({
      data: { roleId: role.id, userProfileId },
    });
    evaluator = new PrismaPermissionEvaluator(prisma, auditWriter);
    globalPermissionCode = permission.code;
  });

  afterAll(async () => prisma.$disconnect());

  it("resolves a verified Keycloak subject to the active Core profile", async () => {
    const resolver = resolverFor(subject);

    await expect(
      resolver.resolve(requestWithUntrustedClaims()),
    ).resolves.toEqual({
      subject,
      userProfileId,
    });
  });

  it("preserves the PlatformAdmin global permission from Core persistence", async () => {
    await expect(
      evaluator.isAllowed({
        permission: globalPermissionCode,
        principal: { subject, userProfileId },
        tenant: null,
        traceId: `phase5-${randomUUID()}`,
      }),
    ).resolves.toBe(true);
  });

  it("fails closed for unknown subjects and persists a sanitized denial", async () => {
    const resolver = resolverFor(unknownSubject);

    await expect(resolver.resolve({})).rejects.toMatchObject({
      code: "IDENTITY_NOT_PROVISIONED",
    });
    await expect(
      prisma.auditLog.findFirst({
        where: {
          action: "authentication.denied",
          reasonCode: "IDENTITY_NOT_PROVISIONED",
        },
      }),
    ).resolves.not.toBeNull();
  });

  it("ignores elevated Keycloak claims when Core has no persisted permission", async () => {
    await expect(
      evaluator.isAllowed({
        permission: "platform.claims.cannot.grant",
        principal: { subject, userProfileId },
        tenant: null,
        traceId: `phase5-${randomUUID()}`,
      }),
    ).resolves.toBe(false);
  });
});

function resolverFor(resolvedSubject: string): PrismaIdentityResolver {
  return new PrismaIdentityResolver(prisma, auditWriter, {
    verify: async () => ({ subject: resolvedSubject }),
  });
}

function requestWithUntrustedClaims(): object {
  return {
    claims: {
      realm_access: { roles: ["SuperAdmin", "PlatformAdmin"] },
      tenantId: "00000000-0000-4000-8000-000000000999",
    },
    traceId: `phase5-test-${randomUUID()}`,
  };
}

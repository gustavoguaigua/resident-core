import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  PrismaTenantContextResolver,
  PrismaPermissionEvaluator,
} from "../../src/modules/access-control/prisma-access-control.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";

const prisma = new PrismaService();
const auditWriter = new PrismaAuditWriter(prisma);
const principalSubject = `phase5-tenant-${randomUUID()}`;
let userProfileId: string;

describe("Phase 5 tenant membership authorization", () => {
  let tenantAId: string;
  let tenantBId: string;
  let inactiveTenantId: string;
  let membershipAId: string;
  let membershipBId: string;
  let tenantPermissionCode: string;
  let tenantResolver: PrismaTenantContextResolver;
  let evaluator: PrismaPermissionEvaluator;

  beforeAll(async () => {
    await prisma.$connect();
    const [tenantA, tenantB, inactiveTenant] = await Promise.all([
      createTenant("a", "ACTIVE"),
      createTenant("b", "ACTIVE"),
      createTenant("inactive", "SUSPENDED"),
    ]);
    tenantAId = tenantA.id;
    tenantBId = tenantB.id;
    inactiveTenantId = inactiveTenant.id;
    const profile = await prisma.userProfile.create({
      data: {
        displayName: "Synthetic Phase 5 Tenant User",
        email: `phase5-tenant-${randomUUID()}@example.test`,
        keycloakSubjectId: principalSubject,
        status: "ACTIVE",
      },
    });
    userProfileId = profile.id;
    const [membershipA, membershipB] = await Promise.all([
      prisma.userTenantMembership.create({
        data: { status: "ACTIVE", tenantId: tenantAId, userProfileId },
      }),
      prisma.userTenantMembership.create({
        data: { status: "ACTIVE", tenantId: tenantBId, userProfileId },
      }),
      prisma.userTenantMembership.create({
        data: { status: "ACTIVE", tenantId: inactiveTenantId, userProfileId },
      }),
    ]);
    membershipAId = membershipA.id;
    membershipBId = membershipB.id;
    const permission = await prisma.permission.create({
      data: {
        action: "read",
        code: `users.phase5.read.${randomUUID()}`,
        module: "users.phase5",
      },
    });
    tenantPermissionCode = permission.code;
    const roleA = await prisma.role.create({
      data: {
        code: `TenantAdminPhase5-${randomUUID()}`,
        name: "Tenant Admin Phase 5",
        scope: "TENANT",
        tenantId: tenantAId,
      },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: roleA.id },
    });
    await prisma.membershipRole.create({
      data: { membershipId: membershipAId, roleId: roleA.id },
    });
    await prisma.membershipRole.create({
      data: { membershipId: membershipBId, roleId: roleA.id },
    });
    tenantResolver = new PrismaTenantContextResolver(prisma, auditWriter);
    evaluator = new PrismaPermissionEvaluator(prisma, auditWriter);
  });

  afterAll(async () => prisma.$disconnect());

  it("authorizes only an active membership with a tenant role from the same tenant", async () => {
    const context = await tenantResolver.resolve(
      principal(),
      requestForTenant(tenantAId),
    );

    await expect(
      evaluator.isAllowed({
        permission: tenantPermissionCode,
        principal: principal(),
        tenant: context,
        traceId: `phase5-${randomUUID()}`,
      }),
    ).resolves.toBe(true);
  });

  it("does not inherit a role or permission across tenants", async () => {
    const context = await tenantResolver.resolve(
      principal(),
      requestForTenant(tenantBId),
    );

    await expect(
      evaluator.isAllowed({
        permission: tenantPermissionCode,
        principal: principal(),
        tenant: context,
        traceId: `phase5-${randomUUID()}`,
      }),
    ).resolves.toBe(false);
  });

  it.each(["SUSPENDED", "REVOKED", "INVITED"] as const)(
    "denies a %s membership",
    async (status) => {
      await prisma.userTenantMembership.update({
        data: { status },
        where: { id: membershipAId },
      });
      await expect(
        tenantResolver.resolve(principal(), requestForTenant(tenantAId)),
      ).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
      await prisma.userTenantMembership.update({
        data: { status: "ACTIVE" },
        where: { id: membershipAId },
      });
    },
  );

  it("fails closed for an inactive or unknown tenant without revealing which condition failed", async () => {
    for (const tenantId of [inactiveTenantId, randomUUID()]) {
      await expect(
        tenantResolver.resolve(principal(), requestForTenant(tenantId)),
      ).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
    }
  });

  it("rejects missing, duplicate, malformed and conflicting tenant selectors", async () => {
    await expect(
      tenantResolver.resolve(principal(), { headers: {} }),
    ).rejects.toMatchObject({
      code: "TENANT_CONTEXT_REQUIRED",
    });
    await expect(
      tenantResolver.resolve(principal(), {
        headers: { "x-tenant-id": [tenantAId, tenantBId] },
      }),
    ).rejects.toMatchObject({ code: "TENANT_CONTEXT_INVALID" });
    await expect(
      tenantResolver.resolve(principal(), requestForTenant("not-a-uuid")),
    ).rejects.toMatchObject({ code: "TENANT_CONTEXT_INVALID" });
    await expect(
      tenantResolver.resolve(principal(), {
        body: { tenantId: tenantBId },
        headers: { "x-tenant-id": tenantAId },
      }),
    ).rejects.toMatchObject({ code: "TENANT_CONTEXT_CONFLICT" });
  });

  it("denies absent permissions and persists tenant-scoped authorization evidence", async () => {
    const context = await tenantResolver.resolve(
      principal(),
      requestForTenant(tenantAId),
    );
    await expect(
      evaluator.isAllowed({
        permission: "users.phase5.absent",
        principal: principal(),
        tenant: context,
        traceId: `phase5-denial-${randomUUID()}`,
      }),
    ).resolves.toBe(false);
    await expect(
      prisma.auditLog.findFirst({
        where: {
          action: "authorization.denied",
          actorMembershipId: membershipAId,
          tenantId: tenantAId,
        },
      }),
    ).resolves.not.toBeNull();
  });

  it("persists sanitized tenant-access denials with runtime UUID trace identifiers", async () => {
    await expect(
      tenantResolver.resolve(principal(), requestForTenant(randomUUID())),
    ).rejects.toMatchObject({ code: "TENANT_ACCESS_DENIED" });
    await expect(
      prisma.auditLog.count({
        where: {
          action: "tenantAccess.denied",
          actorUserProfileId: userProfileId,
          reasonCode: "TENANT_ACCESS_DENIED",
        },
      }),
    ).resolves.toBeGreaterThan(0);
  });
});

function principal() {
  return { subject: principalSubject, userProfileId };
}

function requestForTenant(tenantId: string): object {
  return { headers: { "x-tenant-id": tenantId } };
}

async function createTenant(suffix: string, status: "ACTIVE" | "SUSPENDED") {
  const unique = randomUUID();
  return prisma.tenant.create({
    data: {
      name: `Phase 5 Tenant ${suffix}`,
      slug: `phase5-${suffix}-${unique}`,
      status,
    },
  });
}

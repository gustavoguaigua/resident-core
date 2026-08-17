import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PrismaService } from "../../src/platform/database/prisma.service.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";

const prisma = new PrismaClient();
const writer = new PrismaAuditWriter(prisma as PrismaService);

let tenantAId: string;
let tenantBId: string;
let userId: string;
let membershipAId: string;
let membershipBId: string;

describe("Audit base persistence", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const tenantA = await prisma.tenant.create({
      data: { name: "Audit Tenant A", slug: "audit-tenant-a" },
    });
    const tenantB = await prisma.tenant.create({
      data: { name: "Audit Tenant B", slug: "audit-tenant-b" },
    });
    const user = await prisma.userProfile.create({
      data: {
        email: "audit-actor@example.test",
        displayName: "Audit Actor",
        keycloakSubjectId: "audit-sub-1",
        status: "ACTIVE",
      },
    });
    const membershipA = await prisma.userTenantMembership.create({
      data: { tenantId: tenantA.id, userProfileId: user.id, status: "ACTIVE" },
    });
    const membershipB = await prisma.userTenantMembership.create({
      data: { tenantId: tenantB.id, userProfileId: user.id, status: "ACTIVE" },
    });
    tenantAId = tenantA.id;
    tenantBId = tenantB.id;
    userId = user.id;
    membershipAId = membershipA.id;
    membershipBId = membershipB.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("commits a domain mutation and its audit row in one transaction", async () => {
    const brandingId = await prisma.$transaction(async (transaction) => {
      const branding = await transaction.tenantBranding.create({
        data: { tenantId: tenantAId, primaryColor: "#112233" },
      });
      await writer.recordConfirmed(
        transaction,
        {
          tenantId: tenantAId,
          actor: {
            type: "USER",
            userProfileId: userId,
            membershipId: membershipAId,
          },
          traceId: "trace.commit",
          correlationId: "correlation.commit",
        },
        {
          action: "tenant.branding.updated",
          resourceId: branding.id,
          metadata: { changedFields: ["primaryColor"] },
          occurredAt: new Date("2026-08-15T13:00:00.000Z"),
        },
      );
      return branding.id;
    });

    await expect(
      prisma.auditLog.findFirstOrThrow({
        where: { tenantId: tenantAId, resourceId: brandingId },
      }),
    ).resolves.toMatchObject({
      action: "tenant.branding.updated",
      category: "TENANT",
      outcome: "SUCCESS",
      traceId: "trace.commit",
      correlationId: "correlation.commit",
      metadata: { changedFields: ["primaryColor"] },
    });
  });

  it("rolls back the domain mutation when audit validation fails", async () => {
    let mappingId: string | undefined;
    await expect(
      prisma.$transaction(async (transaction) => {
        const mapping = await transaction.tenantWordPressMapping.create({
          data: { tenantId: tenantAId },
        });
        mappingId = mapping.id;
        await writer.recordConfirmed(
          transaction,
          {
            tenantId: tenantAId,
            actor: {
              type: "USER",
              userProfileId: userId,
              membershipId: membershipAId,
            },
            traceId: "trace.rollback",
          },
          {
            action: "tenant.wordpressMapping.updated",
            resourceId: mapping.id,
            metadata: { accessToken: "prohibited" },
            occurredAt: new Date(),
          },
        );
      }),
    ).rejects.toThrow("non-allowlisted");

    if (mappingId === undefined) {
      throw new Error(
        "Rollback fixture was not created inside the transaction.",
      );
    }
    await expect(
      prisma.tenantWordPressMapping.findUnique({ where: { id: mappingId } }),
    ).resolves.toBeNull();
  });

  it("rejects a membership from another tenant and writes no audit row", async () => {
    await expect(
      prisma.$transaction((transaction) =>
        writer.recordConfirmed(
          transaction,
          {
            tenantId: tenantBId,
            actor: {
              type: "USER",
              userProfileId: userId,
              membershipId: membershipAId,
            },
            traceId: "trace.cross-tenant",
          },
          {
            action: "tenant.updated",
            resourceId: tenantBId,
            metadata: { changedFields: ["timezone"] },
            occurredAt: new Date(),
          },
        ),
      ),
    ).rejects.toThrow("not valid for the tenant context");
    await expect(
      prisma.auditLog.count({ where: { traceId: "trace.cross-tenant" } }),
    ).resolves.toBe(0);
  });

  it("persists tenant rows independently and scopes queries by tenant", async () => {
    await prisma.$transaction((transaction) =>
      writer.recordConfirmed(
        transaction,
        {
          tenantId: tenantBId,
          actor: {
            type: "USER",
            userProfileId: userId,
            membershipId: membershipBId,
          },
          traceId: "trace.tenant-b",
        },
        {
          action: "tenant.updated",
          resourceId: tenantBId,
          metadata: { changedFields: ["currency"] },
          occurredAt: new Date(),
        },
      ),
    );

    const tenantAIds = await prisma.auditLog.findMany({
      where: { tenantId: tenantAId },
      select: { tenantId: true },
    });
    expect(tenantAIds).not.toHaveLength(0);
    expect(tenantAIds.every((row) => row.tenantId === tenantAId)).toBe(true);
  });

  it("persists a denied pre-tenant event without changing the denial", async () => {
    await expect(
      writer.recordDenied(
        { actor: { type: "ANONYMOUS" }, traceId: "trace.auth-denied" },
        {
          action: "authentication.denied",
          reasonCode: "INVALID_SUBJECT",
          occurredAt: new Date(),
        },
      ),
    ).resolves.toEqual({ persisted: true });
    await expect(
      prisma.auditLog.findFirstOrThrow({
        where: { traceId: "trace.auth-denied" },
      }),
    ).resolves.toMatchObject({
      tenantId: null,
      actorType: "ANONYMOUS",
      category: "SECURITY",
      outcome: "DENIED",
      resourceType: "Authentication",
      resourceId: null,
    });
  });

  it("rejects direct non-canonical inserts and all ordinary mutations", async () => {
    await expect(
      prisma.auditLog.create({
        data: {
          actorType: "ANONYMOUS",
          action: "payment.created",
          category: "SECURITY",
          outcome: "DENIED",
          resourceType: "Authentication",
          traceId: "trace.invalid-catalog",
          occurredAt: new Date(),
        },
      }),
    ).rejects.toThrow();

    const auditLog = await prisma.auditLog.findFirstOrThrow({
      where: { traceId: "trace.commit" },
    });
    await expect(
      prisma.auditLog.update({
        where: { id: auditLog.id },
        data: { reasonCode: "MUTATED" },
      }),
    ).rejects.toThrow("append-only");
    await expect(
      prisma.auditLog.delete({ where: { id: auditLog.id } }),
    ).rejects.toThrow("append-only");
    await expect(
      prisma.$executeRawUnsafe('TRUNCATE TABLE "audit_logs"'),
    ).rejects.toThrow("append-only");
  });
});

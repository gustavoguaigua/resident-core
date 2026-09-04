import { Logger } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../src/platform/database/prisma.service.js";
import type { AuditTransaction } from "../src/modules/audit/audit-writer.port.js";
import {
  AUDIT_CATALOG,
  AuditContractError,
  prepareAuditRecord,
  type DomainAuditEvent,
  type ValidatedAuditContext,
} from "../src/modules/audit/domain-audit-event.js";
import { PrismaAuditWriter } from "../src/modules/audit/prisma-audit-writer.js";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const MEMBERSHIP_ID = "33333333-3333-4333-8333-333333333333";
const RESOURCE_ID = "44444444-4444-4444-8444-444444444444";

const userContext: ValidatedAuditContext = {
  tenantId: TENANT_ID,
  actor: {
    type: "USER",
    userProfileId: USER_ID,
    membershipId: MEMBERSHIP_ID,
  },
  traceId: "trace.phase3",
  correlationId: "correlation.phase3",
};

const tenantUpdated: DomainAuditEvent = {
  action: "tenant.updated",
  resourceId: RESOURCE_ID,
  metadata: { changedFields: ["timezone"] },
  occurredAt: new Date("2026-08-15T12:00:00.000Z"),
};

describe("Audit base contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("contains exactly the 69 canonical actions through Sprint 3 Phase 3", () => {
    expect(Object.keys(AUDIT_CATALOG)).toHaveLength(69);
    expect(AUDIT_CATALOG["authentication.denied"]).toMatchObject({
      category: "SECURITY",
      outcome: "DENIED",
      resourceType: "Authentication",
    });
    expect(AUDIT_CATALOG["tenant.created"]).toMatchObject({
      category: "TENANT",
      outcome: "SUCCESS",
      resourceType: "Tenant",
    });
    expect(AUDIT_CATALOG["person.identityLinked"]).toMatchObject({
      category: "TENANT",
      outcome: "SUCCESS",
      resourceType: "Person",
    });
    expect(AUDIT_CATALOG["lease.ended"]).toMatchObject({
      category: "TENANT",
      outcome: "SUCCESS",
      resourceType: "Lease",
    });
    expect(AUDIT_CATALOG["document.uploadFinalized"]).toMatchObject({
      actor: "USER",
      category: "SECURITY",
      outcome: "SUCCESS",
      resourceType: "SecureDocument",
    });
    expect(AUDIT_CATALOG["document.orphanReconciled"]).toMatchObject({
      actor: "SYSTEM",
      category: "SECURITY",
      outcome: "SUCCESS",
      resourceType: "SecureDocument",
    });
  });

  it("derives classification, target and actor fields from the contract", () => {
    expect(prepareAuditRecord(userContext, tenantUpdated)).toMatchObject({
      tenantId: TENANT_ID,
      actorType: "USER",
      actorUserProfileId: USER_ID,
      actorMembershipId: MEMBERSHIP_ID,
      action: "tenant.updated",
      category: "TENANT",
      outcome: "SUCCESS",
      resourceType: "Tenant",
      resourceId: RESOURCE_ID,
      metadata: { changedFields: ["timezone"] },
      traceId: "trace.phase3",
      correlationId: "correlation.phase3",
    });
  });

  it.each([
    ["unknown action", { ...tenantUpdated, action: "payment.created" }],
    ["missing target", { ...tenantUpdated, resourceId: undefined }],
    [
      "non-allowlisted metadata",
      {
        ...tenantUpdated,
        metadata: { changedFields: ["timezone"], email: "x" },
      },
    ],
    [
      "sensitive changed field",
      { ...tenantUpdated, metadata: { changedFields: ["accessToken"] } },
    ],
  ])("rejects %s fail-closed", (_label, event) => {
    expect(() =>
      prepareAuditRecord(userContext, event as DomainAuditEvent),
    ).toThrow(AuditContractError);
  });

  it("rejects unvalidated tenant and actor combinations", () => {
    expect(() =>
      prepareAuditRecord(
        { actor: { type: "ANONYMOUS" }, traceId: "trace.phase3" },
        tenantUpdated,
      ),
    ).toThrow(AuditContractError);

    expect(() =>
      prepareAuditRecord(
        {
          tenantId: TENANT_ID,
          actor: { type: "SYSTEM" },
          traceId: "trace.phase3",
        },
        tenantUpdated,
      ),
    ).toThrow(AuditContractError);
  });

  it("does not expose resource identifiers on denied events", () => {
    expect(() =>
      prepareAuditRecord(
        { actor: { type: "ANONYMOUS" }, traceId: "trace.phase3" },
        {
          action: "authentication.denied",
          resourceId: RESOURCE_ID,
          reasonCode: "INVALID_SUBJECT",
          occurredAt: new Date(),
        },
      ),
    ).toThrow(AuditContractError);
  });

  it("uses the caller transaction and fails when membership is cross-tenant", async () => {
    const create = vi.fn();
    const findFirst = vi.fn().mockResolvedValue(null);
    const transaction = {
      auditLog: { create },
      userTenantMembership: { findFirst },
    } as unknown as AuditTransaction;
    const writer = new PrismaAuditWriter({} as PrismaService);

    await expect(
      writer.recordConfirmed(transaction, userContext, tenantUpdated),
    ).rejects.toThrow("not valid for the tenant context");
    expect(create).not.toHaveBeenCalled();
  });

  it("keeps a denial fail-closed when durable audit persistence fails", async () => {
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    const prisma = {
      $transaction: vi
        .fn()
        .mockRejectedValue(new Error("database unavailable")),
    } as unknown as PrismaService;
    const writer = new PrismaAuditWriter(prisma);

    await expect(
      writer.recordDenied(
        { actor: { type: "ANONYMOUS" }, traceId: "trace.denied" },
        {
          action: "authentication.denied",
          reasonCode: "INVALID_SUBJECT",
          occurredAt: new Date(),
        },
      ),
    ).resolves.toEqual({ persisted: false });
  });

  it("rejects using the confirmed writer for a denial", async () => {
    const transaction = {
      auditLog: { create: vi.fn() },
      userTenantMembership: { findFirst: vi.fn() },
    } as unknown as AuditTransaction;
    const writer = new PrismaAuditWriter({} as PrismaService);

    await expect(
      writer.recordConfirmed(
        transaction,
        { actor: { type: "ANONYMOUS" }, traceId: "trace.denied" },
        {
          action: "authentication.denied",
          reasonCode: "INVALID_SUBJECT",
          occurredAt: new Date(),
        },
      ),
    ).rejects.toThrow("expected SUCCESS");
  });
});

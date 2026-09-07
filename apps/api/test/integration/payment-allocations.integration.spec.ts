import { randomUUID } from "node:crypto";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { PaymentAllocationsService } from "../../src/modules/payments/payment-allocations.service.js";
import type { PaymentActorContext } from "../../src/modules/payments/payments.contract.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const enabled = process.env.ALLOCATIONS_PHASE7_TEST === "1";
const prisma = new PrismaService();
const idempotency = new IdempotencyService(prisma);
const audit = new PrismaAuditWriter(prisma);
const service = new PaymentAllocationsService(prisma, idempotency, audit);
const permissions = [
  "payments.read",
  "payments.allocate",
  "payments.reverse",
  "payments.allocations.reverse",
] as const;
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = (label: string) => `phase7-${label}-${randomUUID()}`;

beforeAll(async () => {
  await prisma.$connect();
  await ensureSettings();
});
afterAll(async () => prisma.$disconnect());

describe
  .skipIf(!enabled)
  .sequential("Sprint 3 Phase 7 allocations and reversals", () => {
    it("allocates manually with derived totals and replays without duplicates", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["40.00", "60.00"],
        payment: "100.00",
      });
      const requestKey = key("manual");
      const body = {
        allocations: fixture.charges.map((charge) => ({
          amount: charge.effectiveAmount.toFixed(2),
          chargeId: charge.id,
        })),
      };
      const first = await service.allocate(
        fixture.actor,
        fixture.payment.id,
        requestKey,
        body,
        trace("manual"),
      );
      const replay = await service.allocate(
        fixture.actor,
        fixture.payment.id,
        requestKey,
        body,
        trace("manual-replay"),
      );

      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(first.responseBody.data).toMatchObject({
        allocatedAmount: "100.00",
        status: "ALLOCATED",
        unallocatedAmount: "0.00",
      });
      expect(
        await prisma.paymentAllocation.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(2);
      expect(
        await prisma.auditLog.count({
          where: {
            action: "paymentAllocation.created",
            tenantId: fixture.actor.tenantId,
          },
        }),
      ).toBe(2);
      expect(
        await prisma.charge.count({
          where: {
            id: { in: fixture.charges.map((charge) => charge.id) },
            status: "PAID",
          },
        }),
      ).toBe(2);
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          requestKey,
          {
            allocations: [{ amount: "1.00", chargeId: fixture.charges[0]!.id }],
          },
          trace("conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
    });

    it("auto-allocates deterministically by due date and leaves exact decimal balances", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["30.00", "40.00"],
        payment: "50.00",
      });
      const result = await service.autoAllocate(
        fixture.actor,
        fixture.payment.id,
        key("auto"),
        trace("auto"),
      );
      const allocations = (
        result.responseBody.data as {
          allocations: Array<{ amount: string; chargeId: string }>;
        }
      ).allocations;

      expect(allocations).toEqual([
        {
          ...allocations[0],
          amount: "30.00",
          chargeId: fixture.charges[0]!.id,
        },
        {
          ...allocations[1],
          amount: "20.00",
          chargeId: fixture.charges[1]!.id,
        },
      ]);
      expect(result.responseBody.data).toMatchObject({
        allocatedAmount: "50.00",
        status: "ALLOCATED",
        unallocatedAmount: "0.00",
      });
      expect(
        await prisma.charge.findUniqueOrThrow({
          where: { id: fixture.charges[1]!.id },
        }),
      ).toMatchObject({ status: "PARTIALLY_PAID" });
    });

    it("reverses one allocation and then a payment append-only", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["75.00"],
        payment: "75.00",
      });
      const allocated = await service.allocate(
        fixture.actor,
        fixture.payment.id,
        key("allocate-before-reverse"),
        {
          allocations: [{ amount: "75.00", chargeId: fixture.charges[0]!.id }],
        },
        trace("allocate-before-reverse"),
      );
      const allocationId = (
        allocated.responseBody.data as { allocations: Array<{ id: string }> }
      ).allocations[0]!.id;
      await service.reverseAllocation(
        fixture.actor,
        allocationId,
        key("reverse-allocation"),
        { reason: "DUPLICATE_ALLOCATION" },
        trace("reverse-allocation"),
      );
      expect(
        await prisma.paymentAllocation.findUniqueOrThrow({
          where: { id: allocationId },
        }),
      ).toMatchObject({ status: "REVERSED" });
      expect(
        await prisma.paymentAllocationReversal.count({
          where: { allocationId },
        }),
      ).toBe(1);

      await service.allocate(
        fixture.actor,
        fixture.payment.id,
        key("reallocate"),
        {
          allocations: [{ amount: "75.00", chargeId: fixture.charges[0]!.id }],
        },
        trace("reallocate"),
      );
      await service.reversePayment(
        fixture.actor,
        fixture.payment.id,
        key("reverse-payment"),
        { reason: "RETURNED_PAYMENT" },
        trace("reverse-payment"),
      );
      expect(
        await prisma.payment.findUniqueOrThrow({
          where: { id: fixture.payment.id },
        }),
      ).toMatchObject({ status: "REVERSED" });
      expect(
        await prisma.paymentReversal.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(1);
      expect(
        await prisma.paymentAllocation.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(2);
      expect(
        await prisma.paymentAllocationReversal.count({
          where: { tenantId: fixture.actor.tenantId },
        }),
      ).toBe(2);
    });

    it("fails closed for permissions, tenant boundaries, settings and currency", async () => {
      const fixture = await createFixture([], {
        charges: ["10.00"],
        payment: "10.00",
      });
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          key("denied"),
          {
            allocations: [
              { amount: "10.00", chargeId: fixture.charges[0]!.id },
            ],
          },
          trace("denied"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });

      const authorized = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      await expect(
        service.get(
          authorized.actor,
          randomUUID(),
          trace("cross-tenant-hidden"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
      await prisma.tenant.update({
        data: { currency: "EUR" },
        where: { id: authorized.actor.tenantId },
      });
      await expect(
        service.autoAllocate(
          authorized.actor,
          authorized.payment.id,
          key("currency"),
          trace("currency"),
        ),
      ).rejects.toMatchObject({ code: "UNSUPPORTED_TENANT_CURRENCY" });
      expect(
        await prisma.paymentAllocation.count({
          where: { paymentId: authorized.payment.id },
        }),
      ).toBe(0);
    });

    it("rolls back allocation, Audit and ledger when Audit fails", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["15.00"],
        payment: "15.00",
      });
      const failingAudit: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("synthetic audit failure");
        },
        recordDenied: async () => ({ persisted: true }),
      };
      const failing = new PaymentAllocationsService(
        prisma,
        idempotency,
        failingAudit,
      );
      const requestKey = key("audit-rollback");
      await expect(
        failing.allocate(
          fixture.actor,
          fixture.payment.id,
          requestKey,
          {
            allocations: [
              { amount: "15.00", chargeId: fixture.charges[0]!.id },
            ],
          },
          trace("audit-rollback"),
        ),
      ).rejects.toThrow("synthetic audit failure");
      expect(
        await prisma.paymentAllocation.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(0);
      expect(
        await prisma.idempotencyOperation.count({
          where: { keyHash: { not: "" }, tenantId: fixture.actor.tenantId },
        }),
      ).toBe(0);
    });

    it("enforces settings, amount limits and preserves decimal invariants", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["20.00"],
        payment: "25.00",
      });
      await prisma.settingDefinition.update({
        data: { defaultValue: false },
        where: { key: "financial.partialPaymentsAllowed" },
      });
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          key("partial-disabled"),
          {
            allocations: [
              { amount: "10.00", chargeId: fixture.charges[0]!.id },
            ],
          },
          trace("partial-disabled"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      await prisma.settingDefinition.update({
        data: { defaultValue: true },
        where: { key: "financial.partialPaymentsAllowed" },
      });
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          key("exceeds-charge"),
          {
            allocations: [
              { amount: "20.01", chargeId: fixture.charges[0]!.id },
            ],
          },
          trace("exceeds-charge"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          key("scale"),
          {
            allocations: [
              { amount: "1.001", chargeId: fixture.charges[0]!.id },
            ],
          },
          trace("scale"),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      await prisma.settingDefinition.update({
        data: { defaultValue: false },
        where: { key: "financial.autoAllocationEnabled" },
      });
      await expect(
        service.autoAllocate(
          fixture.actor,
          fixture.payment.id,
          key("auto-disabled"),
          trace("auto-disabled"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      await prisma.settingDefinition.update({
        data: { defaultValue: true },
        where: { key: "financial.autoAllocationEnabled" },
      });
      expect(
        await prisma.paymentAllocation.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(0);
    });

    it("reverses an unallocated payment exactly once and replays the result", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      const requestKey = key("unallocated-reversal");
      const first = await service.reversePayment(
        fixture.actor,
        fixture.payment.id,
        requestKey,
        { reason: "RETURNED_PAYMENT" },
        trace("unallocated-reversal"),
      );
      const replay = await service.reversePayment(
        fixture.actor,
        fixture.payment.id,
        requestKey,
        { reason: "RETURNED_PAYMENT" },
        trace("unallocated-reversal-replay"),
      );
      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(first.responseBody.data).toMatchObject({
        allocatedAmount: "0.00",
        status: "REVERSED",
        unallocatedAmount: "0.00",
      });
      expect(
        await prisma.paymentReversal.count({
          where: { paymentId: fixture.payment.id },
        }),
      ).toBe(1);
      expect(
        await prisma.auditLog.count({
          where: {
            action: "payment.reversed",
            resourceId: fixture.payment.id,
          },
        }),
      ).toBe(1);
    });

    it("rejects cross-tenant and cross-unit relations at the database boundary", async () => {
      const first = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      const second = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      await expect(
        prisma.paymentAllocation.create({
          data: {
            allocatedBy: first.actor.userProfileId,
            amount: "1.00",
            chargeId: second.charges[0]!.id,
            currency: "USD",
            paymentId: first.payment.id,
            propertyUnitId: first.payment.propertyUnitId,
            tenantId: first.actor.tenantId,
          },
        }),
      ).rejects.toMatchObject({ code: "P2003" });

      const otherUnit = await prisma.propertyUnit.create({
        data: {
          code: randomUUID(),
          status: "ACTIVE",
          tenantId: first.actor.tenantId,
        },
      });
      const crossUnitCharge = await prisma.charge.create({
        data: {
          billingPeriodId: first.charges[0]!.billingPeriodId,
          chargeConceptId: first.charges[0]!.chargeConceptId,
          dueDate: first.charges[0]!.dueDate,
          effectiveAmount: "10.00",
          issuedDate: first.charges[0]!.issuedDate,
          originalAmount: "10.00",
          propertyUnitId: otherUnit.id,
          status: "ISSUED",
          tenantId: first.actor.tenantId,
          type: "ORDINARY",
        },
      });
      await expect(
        prisma.paymentAllocation.create({
          data: {
            allocatedBy: first.actor.userProfileId,
            amount: "1.00",
            chargeId: crossUnitCharge.id,
            currency: "USD",
            paymentId: first.payment.id,
            propertyUnitId: first.payment.propertyUnitId,
            tenantId: first.actor.tenantId,
          },
        }),
      ).rejects.toMatchObject({ code: "P2003" });
    });

    it("enforces idempotency actor, tenant, missing-key and in-progress semantics", async () => {
      const fixture = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      const body = {
        allocations: [{ amount: "10.00", chargeId: fixture.charges[0]!.id }],
      };
      await expect(
        service.allocate(
          fixture.actor,
          fixture.payment.id,
          undefined,
          body,
          trace("missing-key"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });

      const requestKey = key("actor-bound");
      await service.allocate(
        fixture.actor,
        fixture.payment.id,
        requestKey,
        body,
        trace("actor-bound"),
      );
      const otherActor = await createActorForTenant(
        fixture.actor.tenantId,
        permissions,
      );
      await expect(
        service.allocate(
          otherActor,
          fixture.payment.id,
          requestKey,
          body,
          trace("other-actor"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });

      const otherTenant = await createFixture(permissions, {
        charges: ["10.00"],
        payment: "10.00",
      });
      await expect(
        service.allocate(
          otherTenant.actor,
          otherTenant.payment.id,
          requestKey,
          {
            allocations: [
              { amount: "10.00", chargeId: otherTenant.charges[0]!.id },
            ],
          },
          trace("other-tenant"),
        ),
      ).resolves.toMatchObject({ replayed: false });

      let release: (() => void) | undefined;
      const hold = new Promise<void>((resolve) => {
        release = resolve;
      });
      const concurrent = {
        actor: fixture.actor,
        body: {},
        key: key("concurrent"),
        method: "POST" as const,
        operationType: "payments.allocate.concurrent",
        path: { paymentId: fixture.payment.id },
      };
      const pending = idempotency.execute(
        concurrent,
        async () => undefined,
        async () => {
          await hold;
          return { httpStatus: 200, responseBody: { ok: true } };
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      await expect(
        idempotency.execute(
          concurrent,
          async () => undefined,
          async () => ({ httpStatus: 200, responseBody: { ok: true } }),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_OPERATION_IN_PROGRESS" });
      release?.();
      await pending;
    });
  });

async function ensureSettings() {
  const bootstrapUser = await prisma.userProfile.create({
    data: {
      displayName: "Phase Seven Settings",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  for (const [settingKey, defaultValue] of [
    ["financial.partialPaymentsAllowed", true],
    ["financial.overpaymentsAllowed", false],
    ["financial.autoAllocationEnabled", true],
  ] as const)
    await prisma.settingDefinition.upsert({
      create: {
        category: "FINANCIAL",
        createdBy: bootstrapUser.id,
        defaultValue,
        key: settingKey,
        schema: { type: "boolean" },
        status: "ACTIVE",
        valueType: "BOOLEAN",
      },
      update: { defaultValue },
      where: { key: settingKey },
    });
}

async function createFixture(
  codes: readonly string[],
  amounts: { charges: readonly string[]; payment: string },
) {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase Seven User",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      currency: "USD",
      name: `Tenant ${randomUUID()}`,
      slug: `phase7-${randomUUID()}`,
      status: "ACTIVE",
    },
  });
  const membership = await prisma.userTenantMembership.create({
    data: {
      joinedAt: new Date(),
      status: "ACTIVE",
      tenantId: tenant.id,
      userProfileId: user.id,
    },
  });
  const role = await prisma.role.create({
    data: {
      code: `Phase7-${randomUUID()}`,
      name: "Phase 7",
      scope: "TENANT",
      tenantId: tenant.id,
    },
  });
  for (const code of codes) {
    const permission = await prisma.permission.upsert({
      create: {
        action: code.split(".").at(-1) ?? code,
        code,
        module: code.split(".")[0] ?? code,
      },
      update: {},
      where: { code },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: role.id },
    });
  }
  await prisma.membershipRole.create({
    data: { membershipId: membership.id, roleId: role.id },
  });
  const unit = await prisma.propertyUnit.create({
    data: { code: randomUUID(), status: "ACTIVE", tenantId: tenant.id },
  });
  const period = await prisma.billingPeriod.create({
    data: {
      dueDate: new Date("2026-10-15"),
      endsAt: new Date("2026-10-31"),
      periodCode: "2026-10",
      startsAt: new Date("2026-10-01"),
      status: "OPEN",
      tenantId: tenant.id,
    },
  });
  const concept = await prisma.chargeConcept.create({
    data: {
      code: randomUUID(),
      name: "Phase Seven Charge",
      status: "ACTIVE",
      tenantId: tenant.id,
    },
  });
  const charges = [];
  for (const [index, amount] of amounts.charges.entries())
    charges.push(
      await prisma.charge.create({
        data: {
          billingPeriodId: period.id,
          chargeConceptId: concept.id,
          dueDate: new Date(`2026-10-${String(10 + index).padStart(2, "0")}`),
          effectiveAmount: amount,
          issuedDate: new Date("2026-10-01"),
          originalAmount: amount,
          propertyUnitId: unit.id,
          status: "ISSUED",
          tenantId: tenant.id,
          type: "ORDINARY",
        },
      }),
    );
  const payment = await prisma.payment.create({
    data: {
      allocatedAmount: "0.00",
      amount: amounts.payment,
      confirmedAt: new Date(),
      confirmedBy: user.id,
      createdBy: user.id,
      method: "BANK_TRANSFER",
      paidAt: new Date(),
      propertyUnitId: unit.id,
      status: "CONFIRMED",
      tenantId: tenant.id,
      unallocatedAmount: amounts.payment,
    },
  });
  return {
    actor: {
      membershipId: membership.id,
      tenantId: tenant.id,
      userProfileId: user.id,
    } satisfies PaymentActorContext,
    charges,
    payment,
  };
}

async function createActorForTenant(
  tenantId: string,
  codes: readonly string[],
): Promise<PaymentActorContext> {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase Seven Alternate User",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  const membership = await prisma.userTenantMembership.create({
    data: {
      joinedAt: new Date(),
      status: "ACTIVE",
      tenantId,
      userProfileId: user.id,
    },
  });
  const role = await prisma.role.create({
    data: {
      code: `Phase7-${randomUUID()}`,
      name: "Phase 7 alternate",
      scope: "TENANT",
      tenantId,
    },
  });
  for (const code of codes) {
    const permission = await prisma.permission.findUniqueOrThrow({
      where: { code },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: role.id },
    });
  }
  await prisma.membershipRole.create({
    data: { membershipId: membership.id, roleId: role.id },
  });
  return {
    membershipId: membership.id,
    tenantId,
    userProfileId: user.id,
  };
}

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountStatementsService } from "../../src/modules/account-statements/account-statements.service.js";
import type { StatementActorContext } from "../../src/modules/account-statements/account-statements.contract.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.FINANCIAL_PHASE8_TEST === "1";
const prisma = new PrismaService();
const service = new AccountStatementsService(
  prisma,
  new IdempotencyService(prisma),
  new PrismaAuditWriter(prisma),
);
const key = () => `financial-${randomUUID()}`;
const trace = () => `phase8-financial-${randomUUID()}`;
beforeAll(async () => prisma.$connect());
afterAll(async () => prisma.$disconnect());

describe
  .skipIf(!enabled)
  .sequential("Sprint 3 Phase 8 financial projection", () => {
    it("reconstructs decimal debits, credits, outstanding and unallocated balances", async () => {
      const f = await fixture();
      const movements = (
        await service.movements(f.actor, f.unit.id, trace(), false)
      ).data as Array<{ type: string; debit: string; credit: string }>;
      expect(movements.map((v) => [v.type, v.debit, v.credit])).toEqual([
        ["CHARGE", "100.00", "0.00"],
        ["CHARGE_ADJUSTMENT", "10.00", "0.00"],
        ["CHARGE_ADJUSTMENT", "0.00", "5.00"],
        ["PAYMENT_ALLOCATION", "0.00", "40.00"],
      ]);
      const result = await service.recalculate(
        f.actor,
        f.unit.id,
        key(),
        { asOfDate: "2026-10-31" },
        trace(),
      );
      expect(result.responseBody.data).toMatchObject({
        creditBalance: "20.00",
        notDueBalance: "0.00",
        outstandingBalance: "65.00",
        overdueBalance: "65.00",
        unallocatedPaymentBalance: "20.00",
      });
    });
    it("does not double count allocation and payment reversals", async () => {
      const f = await fixture();
      const allocation = await prisma.paymentAllocation.findFirstOrThrow({
        where: { tenantId: f.tenant.id },
      });
      await prisma.paymentAllocation.update({
        data: { status: "REVERSED" },
        where: { id: allocation.id },
      });
      await prisma.paymentAllocationReversal.create({
        data: {
          allocationId: allocation.id,
          amount: allocation.amount,
          currency: "USD",
          reason: "REVERSAL",
          reversedBy: f.user.id,
          tenantId: f.tenant.id,
        },
      });
      const payment = await prisma.payment.findFirstOrThrow({
        where: { tenantId: f.tenant.id },
      });
      await prisma.payment.update({
        data: {
          allocatedAmount: "0.00",
          status: "REVERSED",
          unallocatedAmount: "0.00",
        },
        where: { id: payment.id },
      });
      await prisma.paymentReversal.create({
        data: {
          amount: payment.amount,
          currency: "USD",
          paymentId: payment.id,
          reason: "REVERSAL",
          reversedBy: f.user.id,
          tenantId: f.tenant.id,
        },
      });
      const movements = (
        await service.movements(f.actor, f.unit.id, trace(), false)
      ).data as Array<{ type: string }>;
      expect(
        movements.filter((v) => v.type === "PAYMENT_ALLOCATION_REVERSAL"),
      ).toHaveLength(1);
      expect(movements).toHaveLength(5);
    });
    it("persists matching cache and immutable snapshot with a hidden fingerprint", async () => {
      const f = await fixture();
      const result = await service.recalculate(
        f.actor,
        f.unit.id,
        key(),
        { asOfDate: "2026-10-31" },
        trace(),
      );
      expect(JSON.stringify(result.responseBody)).not.toContain("sourceHash");
      const balance = await prisma.unitBalance.findFirstOrThrow({
        where: { tenantId: f.tenant.id },
      });
      const snapshot = await prisma.balanceSnapshot.findFirstOrThrow({
        where: { tenantId: f.tenant.id },
      });
      expect(snapshot.sourceHash).toBe(balance.sourceHash);
      expect(snapshot.outstandingBalance.eq(balance.outstandingBalance)).toBe(
        true,
      );
      expect(
        await prisma.auditLog.count({
          where: { action: "balance.recalculated", tenantId: f.tenant.id },
        }),
      ).toBe(1);
      const charge = await prisma.charge.findFirstOrThrow({
        where: { tenantId: f.tenant.id },
      });
      await prisma.chargeAdjustment.create({
        data: {
          amount: "1.00",
          chargeId: charge.id,
          createdBy: f.user.id,
          effectiveDate: new Date("2026-08-06"),
          reason: "SOURCE_CHANGED",
          tenantId: f.tenant.id,
          type: "INCREASE",
        },
      });
      expect(
        await prisma.unitBalance.findUniqueOrThrow({
          where: { id: balance.id },
        }),
      ).toMatchObject({ isStale: true });
    });
    it("rejects unsupported tenant currency before writing", async () => {
      const f = await fixture();
      await prisma.$executeRaw`ALTER TYPE "currency_code" ADD VALUE IF NOT EXISTS 'EUR'`;
      await prisma.$executeRawUnsafe(
        `UPDATE "tenants" SET "currency"='EUR' WHERE "id"='${f.tenant.id}'`,
      );
      await expect(
        service.recalculate(
          f.actor,
          f.unit.id,
          key(),
          { asOfDate: "2026-10-31" },
          trace(),
        ),
      ).rejects.toMatchObject({ code: "UNSUPPORTED_TENANT_CURRENCY" });
      expect(
        await prisma.unitBalance.count({ where: { tenantId: f.tenant.id } }),
      ).toBe(0);
    });
  });

async function fixture() {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Financial User",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      currency: "USD",
      name: `Tenant ${randomUUID()}`,
      slug: `financial-${randomUUID()}`,
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
      code: `Financial-${randomUUID()}`,
      name: "Financial",
      scope: "TENANT",
      tenantId: tenant.id,
    },
  });
  for (const code of ["balances.recalculate", "financialMovements.read"]) {
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
  const unit = await prisma.propertyUnit.create({
    data: { code: randomUUID(), status: "ACTIVE", tenantId: tenant.id },
  });
  const period = await prisma.billingPeriod.create({
    data: {
      dueDate: new Date("2026-08-15"),
      endsAt: new Date("2026-08-31"),
      periodCode: "2026-08",
      startsAt: new Date("2026-08-01"),
      status: "OPEN",
      tenantId: tenant.id,
    },
  });
  const concept = await prisma.chargeConcept.create({
    data: {
      code: randomUUID(),
      name: "Financial Charge",
      status: "ACTIVE",
      tenantId: tenant.id,
    },
  });
  const charge = await prisma.charge.create({
    data: {
      billingPeriodId: period.id,
      chargeConceptId: concept.id,
      dueDate: new Date("2026-08-15"),
      effectiveAmount: "105.00",
      issuedDate: new Date("2026-08-01"),
      originalAmount: "100.00",
      propertyUnitId: unit.id,
      status: "PARTIALLY_PAID",
      tenantId: tenant.id,
      type: "ORDINARY",
    },
  });
  await prisma.chargeAdjustment.createMany({
    data: [
      {
        amount: "10.00",
        chargeId: charge.id,
        createdBy: user.id,
        effectiveDate: new Date("2026-08-02"),
        reason: "INCREASE",
        tenantId: tenant.id,
        type: "INCREASE",
      },
      {
        amount: "5.00",
        chargeId: charge.id,
        createdBy: user.id,
        effectiveDate: new Date("2026-08-03"),
        reason: "DECREASE",
        tenantId: tenant.id,
        type: "DECREASE",
      },
    ],
  });
  const payment = await prisma.payment.create({
    data: {
      allocatedAmount: "40.00",
      amount: "60.00",
      confirmedAt: new Date(),
      confirmedBy: user.id,
      createdBy: user.id,
      method: "BANK_TRANSFER",
      paidAt: new Date("2026-08-04"),
      propertyUnitId: unit.id,
      status: "PARTIALLY_ALLOCATED",
      tenantId: tenant.id,
      unallocatedAmount: "20.00",
    },
  });
  await prisma.paymentAllocation.create({
    data: {
      allocatedBy: user.id,
      allocatedAt: new Date("2026-08-05"),
      amount: "40.00",
      chargeId: charge.id,
      currency: "USD",
      paymentId: payment.id,
      propertyUnitId: unit.id,
      status: "ACTIVE",
      tenantId: tenant.id,
    },
  });
  return {
    actor: {
      membershipId: membership.id,
      tenantId: tenant.id,
      userProfileId: user.id,
    } satisfies StatementActorContext,
    tenant,
    unit,
    user,
  };
}

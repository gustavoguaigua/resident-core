import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { ChargeLifecycleService } from "../../src/modules/dues-fees/charge-lifecycle.service.js";
import type { DuesActorContext } from "../../src/modules/dues-fees/dues-fees.contract.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.CHARGES_PHASE5_TEST === "1";
const prisma = new PrismaService();
const idempotency = new IdempotencyService(prisma);
const audit = new PrismaAuditWriter(prisma);
const service = new ChargeLifecycleService(prisma, idempotency, audit);
const permissions = [
  "billingPeriods.close",
  "billingPeriods.lock",
  "fees.generate",
  "fees.readBatches",
  "charges.read",
  "charges.create",
  "charges.cancel",
  "charges.adjust",
  "charges.reverse",
  "charges.read.own",
] as const;
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = (label: string) => `phase5-${label}-${randomUUID()}`;

beforeAll(async () => prisma.$connect());
afterAll(async () => prisma.$disconnect());

describe
  .skipIf(!enabled)
  .sequential("Sprint 3 Phase 5 charge lifecycle", () => {
    it("generates a complete batch atomically and replays without duplicates", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 2);
      const requestKey = key("generate");
      const body = { billingPeriodId: base.period.id };
      const first = await service.generateMonthly(
        actor,
        requestKey,
        body,
        trace("generate"),
      );
      const replay = await service.generateMonthly(
        actor,
        requestKey,
        body,
        trace("replay"),
      );
      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(first.responseBody.data).toMatchObject({
        status: "COMPLETED",
        totalItems: 2,
        successItems: 2,
        skippedItems: 0,
        failedItems: 0,
      });
      expect(
        await prisma.charge.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(2);
      expect(
        await prisma.chargeBatch.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(1);
      expect(
        await prisma.auditLog.count({
          where: { action: "charge.created", tenantId: actor.tenantId },
        }),
      ).toBe(2);
    });

    it("enforces ledger conflicts, missing keys, concurrency and natural-key reconciliation", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 1);
      await prisma.charge.create({
        data: {
          billingPeriodId: base.period.id,
          chargeConceptId: base.concept.id,
          dueDate: base.period.dueDate,
          effectiveAmount: "25.50",
          feeScheduleId: base.schedule.id,
          issuedDate: base.period.startsAt,
          originalAmount: "25.50",
          propertyUnitId: base.units[0]!.id,
          status: "ISSUED",
          tenantId: actor.tenantId,
          type: "ORDINARY",
        },
      });
      const requestKey = key("skip");
      const result = await service.generateMonthly(
        actor,
        requestKey,
        { billingPeriodId: base.period.id },
        trace("skip"),
      );
      expect(result.responseBody.data).toMatchObject({
        failedItems: 0,
        skippedItems: 1,
        successItems: 0,
      });
      await prisma.feeSchedule.update({
        data: { amount: "26.00" },
        where: { id: base.schedule.id },
      });
      const incompatible = await service.generateMonthly(
        actor,
        key("financial-conflict"),
        { billingPeriodId: base.period.id },
        trace("financial-conflict"),
      );
      expect(incompatible.responseBody.data).toMatchObject({
        failedItems: 1,
        status: "COMPLETED_WITH_ERRORS",
        errorSummary: {
          codes: [{ code: "CHARGE_FINANCIAL_CONFLICT", count: 1 }],
        },
      });
      await expect(
        service.generateMonthly(
          actor,
          requestKey,
          { billingPeriodId: base.period.id, feeScheduleId: randomUUID() },
          trace("payload-conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      const otherActor = await createActor(permissions, actor.tenantId);
      await expect(
        service.generateMonthly(
          otherActor,
          requestKey,
          { billingPeriodId: base.period.id },
          trace("actor-conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      await expect(
        service.generateMonthly(
          actor,
          undefined,
          { billingPeriodId: base.period.id },
          trace("missing-key"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });

      let release: (() => void) | undefined;
      const hold = new Promise<void>((resolve) => {
        release = resolve;
      });
      const concurrent = {
        actor,
        body: { billingPeriodId: base.period.id },
        key: key("concurrent"),
        method: "POST" as const,
        operationType: "charges.generateMonthly.concurrent",
        path: {},
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

    it("uses savepoints for recoverable items and emits only sanitized aggregate errors", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 2);
      await prisma.propertyUnit.update({
        data: { status: "INACTIVE" },
        where: { id: base.units[1]!.id },
      });
      const result = await service.generateMonthly(
        actor,
        key("partial"),
        { billingPeriodId: base.period.id },
        trace("partial"),
      );
      expect(result.responseBody.data).toMatchObject({
        status: "COMPLETED_WITH_ERRORS",
        totalItems: 2,
        successItems: 1,
        skippedItems: 0,
        failedItems: 1,
        errorSummary: { codes: [{ code: "PROPERTY_UNIT_INACTIVE", count: 1 }] },
      });
      expect(JSON.stringify(result.responseBody)).not.toContain(
        base.units[1]!.id,
      );
      expect(
        await prisma.charge.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(1);
    });

    it("supports manual issue, append-only adjustments, draft cancellation and one reversal", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 1);
      const created = await service.createCharge(
        actor,
        key("manual"),
        {
          amount: "40.25",
          billingPeriodId: base.period.id,
          chargeConceptId: base.concept.id,
          dueDate: "2026-09-20",
          issuedDate: "2026-09-05",
          propertyUnitId: base.units[0]!.id,
          type: "manual",
        },
        trace("manual"),
      );
      const chargeId = (created.responseBody.data as { id: string }).id;
      await service.adjustCharge(
        actor,
        chargeId,
        key("increase"),
        {
          amount: "10.25",
          effectiveDate: "2026-09-10",
          reason: "Approved correction",
          type: "increase",
        },
        trace("increase"),
      );
      await service.adjustCharge(
        actor,
        chargeId,
        key("decrease"),
        {
          amount: "5.50",
          effectiveDate: "2026-09-11",
          reason: "Approved correction",
          type: "decrease",
        },
        trace("decrease"),
      );
      const before = await prisma.charge.findUniqueOrThrow({
        where: { id: chargeId },
      });
      expect(String(before.originalAmount)).toBe("40.25");
      expect(String(before.effectiveAmount)).toBe("45");
      await expect(
        service.adjustCharge(
          actor,
          chargeId,
          key("negative"),
          {
            amount: "50",
            effectiveDate: "2026-09-12",
            reason: "Invalid",
            type: "decrease",
          },
          trace("negative"),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      await service.reverseCharge(
        actor,
        chargeId,
        key("reverse"),
        { effectiveDate: "2026-09-13", reason: "Approved reversal" },
        trace("reverse"),
      );
      await expect(
        service.reverseCharge(
          actor,
          chargeId,
          key("reverse-again"),
          { effectiveDate: "2026-09-13", reason: "Again" },
          trace("reverse-again"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      const draft = await prisma.charge.create({
        data: {
          billingPeriodId: base.period.id,
          chargeConceptId: base.concept.id,
          dueDate: base.period.dueDate,
          effectiveAmount: "12.00",
          issuedDate: base.period.startsAt,
          originalAmount: "12.00",
          propertyUnitId: base.units[0]!.id,
          tenantId: actor.tenantId,
          type: "OTHER",
        },
      });
      await service.cancelCharge(
        actor,
        draft.id,
        key("cancel"),
        { reason: "Draft withdrawn" },
        trace("cancel"),
      );
      expect(await prisma.chargeAdjustment.count({ where: { chargeId } })).toBe(
        2,
      );
      expect(await prisma.chargeReversal.count({ where: { chargeId } })).toBe(
        1,
      );
    });

    it("closes and locks periods while rejecting invalid transitions and closed-period charges", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 1);
      await service.closePeriod(
        actor,
        base.period.id,
        key("close"),
        { reason: "Month complete" },
        trace("close"),
      );
      await service.lockPeriod(
        actor,
        base.period.id,
        key("lock"),
        { reason: "Approved close" },
        trace("lock"),
      );
      await expect(
        service.lockPeriod(
          actor,
          base.period.id,
          key("lock2"),
          { reason: "Again" },
          trace("lock2"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
      await expect(
        service.createCharge(
          actor,
          key("closed"),
          {
            amount: "10",
            billingPeriodId: base.period.id,
            chargeConceptId: base.concept.id,
            dueDate: "2026-09-20",
            issuedDate: "2026-09-05",
            propertyUnitId: base.units[0]!.id,
            type: "manual",
          },
          trace("closed"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
    });

    it("fails closed for permissions, currency, cross-tenant IDs and own access", async () => {
      const denied = await createActor([]);
      await expect(
        service.listCharges(denied, { page: 1, pageSize: 20 }, trace("denied")),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 1);
      const owner = await prisma.person.create({
        data: {
          displayName: "Owner",
          tenantId: actor.tenantId,
          userProfileId: actor.userProfileId,
        },
      });
      await prisma.propertyOwnership.create({
        data: {
          personId: owner.id,
          propertyUnitId: base.units[0]!.id,
          startDate: new Date("2026-01-01"),
          tenantId: actor.tenantId,
        },
      });
      await service.generateMonthly(
        actor,
        key("own-generate"),
        { billingPeriodId: base.period.id },
        trace("own-generate"),
      );
      await expect(
        service.listOwnCharges(
          actor,
          { page: 1, pageSize: 20, propertyUnitId: base.units[0]!.id },
          trace("own"),
          true,
        ),
      ).resolves.toMatchObject({ meta: { total: 1 } });
      const outsider = await createActor(permissions);
      const foreign = await createFoundation(outsider, 1);
      await expect(
        service.getCharge(
          actor,
          (
            await prisma.charge.create({
              data: {
                billingPeriodId: foreign.period.id,
                chargeConceptId: foreign.concept.id,
                dueDate: foreign.period.dueDate,
                effectiveAmount: "1",
                issuedDate: foreign.period.startsAt,
                originalAmount: "1",
                propertyUnitId: foreign.units[0]!.id,
                status: "ISSUED",
                tenantId: outsider.tenantId,
                type: "MANUAL",
              },
            })
          ).id,
          trace("cross"),
        ),
      ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
      await prisma.tenant.update({
        data: { currency: "EUR" },
        where: { id: actor.tenantId },
      });
      await expect(
        service.generateMonthly(
          actor,
          key("eur"),
          { billingPeriodId: base.period.id },
          trace("eur"),
        ),
      ).rejects.toMatchObject({ code: "UNSUPPORTED_TENANT_CURRENCY" });
    });

    it("rolls back batch, charges, Audit and ledger on fatal Audit failure", async () => {
      const actor = await createActor(permissions);
      const base = await createFoundation(actor, 1);
      let writes = 0;
      const failingAudit: AuditWriterPort = {
        recordConfirmed: async () => {
          writes += 1;
          if (writes === 2) throw new Error("Synthetic audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failing = new ChargeLifecycleService(
        prisma,
        idempotency,
        failingAudit,
      );
      await expect(
        failing.generateMonthly(
          actor,
          key("audit-fail"),
          { billingPeriodId: base.period.id },
          trace("audit-fail"),
        ),
      ).rejects.toThrow("Synthetic audit failure");
      expect(
        await prisma.chargeBatch.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(0);
      expect(
        await prisma.charge.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(0);
      expect(
        await prisma.idempotencyOperation.count({
          where: {
            operationType: "charges.generateMonthly",
            tenantId: actor.tenantId,
          },
        }),
      ).toBe(0);
    });
  });

async function createFoundation(actor: DuesActorContext, units: number) {
  const period = await prisma.billingPeriod.create({
    data: {
      dueDate: new Date("2026-09-20"),
      endsAt: new Date("2026-09-30"),
      periodCode: `2026-${String((await prisma.billingPeriod.count({ where: { tenantId: actor.tenantId } })) + 9).padStart(2, "0")}`,
      startsAt: new Date("2026-09-01"),
      tenantId: actor.tenantId,
    },
  });
  const concept = await prisma.chargeConcept.create({
    data: {
      code: `C-${randomUUID()}`,
      name: "Monthly",
      tenantId: actor.tenantId,
    },
  });
  const schedule = await prisma.feeSchedule.create({
    data: {
      amount: "25.50",
      chargeConceptId: concept.id,
      effectiveFrom: new Date("2026-01-01"),
      name: `S-${randomUUID()}`,
      tenantId: actor.tenantId,
    },
  });
  const createdUnits = [];
  for (let index = 0; index < units; index += 1) {
    const unit = await prisma.propertyUnit.create({
      data: { code: `U-${randomUUID()}`, tenantId: actor.tenantId },
    });
    createdUnits.push(unit);
    await prisma.unitFeeAssignment.create({
      data: {
        feeScheduleId: schedule.id,
        propertyUnitId: unit.id,
        startDate: new Date("2026-01-01"),
        tenantId: actor.tenantId,
      },
    });
  }
  return { concept, period, schedule, units: createdUnits };
}

async function createActor(
  permissionCodes: readonly string[],
  tenantId?: string,
): Promise<DuesActorContext> {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase 5 Actor",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
      userType: "HUMAN",
    },
  });
  const tenant =
    tenantId === undefined
      ? await prisma.tenant.create({
          data: {
            currency: "USD",
            name: "Phase 5 Tenant",
            slug: `phase5-${randomUUID()}`,
            status: "ACTIVE",
          },
        })
      : await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
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
      code: `Phase5-${randomUUID()}`,
      name: "Phase 5 Role",
      scope: "TENANT",
      tenantId: tenant.id,
    },
  });
  for (const code of permissionCodes) {
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
    tenantId: tenant.id,
    userProfileId: user.id,
  };
}

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import type { DuesActorContext } from "../../src/modules/dues-fees/dues-fees.contract.js";
import { DuesFeesService } from "../../src/modules/dues-fees/dues-fees.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.DUES_PHASE4_TEST === "1";
const prisma = new PrismaService();
const audit = new PrismaAuditWriter(prisma);
const idempotency = new IdempotencyService(prisma);
const service = new DuesFeesService(prisma, idempotency, audit);
const permissions = [
  "chargeConcepts.read",
  "chargeConcepts.create",
  "chargeConcepts.update",
  "chargeConcepts.archive",
  "feeSchedules.read",
  "feeSchedules.create",
  "feeSchedules.update",
  "feeSchedules.archive",
  "unitFees.read",
  "unitFees.assign",
  "unitFees.end",
  "billingPeriods.read",
  "billingPeriods.create",
] as const;
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = (label: string) => `phase4-${label}-${randomUUID()}`;

beforeAll(async () => prisma.$connect());
afterAll(async () => prisma.$disconnect());

describe.skipIf(!enabled).sequential("Sprint 3 Phase 4 dues foundation", () => {
  it("executes the four resource lifecycles with USD Decimal snapshots and durable Audit", async () => {
    const actor = await createActor(permissions);
    const conceptResult = await service.createChargeConcept(
      actor,
      key("concept"),
      {
        code: `DUES-${randomUUID()}`,
        defaultAmount: "25.50",
        name: "Monthly dues",
      },
      trace("concept"),
    );
    const concept = conceptResult.responseBody.data as { id: string };
    await expect(
      service.getChargeConcept(actor, concept.id, trace("get-concept")),
    ).resolves.toMatchObject({
      data: { currency: "USD", defaultAmount: "25.5" },
    });
    await service.updateChargeConcept(
      actor,
      concept.id,
      key("concept-update"),
      { name: "Monthly dues updated" },
      trace("concept-update"),
    );

    const scheduleResult = await service.createFeeSchedule(
      actor,
      key("schedule"),
      {
        amount: "25.50",
        chargeConceptId: concept.id,
        effectiveFrom: "2026-09-01",
        frequency: "monthly",
        name: "Standard",
      },
      trace("schedule"),
    );
    const schedule = scheduleResult.responseBody.data as { id: string };
    await expect(
      service.getFeeSchedule(actor, schedule.id, trace("get-schedule")),
    ).resolves.toMatchObject({ data: { amount: "25.5", currency: "USD" } });
    await service.updateFeeSchedule(
      actor,
      schedule.id,
      key("schedule-update"),
      { amount: "30.00" },
      trace("schedule-update"),
    );

    const unit = await prisma.propertyUnit.create({
      data: {
        code: `U-${randomUUID()}`,
        status: "ACTIVE",
        tenantId: actor.tenantId,
      },
    });
    const assignmentResult = await service.createUnitFee(
      actor,
      key("assignment"),
      {
        feeScheduleId: schedule.id,
        propertyUnitId: unit.id,
        startDate: "2026-09-01",
      },
      trace("assignment"),
    );
    const assignment = assignmentResult.responseBody.data as { id: string };
    await expect(
      service.getUnitFee(actor, assignment.id, trace("get-assignment")),
    ).resolves.toMatchObject({ data: { status: "ACTIVE" } });
    await service.endUnitFee(
      actor,
      assignment.id,
      key("end"),
      { endDate: "2026-09-30", reason: "Contract ended" },
      trace("end"),
    );

    const periodResult = await service.createBillingPeriod(
      actor,
      key("period"),
      {
        dueDate: "2026-09-10",
        endsAt: "2026-09-30",
        periodCode: "2026-09",
        startsAt: "2026-09-01",
      },
      trace("period"),
    );
    const period = periodResult.responseBody.data as { id: string };
    await expect(
      service.getBillingPeriod(actor, period.id, trace("get-period")),
    ).resolves.toMatchObject({ data: { status: "OPEN" } });
    await expect(
      service.listBillingPeriods(
        actor,
        { page: 1, pageSize: 20 },
        trace("list-period"),
      ),
    ).resolves.toMatchObject({ meta: { total: 1 } });
    expect(
      await prisma.auditLog.count({ where: { tenantId: actor.tenantId } }),
    ).toBe(7);
  });

  it("replays once and rejects changed payload, actor, missing key and concurrent use", async () => {
    const actor = await createActor(permissions);
    const requestKey = key("replay");
    const body = { code: `REPLAY-${randomUUID()}`, name: "Replay" };
    const first = await service.createChargeConcept(
      actor,
      requestKey,
      body,
      trace("first"),
    );
    const replay = await service.createChargeConcept(
      actor,
      requestKey,
      body,
      trace("replay"),
    );
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    const resourceId = (first.responseBody.data as { id: string }).id;
    expect(
      await prisma.chargeConcept.count({
        where: { code: body.code, tenantId: actor.tenantId },
      }),
    ).toBe(1);
    expect(
      await prisma.auditLog.count({
        where: {
          action: "chargeConcept.created",
          resourceId,
        },
      }),
    ).toBe(1);
    await expect(
      service.createChargeConcept(
        actor,
        requestKey,
        { ...body, name: "Different" },
        trace("conflict"),
      ),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
    const otherActor = await createActor(permissions, actor.tenantId);
    await expect(
      service.createChargeConcept(otherActor, requestKey, body, trace("actor")),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
    await expect(
      service.createChargeConcept(
        actor,
        undefined,
        { code: "NO-KEY", name: "No key" },
        trace("missing"),
      ),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });

    let release: (() => void) | undefined;
    const hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    const concurrentKey = key("concurrent");
    const request = {
      actor,
      body: { value: 1 },
      key: concurrentKey,
      method: "POST" as const,
      operationType: "phase4.concurrent",
      path: {},
    };
    const pending = idempotency.execute(
      request,
      async () => undefined,
      async () => {
        await hold;
        return { httpStatus: 200, responseBody: { data: {}, meta: {} } };
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(
      idempotency.execute(
        request,
        async () => undefined,
        async () => ({ httpStatus: 200, responseBody: { data: {}, meta: {} } }),
      ),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_OPERATION_IN_PROGRESS" });
    release?.();
    await pending;
  });

  it("fails closed for permissions, inactive context, unsupported currency and cross-tenant references", async () => {
    const noPermission = await createActor([]);
    await expect(
      service.listChargeConcepts(
        noPermission,
        { page: 1, pageSize: 20 },
        trace("denied"),
      ),
    ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    const actor = await createActor(permissions);
    await prisma.tenant.update({
      data: { currency: "EUR" },
      where: { id: actor.tenantId },
    });
    await expect(
      service.createChargeConcept(
        actor,
        key("currency"),
        { code: "EUR", name: "Unsupported" },
        trace("currency"),
      ),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_TENANT_CURRENCY" });
    expect(
      await prisma.chargeConcept.count({ where: { tenantId: actor.tenantId } }),
    ).toBe(0);

    const owner = await createActor(permissions);
    const outsider = await createActor(permissions);
    const foreignConcept = await prisma.chargeConcept.create({
      data: {
        code: `FOREIGN-${randomUUID()}`,
        name: "Foreign",
        tenantId: outsider.tenantId,
      },
    });
    await expect(
      service.createFeeSchedule(
        owner,
        key("cross"),
        {
          amount: "10.00",
          chargeConceptId: foreignConcept.id,
          effectiveFrom: "2026-09-01",
          name: "Cross",
        },
        trace("cross"),
      ),
    ).rejects.toMatchObject({ code: "CROSS_TENANT_REFERENCE" });
    await expect(
      service.getChargeConcept(owner, foreignConcept.id, trace("hidden")),
    ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });

    for (const state of ["membership", "identity", "tenant"] as const) {
      const inactive = await createActor(["billingPeriods.read"]);
      if (state === "membership")
        await prisma.userTenantMembership.update({
          data: { status: "SUSPENDED" },
          where: { id: inactive.membershipId },
        });
      if (state === "identity")
        await prisma.userProfile.update({
          data: { status: "DISABLED" },
          where: { id: inactive.userProfileId },
        });
      if (state === "tenant")
        await prisma.tenant.update({
          data: { status: "SUSPENDED" },
          where: { id: inactive.tenantId },
        });
      await expect(
        service.listBillingPeriods(
          inactive,
          { page: 1, pageSize: 20 },
          trace(state),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    }
  });

  it("enforces date, amount, period and active-assignment constraints without destructive history", async () => {
    const actor = await createActor(permissions);
    await expect(
      service.createChargeConcept(
        actor,
        key("zero"),
        { code: "ZERO", defaultAmount: "0", name: "Zero" },
        trace("zero"),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(
      service.createBillingPeriod(
        actor,
        key("bad-period"),
        {
          dueDate: "2026-09-10",
          endsAt: "2026-09-29",
          periodCode: "2026-09",
          startsAt: "2026-09-01",
        },
        trace("bad-period"),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    const concept = (
      await service.createChargeConcept(
        actor,
        key("c"),
        { code: `C-${randomUUID()}`, name: "Concept" },
        trace("c"),
      )
    ).responseBody.data as { id: string };
    const schedule = (
      await service.createFeeSchedule(
        actor,
        key("s"),
        {
          amount: "10.00",
          chargeConceptId: concept.id,
          effectiveFrom: "2026-09-01",
          name: "Schedule",
        },
        trace("s"),
      )
    ).responseBody.data as { id: string };
    const unit = await prisma.propertyUnit.create({
      data: { code: `U-${randomUUID()}`, tenantId: actor.tenantId },
    });
    await service.createUnitFee(
      actor,
      key("a"),
      {
        feeScheduleId: schedule.id,
        propertyUnitId: unit.id,
        startDate: "2026-09-01",
      },
      trace("a"),
    );
    await expect(
      service.createUnitFee(
        actor,
        key("duplicate"),
        {
          feeScheduleId: schedule.id,
          propertyUnitId: unit.id,
          startDate: "2026-10-01",
        },
        trace("duplicate"),
      ),
    ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
  });

  it("rolls back domain, Audit and ledger when Audit fails", async () => {
    const actor = await createActor(permissions);
    const failingAudit: AuditWriterPort = {
      recordConfirmed: async () => {
        throw new Error("Synthetic audit failure");
      },
      recordDenied: async () => ({ persisted: false }),
    };
    const failing = new DuesFeesService(prisma, idempotency, failingAudit);
    const code = `ROLLBACK-${randomUUID()}`;
    await expect(
      failing.createChargeConcept(
        actor,
        key("rollback"),
        { code, name: "Rollback" },
        trace("rollback"),
      ),
    ).rejects.toThrow("Synthetic audit failure");
    expect(
      await prisma.chargeConcept.count({
        where: { code, tenantId: actor.tenantId },
      }),
    ).toBe(0);
    expect(
      await prisma.idempotencyOperation.count({
        where: {
          operationType: "chargeConcepts.create",
          tenantId: actor.tenantId,
        },
      }),
    ).toBe(0);
  });
});

async function createActor(
  permissionCodes: readonly string[],
  tenantId?: string,
): Promise<DuesActorContext> {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase 4 Actor",
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
            name: "Phase 4 Tenant",
            slug: `phase4-${randomUUID()}`,
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
      code: `Phase4-${randomUUID()}`,
      name: "Phase 4 Role",
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

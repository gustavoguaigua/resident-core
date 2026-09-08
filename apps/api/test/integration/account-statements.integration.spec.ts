import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountStatementsService } from "../../src/modules/account-statements/account-statements.service.js";
import type { StatementActorContext } from "../../src/modules/account-statements/account-statements.contract.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.STATEMENTS_PHASE8_TEST === "1";
const prisma = new PrismaService();
const service = new AccountStatementsService(
  prisma,
  new IdempotencyService(prisma),
  new PrismaAuditWriter(prisma),
);
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = () => `phase8-${randomUUID()}`;
const permissions = [
  "accountStatements.read",
  "accountStatements.generate",
  "accountStatements.publish",
  "accountStatements.close",
  "accountStatements.lock",
  "accountStatements.regenerate",
  "accountStatements.read.own",
  "balances.read",
  "balances.recalculate",
  "balances.read.own",
  "financialMovements.read",
  "financialMovements.read.own",
];

beforeAll(async () => prisma.$connect());
afterAll(async () => prisma.$disconnect());

describe.skipIf(!enabled).sequential("Sprint 3 Phase 8 statements", () => {
  it("generates an immutable deterministic statement and replays once", async () => {
    const f = await fixture();
    const requestKey = key("generate");
    const body = {
      asOfDate: "2026-10-31",
      billingPeriodId: f.period.id,
      propertyUnitId: f.unit.id,
    };
    const first = await service.generate(f.actor, requestKey, body, trace());
    const replay = await service.generate(f.actor, requestKey, body, trace());
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(first.responseBody.data).toMatchObject({
      closingBalance: "100.00",
      currency: "USD",
      lineCount: 1,
      status: "generated",
    });
    expect(
      await prisma.accountStatement.count({ where: { tenantId: f.tenant.id } }),
    ).toBe(1);
    expect(
      await prisma.auditLog.count({
        where: { action: "accountStatement.generated", tenantId: f.tenant.id },
      }),
    ).toBe(1);
  });
  it("publishes, closes and locks without rewriting lines", async () => {
    const f = await fixture();
    const generated = await service.generate(
      f.actor,
      key("life-generate"),
      {
        asOfDate: "2026-10-31",
        billingPeriodId: f.period.id,
        propertyUnitId: f.unit.id,
      },
      trace(),
    );
    const id = (generated.responseBody.data as { id: string }).id;
    const before = await prisma.accountStatementLine.findMany({
      where: { accountStatementId: id },
    });
    await service.transition(
      f.actor,
      id,
      key("publish"),
      "publish",
      {},
      trace(),
    );
    await service.transition(
      f.actor,
      id,
      key("close"),
      "close",
      { reason: "PERIOD_FINALIZED" },
      trace(),
    );
    const locked = await service.transition(
      f.actor,
      id,
      key("lock"),
      "lock",
      { reason: "ACCOUNTING_LOCK" },
      trace(),
    );
    expect(locked.responseBody.data).toMatchObject({ status: "locked" });
    expect(
      await prisma.accountStatementLine.findMany({
        where: { accountStatementId: id },
      }),
    ).toEqual(before);
    await expect(
      service.transition(f.actor, id, key("reopen"), "publish", {}, trace()),
    ).rejects.toMatchObject({ code: "RESOURCE_STATE_CONFLICT" });
  });
  it("regenerates only mutable statements with tenant-scoped links", async () => {
    const f = await fixture();
    const generated = await service.generate(
      f.actor,
      key("regen-base"),
      {
        asOfDate: "2026-10-31",
        billingPeriodId: f.period.id,
        propertyUnitId: f.unit.id,
      },
      trace(),
    );
    const oldId = (generated.responseBody.data as { id: string }).id;
    const next = await service.regenerate(
      f.actor,
      oldId,
      key("regen"),
      { reason: "SOURCE_CORRECTION" },
      trace(),
    );
    const nextId = (next.responseBody.data as { id: string }).id;
    expect(
      await prisma.accountStatement.findUniqueOrThrow({ where: { id: oldId } }),
    ).toMatchObject({ status: "SUPERSEDED", supersededById: nextId });
    expect(
      await prisma.accountStatement.findUniqueOrThrow({
        where: { id: nextId },
      }),
    ).toMatchObject({ previousStatementId: oldId, status: "GENERATED" });
  });
  it("generates a batch atomically and replays the final counts", async () => {
    const f = await fixture(true);
    const requestKey = key("batch");
    const body = { asOfDate: "2026-10-31", billingPeriodId: f.period.id };
    const first = await service.generateBatch(
      f.actor,
      requestKey,
      body,
      trace(),
    );
    const replay = await service.generateBatch(
      f.actor,
      requestKey,
      body,
      trace(),
    );
    expect(first.responseBody.data).toMatchObject({
      failedUnits: 0,
      generatedUnits: 2,
      skippedUnits: 0,
      status: "COMPLETED",
      totalUnits: 2,
    });
    expect(replay.replayed).toBe(true);
    expect(
      await prisma.accountStatement.count({ where: { tenantId: f.tenant.id } }),
    ).toBe(2);
    expect(
      await prisma.auditLog.count({
        where: {
          action: "accountStatement.batchGenerated",
          tenantId: f.tenant.id,
        },
      }),
    ).toBe(1);
  });
  it("enforces tenant isolation, permissions and own visibility", async () => {
    const f = await fixture();
    const generated = await service.generate(
      f.actor,
      key("own-base"),
      {
        asOfDate: "2026-10-31",
        billingPeriodId: f.period.id,
        propertyUnitId: f.unit.id,
      },
      trace(),
    );
    const id = (generated.responseBody.data as { id: string }).id;
    await expect(service.get(f.actor, id, trace(), true)).rejects.toMatchObject(
      { code: "RESOURCE_NOT_FOUND" },
    );
    await service.transition(
      f.actor,
      id,
      key("own-publish"),
      "publish",
      {},
      trace(),
    );
    expect((await service.get(f.actor, id, trace(), true)).data).toMatchObject({
      id,
      status: "published",
    });
    const other = await fixture();
    await expect(
      service.get(other.actor, id, trace(), false),
    ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
  });
});

async function fixture(secondUnit = false) {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase Eight User",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      currency: "USD",
      name: `Tenant ${randomUUID()}`,
      slug: `phase8-${randomUUID()}`,
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
      code: `Phase8-${randomUUID()}`,
      name: "Phase 8",
      scope: "TENANT",
      tenantId: tenant.id,
    },
  });
  for (const code of permissions) {
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
  if (secondUnit)
    await prisma.propertyUnit.create({
      data: { code: randomUUID(), status: "ACTIVE", tenantId: tenant.id },
    });
  const person = await prisma.person.create({
    data: {
      displayName: "Phase Eight Person",
      status: "ACTIVE",
      tenantId: tenant.id,
      userProfileId: user.id,
    },
  });
  await prisma.residency.create({
    data: {
      personId: person.id,
      propertyUnitId: unit.id,
      residencyType: "TENANT",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
      tenantId: tenant.id,
    },
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
      name: "Phase Eight Charge",
      status: "ACTIVE",
      tenantId: tenant.id,
    },
  });
  await prisma.charge.create({
    data: {
      billingPeriodId: period.id,
      chargeConceptId: concept.id,
      dueDate: new Date("2026-10-15"),
      effectiveAmount: "100.00",
      issuedDate: new Date("2026-10-01"),
      originalAmount: "100.00",
      propertyUnitId: unit.id,
      status: "ISSUED",
      tenantId: tenant.id,
      type: "ORDINARY",
    },
  });
  return {
    actor: {
      membershipId: membership.id,
      tenantId: tenant.id,
      userProfileId: user.id,
    } satisfies StatementActorContext,
    period,
    tenant,
    unit,
    user,
  };
}

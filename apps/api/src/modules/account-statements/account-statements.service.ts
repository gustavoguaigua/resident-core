import { createHash, randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  AccountStatement,
  AccountStatementLine,
  PrismaClient,
  UnitBalance,
} from "@prisma/client";

import { PrismaService } from "../../platform/database/prisma.service.js";
import {
  IdempotencyService,
  type IdempotentActor,
  type IdempotentResult,
} from "../../platform/idempotency/idempotency.service.js";
import {
  AUDIT_WRITER_PORT,
  type AuditWriterPort,
} from "../audit/audit-writer.port.js";
import type { AuditAction } from "../audit/domain-audit-event.js";
import {
  StatementError,
  type StatementActorContext,
} from "./account-statements.contract.js";
import type {
  GenerateStatementBatchDto,
  GenerateStatementDto,
  RecalculateBalanceDto,
  StatementPageQueryDto,
  StatementReasonDto,
} from "./account-statements.dto.js";

type Tx = Prisma.TransactionClient;
type ReadClient = PrismaClient | Tx;
type Envelope = {
  readonly data: unknown;
  readonly meta: Readonly<Record<string, unknown>>;
};
type Movement = {
  readonly credit: Prisma.Decimal;
  readonly date: Date;
  readonly debit: Prisma.Decimal;
  readonly descriptionCode: string;
  readonly dueDate?: Date;
  readonly id: string;
  readonly lineType:
    | "CHARGE"
    | "CHARGE_ADJUSTMENT"
    | "CHARGE_REVERSAL"
    | "PAYMENT_ALLOCATION"
    | "PAYMENT_ALLOCATION_REVERSAL";
  readonly sourceType:
    | "CHARGE"
    | "CHARGE_ADJUSTMENT"
    | "CHARGE_REVERSAL"
    | "PAYMENT_ALLOCATION"
    | "PAYMENT_ALLOCATION_REVERSAL";
};
type Projection = {
  readonly creditBalance: Prisma.Decimal;
  readonly hash: string;
  readonly movements: readonly Movement[];
  readonly notDue: Prisma.Decimal;
  readonly outstanding: Prisma.Decimal;
  readonly overdue: Prisma.Decimal;
  readonly unallocated: Prisma.Decimal;
  readonly watermark: Date | null;
};

@Injectable()
export class AccountStatementsService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
  ) {}

  public async list(
    actor: StatementActorContext,
    query: StatementPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "accountStatements.read");
    return this.findStatements(actor.tenantId, query, traceId);
  }

  public async listOwn(
    actor: StatementActorContext,
    query: StatementPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "accountStatements.read.own");
    const allowed = await this.ownUnitIds(actor);
    if (query.propertyUnitId && !allowed.includes(query.propertyUnitId))
      throw notFound();
    return this.findStatements(actor.tenantId, query, traceId, allowed, true);
  }

  public async get(
    actor: StatementActorContext,
    id: string,
    traceId: string,
    own: boolean,
  ) {
    await this.authorize(
      this.prisma,
      actor,
      own ? "accountStatements.read.own" : "accountStatements.read",
    );
    const value = await this.prisma.accountStatement.findFirst({
      include: {
        lines: {
          orderBy: { sortOrder: "asc" },
          ...(own ? { where: { isVisibleToResident: true } } : {}),
        },
      },
      where: {
        id,
        tenantId: actor.tenantId,
        ...(own
          ? {
              propertyUnitId: { in: await this.ownUnitIds(actor) },
              status: { in: ["PUBLISHED", "CLOSED", "LOCKED"] },
            }
          : {}),
      },
    });
    if (!value) throw notFound();
    return envelope(serializeStatement(value), traceId);
  }

  public async listBalances(
    actor: StatementActorContext,
    query: StatementPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "balances.read");
    const where = {
      tenantId: actor.tenantId,
      ...(query.propertyUnitId ? { propertyUnitId: query.propertyUnitId } : {}),
    };
    const [values, total] = await Promise.all([
      this.prisma.unitBalance.findMany({
        orderBy: { propertyUnitId: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.unitBalance.count({ where }),
    ]);
    return page(values.map(serializeBalance), total, query, traceId);
  }

  public async balance(
    actor: StatementActorContext,
    propertyUnitId: string,
    traceId: string,
    own: boolean,
  ) {
    await this.authorize(
      this.prisma,
      actor,
      own ? "balances.read.own" : "balances.read",
    );
    if (own && !(await this.ownUnitIds(actor)).includes(propertyUnitId))
      throw notFound();
    await this.requireUnit(this.prisma, actor.tenantId, propertyUnitId);
    const value = await this.prisma.unitBalance.findFirst({
      where: { propertyUnitId, tenantId: actor.tenantId },
    });
    return envelope(
      value ? serializeBalance(value) : emptyBalance(propertyUnitId),
      traceId,
    );
  }

  public async movements(
    actor: StatementActorContext,
    propertyUnitId: string,
    traceId: string,
    own: boolean,
  ) {
    await this.authorize(
      this.prisma,
      actor,
      own ? "financialMovements.read.own" : "financialMovements.read",
    );
    if (own && !(await this.ownUnitIds(actor)).includes(propertyUnitId))
      throw notFound();
    await this.requireUnit(this.prisma, actor.tenantId, propertyUnitId);
    await this.currency(this.prisma, actor.tenantId);
    const projection = await this.project(
      this.prisma,
      actor.tenantId,
      propertyUnitId,
      new Date(),
    );
    return envelope(publicMovements(projection.movements), traceId);
  }

  public generate(
    actor: StatementActorContext,
    key: string | undefined,
    body: GenerateStatementDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "accountStatements.generate",
      {},
      body,
      "accountStatements.generate",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.lockUnit(tx, actor.tenantId, body.propertyUnitId);
        const statement = await this.createStatement(tx, actor, body, traceId);
        return ok(
          serializeStatement(statement),
          traceId,
          "AccountStatement",
          statement.id,
          201,
        );
      },
    );
  }

  public generateBatch(
    actor: StatementActorContext,
    key: string | undefined,
    body: GenerateStatementBatchDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "accountStatements.generateBatch",
      {},
      body,
      "accountStatements.generate",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.requirePeriod(tx, actor.tenantId, body.billingPeriodId);
        const units = await tx.propertyUnit.findMany({
          orderBy: { id: "asc" },
          select: { id: true },
          where: { status: "ACTIVE", tenantId: actor.tenantId },
        });
        let generated = 0,
          skipped = 0,
          failed = 0;
        const superseded = 0;
        const errors = new Map<string, number>();
        for (const unit of units) {
          await tx.$executeRawUnsafe("SAVEPOINT statement_item");
          try {
            await this.lockUnit(tx, actor.tenantId, unit.id);
            const existing = await tx.accountStatement.findFirst({
              where: {
                billingPeriodId: body.billingPeriodId,
                currency: "USD",
                propertyUnitId: unit.id,
                status: { in: ["GENERATED", "PUBLISHED", "CLOSED", "LOCKED"] },
                tenantId: actor.tenantId,
              },
            });
            if (existing) {
              const projection = await this.project(
                tx,
                actor.tenantId,
                unit.id,
                parseDate(body.asOfDate),
              );
              if (existing.sourceHash !== projection.hash) throw conflict();
              skipped += 1;
            } else {
              await this.createStatement(
                tx,
                actor,
                { ...body, propertyUnitId: unit.id },
                traceId,
              );
              generated += 1;
            }
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT statement_item");
          } catch (error) {
            await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT statement_item");
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT statement_item");
            const code = recoverable(error);
            if (!code) throw error;
            failed += 1;
            errors.set(code, (errors.get(code) ?? 0) + 1);
          }
        }
        const counts = {
          failedUnits: failed,
          generatedUnits: generated,
          skippedUnits: skipped,
          supersededUnits: superseded,
          totalUnits: units.length,
        };
        if (units.length !== generated + skipped + failed) throw conflict();
        const resourceId = randomUUID();
        await this.record(
          tx,
          actor,
          traceId,
          "accountStatement.batchGenerated",
          resourceId,
          { billingPeriodId: body.billingPeriodId },
        );
        return ok(
          {
            ...counts,
            errorSummary: [...errors]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([code, count]) => ({ code, count })),
            status: failed ? "COMPLETED_WITH_ERRORS" : "COMPLETED",
          },
          traceId,
          "AccountStatement",
          resourceId,
        );
      },
    );
  }

  public transition(
    actor: StatementActorContext,
    id: string,
    key: string | undefined,
    action: "publish" | "close" | "lock",
    body: StatementReasonDto | Record<string, never>,
    traceId: string,
  ) {
    const permission = `accountStatements.${action}`;
    return this.mutate(
      actor,
      key,
      permission,
      { statementId: id },
      body,
      permission,
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.lockStatement(tx, actor.tenantId, id);
        const value = await this.requireStatement(tx, actor.tenantId, id);
        const expected =
          action === "publish"
            ? "GENERATED"
            : action === "close"
              ? "PUBLISHED"
              : "CLOSED";
        const next =
          action === "publish"
            ? "PUBLISHED"
            : action === "close"
              ? "CLOSED"
              : "LOCKED";
        if (value.status !== expected) throw conflict();
        const now = new Date();
        const updated = await tx.accountStatement.update({
          data:
            action === "publish"
              ? {
                  publishedAt: now,
                  publishedBy: actor.userProfileId,
                  status: next,
                }
              : action === "close"
                ? {
                    closeReason: reason((body as StatementReasonDto).reason),
                    closedAt: now,
                    closedBy: actor.userProfileId,
                    status: next,
                  }
                : {
                    lockReason: reason((body as StatementReasonDto).reason),
                    lockedAt: now,
                    lockedBy: actor.userProfileId,
                    status: next,
                  },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        await this.record(
          tx,
          actor,
          traceId,
          `accountStatement.${action === "publish" ? "published" : action === "close" ? "closed" : "locked"}` as AuditAction,
          id,
          {
            previousStatus: expected.toLowerCase(),
            newStatus: next.toLowerCase(),
            statementId: id,
          },
        );
        return ok(serializeStatement(updated), traceId, "AccountStatement", id);
      },
    );
  }

  public regenerate(
    actor: StatementActorContext,
    id: string,
    key: string | undefined,
    body: StatementReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "accountStatements.regenerate",
      { statementId: id },
      body,
      "accountStatements.regenerate",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.lockStatement(tx, actor.tenantId, id);
        const old = await this.requireStatement(tx, actor.tenantId, id);
        if (!["GENERATED", "PUBLISHED"].includes(old.status)) throw conflict();
        const normalizedReason = reason(body.reason);
        await tx.accountStatement.update({
          data: { status: "SUPERSEDED" },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        const next = await this.createStatement(
          tx,
          actor,
          {
            asOfDate: isoDate(old.asOfDate),
            billingPeriodId: old.billingPeriodId,
            propertyUnitId: old.propertyUnitId,
          },
          traceId,
          id,
          normalizedReason,
        );
        await tx.accountStatement.update({
          data: { supersededById: next.id },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "accountStatement.superseded",
          id,
          {
            previousStatus: old.status.toLowerCase(),
            newStatus: "superseded",
            statementId: id,
          },
        );
        await this.record(
          tx,
          actor,
          traceId,
          "accountStatement.regenerated",
          next.id,
          {
            billingPeriodId: old.billingPeriodId,
            propertyUnitId: old.propertyUnitId,
            statementId: next.id,
          },
        );
        return ok(
          serializeStatement(next),
          traceId,
          "AccountStatement",
          next.id,
          201,
        );
      },
    );
  }

  public recalculate(
    actor: StatementActorContext,
    propertyUnitId: string,
    key: string | undefined,
    body: RecalculateBalanceDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "balances.recalculate",
      { propertyUnitId },
      body,
      "balances.recalculate",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.lockUnit(tx, actor.tenantId, propertyUnitId);
        await this.requireUnit(tx, actor.tenantId, propertyUnitId);
        const projection = await this.project(
          tx,
          actor.tenantId,
          propertyUnitId,
          parseDate(body.asOfDate),
        );
        const value = await tx.unitBalance.upsert({
          create: balanceData(actor.tenantId, propertyUnitId, projection),
          update: {
            ...balanceValues(projection),
            calculatedAt: new Date(),
            isStale: false,
          },
          where: {
            tenantId_propertyUnitId_currency: {
              currency: "USD",
              propertyUnitId,
              tenantId: actor.tenantId,
            },
          },
        });
        await tx.balanceSnapshot.updateMany({
          data: { status: "SUPERSEDED" },
          where: {
            propertyUnitId,
            status: "CURRENT",
            tenantId: actor.tenantId,
          },
        });
        await tx.balanceSnapshot.create({
          data: {
            ...balanceValues(projection),
            asOfDate: parseDate(body.asOfDate),
            calculatedBy: actor.userProfileId,
            currency: "USD",
            id: randomUUID(),
            propertyUnitId,
            tenantId: actor.tenantId,
          },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "balance.recalculated",
          value.id,
          {
            amount: projection.outstanding.toFixed(2),
            currency: "USD",
            propertyUnitId,
          },
        );
        return ok(serializeBalance(value), traceId, "UnitBalance", value.id);
      },
    );
  }

  private async createStatement(
    tx: Tx,
    actor: StatementActorContext,
    input: GenerateStatementDto,
    traceId: string,
    previousStatementId?: string,
    regenerationReason?: string,
  ) {
    const asOf = parseDate(input.asOfDate);
    await this.requireUnit(tx, actor.tenantId, input.propertyUnitId);
    await this.requirePeriod(tx, actor.tenantId, input.billingPeriodId);
    const existing = await tx.accountStatement.findFirst({
      where: {
        billingPeriodId: input.billingPeriodId,
        currency: "USD",
        propertyUnitId: input.propertyUnitId,
        status: { in: ["GENERATED", "PUBLISHED", "CLOSED", "LOCKED"] },
        tenantId: actor.tenantId,
      },
    });
    if (existing) throw conflict();
    const projection = await this.project(
      tx,
      actor.tenantId,
      input.propertyUnitId,
      asOf,
    );
    const id = randomUUID();
    let running = new Prisma.Decimal(0);
    const lines = projection.movements.map((movement, index) => {
      running = running.plus(movement.debit).minus(movement.credit);
      return {
        accountStatementId: id,
        balanceAfterLine: running,
        billingPeriodId: input.billingPeriodId,
        creditAmount: movement.credit,
        currency: "USD" as const,
        debitAmount: movement.debit,
        descriptionCode: movement.descriptionCode,
        dueDate: movement.dueDate ?? null,
        id: randomUUID(),
        lineDate: movement.date,
        lineType: movement.lineType,
        propertyUnitId: input.propertyUnitId,
        sortOrder: index + 1,
        sourceId: movement.id,
        sourceType: movement.sourceType,
        tenantId: actor.tenantId,
      };
    });
    await tx.accountStatement.create({
      data: {
        adjustmentsTotal: sum(
          projection.movements
            .filter((m) => m.lineType === "CHARGE_ADJUSTMENT")
            .map((m) => m.debit.minus(m.credit)),
        ),
        asOfDate: asOf,
        billingPeriodId: input.billingPeriodId,
        chargesTotal: sum(
          projection.movements
            .filter((m) => m.lineType === "CHARGE")
            .map((m) => m.debit),
        ),
        closingBalance: projection.outstanding,
        creditBalance: projection.creditBalance,
        currency: "USD",
        generatedBy: actor.userProfileId,
        id,
        lineCount: lines.length,
        notDueBalance: projection.notDue,
        overdueBalance: projection.overdue,
        paymentsTotal: sum(
          projection.movements
            .filter((m) => m.lineType === "PAYMENT_ALLOCATION")
            .map((m) => m.credit),
        ),
        ...(previousStatementId === undefined ? {} : { previousStatementId }),
        propertyUnitId: input.propertyUnitId,
        ...(regenerationReason === undefined ? {} : { regenerationReason }),
        reversalsTotal: sum(
          projection.movements
            .filter((m) => m.lineType.includes("REVERSAL"))
            .map((m) => m.credit.minus(m.debit)),
        ),
        sourceHash: projection.hash,
        sourceWatermark: projection.watermark,
        statementNumber: statementNumber(actor.tenantId, id),
        tenantId: actor.tenantId,
      },
    });
    if (lines.length > 0) {
      await tx.accountStatementLine.createMany({ data: lines });
    }
    await tx.balanceSnapshot.updateMany({
      data: { status: "SUPERSEDED" },
      where: {
        propertyUnitId: input.propertyUnitId,
        status: "CURRENT",
        tenantId: actor.tenantId,
      },
    });
    await tx.balanceSnapshot.create({
      data: {
        ...balanceValues(projection),
        accountStatementId: id,
        asOfDate: asOf,
        billingPeriodId: input.billingPeriodId,
        calculatedBy: actor.userProfileId,
        currency: "USD",
        id: randomUUID(),
        propertyUnitId: input.propertyUnitId,
        tenantId: actor.tenantId,
      },
    });
    await tx.unitBalance.upsert({
      create: balanceData(actor.tenantId, input.propertyUnitId, projection),
      update: {
        ...balanceValues(projection),
        calculatedAt: new Date(),
        isStale: false,
      },
      where: {
        tenantId_propertyUnitId_currency: {
          currency: "USD",
          propertyUnitId: input.propertyUnitId,
          tenantId: actor.tenantId,
        },
      },
    });
    await this.record(tx, actor, traceId, "accountStatement.generated", id, {
      billingPeriodId: input.billingPeriodId,
      propertyUnitId: input.propertyUnitId,
      statementId: id,
    });
    return this.requireStatement(tx, actor.tenantId, id);
  }

  private async project(
    client: ReadClient,
    tenantId: string,
    propertyUnitId: string,
    asOf: Date,
  ): Promise<Projection> {
    const [charges, payments] = await Promise.all([
      client.charge.findMany({
        include: {
          adjustments: true,
          paymentAllocations: { include: { reversal: true } },
          reversal: true,
        },
        where: { issuedDate: { lte: asOf }, propertyUnitId, tenantId },
      }),
      client.payment.findMany({
        include: {
          allocations: { include: { reversal: true } },
          reversal: true,
        },
        where: { paidAt: { lte: asOf }, propertyUnitId, tenantId },
      }),
    ]);
    const movements: Movement[] = [];
    let outstanding = new Prisma.Decimal(0),
      overdue = new Prisma.Decimal(0);
    for (const charge of charges) {
      if (charge.currency !== "USD") throw currencyMismatch();
      if (!["DRAFT", "CANCELLED"].includes(charge.status)) {
        movements.push(
          movement(
            charge.id,
            "CHARGE",
            "CHARGE",
            charge.issuedDate,
            charge.originalAmount,
            0,
            "CHARGE_ISSUED",
            charge.dueDate,
          ),
        );
        for (const adjustment of charge.adjustments)
          movements.push(
            movement(
              adjustment.id,
              "CHARGE_ADJUSTMENT",
              "CHARGE_ADJUSTMENT",
              adjustment.effectiveDate,
              adjustment.type === "INCREASE" ? adjustment.amount : 0,
              adjustment.type === "DECREASE" ? adjustment.amount : 0,
              adjustment.type === "INCREASE"
                ? "CHARGE_ADJUSTMENT_INCREASE"
                : "CHARGE_ADJUSTMENT_DECREASE",
            ),
          );
        if (charge.reversal) {
          if (charge.reversal.currency !== "USD") throw currencyMismatch();
          movements.push(
            movement(
              charge.reversal.id,
              "CHARGE_REVERSAL",
              "CHARGE_REVERSAL",
              charge.reversal.effectiveDate,
              0,
              charge.reversal.amount,
              "CHARGE_REVERSED",
            ),
          );
        }
        for (const allocation of charge.paymentAllocations) {
          if (allocation.currency !== "USD") throw currencyMismatch();
          movements.push(
            movement(
              allocation.id,
              "PAYMENT_ALLOCATION",
              "PAYMENT_ALLOCATION",
              allocation.allocatedAt,
              0,
              allocation.amount,
              "PAYMENT_ALLOCATED",
            ),
          );
          if (allocation.reversal) {
            if (allocation.reversal.currency !== "USD")
              throw currencyMismatch();
            movements.push(
              movement(
                allocation.reversal.id,
                "PAYMENT_ALLOCATION_REVERSAL",
                "PAYMENT_ALLOCATION_REVERSAL",
                allocation.reversal.reversedAt,
                allocation.reversal.amount,
                0,
                "PAYMENT_ALLOCATION_REVERSED",
              ),
            );
          }
        }
        if (charge.status !== "REVERSED") {
          const activeAllocated = sum(
            charge.paymentAllocations
              .filter((a) => a.reversal === null && a.status === "ACTIVE")
              .map((a) => a.amount),
          );
          const due = maxZero(charge.effectiveAmount.minus(activeAllocated));
          outstanding = outstanding.plus(due);
          if (charge.dueDate < asOf) overdue = overdue.plus(due);
        }
      }
    }
    let unallocated = new Prisma.Decimal(0);
    for (const payment of payments) {
      if (payment.currency !== "USD") throw currencyMismatch();
      if (
        ["CONFIRMED", "PARTIALLY_ALLOCATED", "ALLOCATED"].includes(
          payment.status,
        ) &&
        payment.reversal === null
      ) {
        const allocated = sum(
          payment.allocations
            .filter((a) => a.reversal === null && a.status === "ACTIVE")
            .map((a) => a.amount),
        );
        unallocated = unallocated.plus(
          maxZero(payment.amount.minus(allocated)),
        );
      }
    }
    movements.sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        a.lineType.localeCompare(b.lineType) ||
        a.id.localeCompare(b.id),
    );
    const watermark =
      [
        ...charges.map((v) => v.updatedAt),
        ...payments.map((v) => v.updatedAt),
      ].sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    const canonical = movements.map((m) => ({
      credit: m.credit.toFixed(2),
      date: isoDate(m.date),
      debit: m.debit.toFixed(2),
      id: m.id,
      type: m.sourceType,
    }));
    const hash = createHash("sha256")
      .update(
        JSON.stringify({
          asOf: isoDate(asOf),
          tenantId,
          propertyUnitId,
          canonical,
          unallocated: unallocated.toFixed(2),
        }),
      )
      .digest("hex");
    return {
      creditBalance: unallocated,
      hash,
      movements,
      notDue: outstanding.minus(overdue),
      outstanding,
      overdue,
      unallocated,
      watermark,
    };
  }

  private mutate(
    actor: StatementActorContext,
    key: string | undefined,
    operationType: string,
    path: Readonly<Record<string, string>>,
    body: unknown,
    permission: string,
    mutation: (tx: Tx) => Promise<{
      httpStatus: number;
      responseBody: Envelope;
      resourceId?: string;
      resourceType?: string;
    }>,
  ): Promise<IdempotentResult<Envelope>> {
    return this.idempotency.execute(
      {
        actor: actor as IdempotentActor,
        body,
        key,
        method: "POST",
        operationType,
        path,
      },
      (tx) => this.authorize(tx, actor, permission),
      mutation,
    );
  }
  private async authorize(
    client: ReadClient,
    actor: StatementActorContext,
    permission: string,
  ) {
    const membership = await client.userTenantMembership.findFirst({
      where: {
        id: actor.membershipId,
        status: "ACTIVE",
        tenant: { id: actor.tenantId, status: "ACTIVE" },
        tenantId: actor.tenantId,
        userProfile: { id: actor.userProfileId, status: "ACTIVE" },
        userProfileId: actor.userProfileId,
      },
    });
    if (!membership) throw denied();
    const role = await client.membershipRole.findFirst({
      where: {
        membershipId: actor.membershipId,
        removedAt: null,
        role: {
          permissions: { some: { permission: { code: permission } } },
          scope: "TENANT",
          tenantId: actor.tenantId,
        },
      },
    });
    if (!role) throw denied();
  }
  private async currency(client: ReadClient, tenantId: string) {
    const tenant = await client.tenant.findFirst({
      select: { currency: true },
      where: { id: tenantId, status: "ACTIVE" },
    });
    if (!tenant) throw denied();
    if (tenant.currency !== "USD")
      throw new StatementError("UNSUPPORTED_TENANT_CURRENCY");
    return "USD" as const;
  }
  private async requireUnit(client: ReadClient, tenantId: string, id: string) {
    const unit = await client.propertyUnit.findFirst({
      where: { id, status: "ACTIVE", tenantId },
    });
    if (!unit) throw notFound();
    return unit;
  }
  private async requirePeriod(
    client: ReadClient,
    tenantId: string,
    id: string,
  ) {
    const period = await client.billingPeriod.findFirst({
      where: { id, tenantId },
    });
    if (!period) throw notFound();
    return period;
  }
  private async requireStatement(
    client: ReadClient,
    tenantId: string,
    id: string,
  ) {
    const value = await client.accountStatement.findFirst({
      include: { lines: { orderBy: { sortOrder: "asc" } } },
      where: { id, tenantId },
    });
    if (!value) throw notFound();
    return value;
  }
  private async lockUnit(tx: Tx, tenantId: string, id: string) {
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "property_units" WHERE "tenant_id"=${tenantId} AND "id"=${id} FOR UPDATE`,
    );
  }
  private async lockStatement(tx: Tx, tenantId: string, id: string) {
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "account_statements" WHERE "tenant_id"=${tenantId} AND "id"=${id} FOR UPDATE`,
    );
  }
  private async ownUnitIds(actor: StatementActorContext) {
    const person = await this.prisma.person.findFirst({
      where: {
        status: "ACTIVE",
        tenantId: actor.tenantId,
        userProfileId: actor.userProfileId,
      },
    });
    if (!person) throw notFound();
    const [o, r, l] = await Promise.all([
      this.prisma.propertyOwnership.findMany({
        select: { propertyUnitId: true },
        where: {
          personId: person.id,
          status: "ACTIVE",
          tenantId: actor.tenantId,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
      this.prisma.residency.findMany({
        select: { propertyUnitId: true },
        where: {
          personId: person.id,
          status: "ACTIVE",
          tenantId: actor.tenantId,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
      this.prisma.lease.findMany({
        select: { propertyUnitId: true },
        where: {
          status: "ACTIVE",
          tenantId: actor.tenantId,
          tenantPersonId: person.id,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
    ]);
    return [...new Set([...o, ...r, ...l].map((v) => v.propertyUnitId))].sort();
  }
  private async findStatements(
    tenantId: string,
    query: StatementPageQueryDto,
    traceId: string,
    units?: string[],
    own = false,
  ) {
    const where: Prisma.AccountStatementWhereInput = {
      tenantId,
      ...(query.propertyUnitId ? { propertyUnitId: query.propertyUnitId } : {}),
      ...(query.billingPeriodId
        ? { billingPeriodId: query.billingPeriodId }
        : {}),
      ...(units ? { propertyUnitId: { in: units } } : {}),
      ...(own ? { status: { in: ["PUBLISHED", "CLOSED", "LOCKED"] } } : {}),
    };
    const [values, total] = await Promise.all([
      this.prisma.accountStatement.findMany({
        orderBy: [{ generatedAt: "desc" }, { id: "asc" }],
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.accountStatement.count({ where }),
    ]);
    return page(values.map(serializeStatement), total, query, traceId);
  }
  private record(
    tx: Tx,
    actor: StatementActorContext,
    traceId: string,
    action: AuditAction,
    resourceId: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) {
    return this.audit.recordConfirmed(
      tx,
      {
        actor: {
          membershipId: actor.membershipId,
          type: "USER",
          userProfileId: actor.userProfileId,
        },
        tenantId: actor.tenantId,
        traceId,
      },
      {
        action,
        ...(metadata ? { metadata } : {}),
        occurredAt: new Date(),
        resourceId,
      },
    );
  }
}

function movement(
  id: string,
  lineType: Movement["lineType"],
  sourceType: Movement["sourceType"],
  date: Date,
  debit: Prisma.Decimal.Value,
  credit: Prisma.Decimal.Value,
  descriptionCode: string,
  dueDate?: Date,
): Movement {
  return {
    credit: new Prisma.Decimal(credit),
    date,
    debit: new Prisma.Decimal(debit),
    descriptionCode,
    ...(dueDate === undefined ? {} : { dueDate }),
    id,
    lineType,
    sourceType,
  };
}
const denied = () => new StatementError("ACCESS_DENIED");
const notFound = () => new StatementError("RESOURCE_NOT_FOUND");
const conflict = () => new StatementError("RESOURCE_STATE_CONFLICT");
const currencyMismatch = () =>
  new StatementError("FINANCIAL_CURRENCY_MISMATCH");
function recoverable(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P2002", "P2004"].includes(error.code)
  )
    return "STATEMENT_UNIT_CONFLICT";
  if (error instanceof StatementError) {
    if (error.code === "RESOURCE_STATE_CONFLICT")
      return "STATEMENT_FINANCIAL_CONFLICT";
    if (error.code === "RESOURCE_NOT_FOUND") return "PROPERTY_UNIT_INACTIVE";
  }
  return null;
}
function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || isoDate(date) !== value)
    throw new StatementError("VALIDATION_ERROR");
  return date;
}
function reason(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 500)
    throw new StatementError("VALIDATION_ERROR");
  return normalized;
}
const isoDate = (value: Date) => value.toISOString().slice(0, 10);
const maxZero = (value: Prisma.Decimal) =>
  value.lt(0) ? new Prisma.Decimal(0) : value;
const sum = (values: readonly Prisma.Decimal[]) =>
  values.reduce((a, b) => a.plus(b), new Prisma.Decimal(0));
const balanceValues = (p: Projection) => ({
  creditBalance: p.creditBalance,
  notDueBalance: p.notDue,
  outstandingBalance: p.outstanding,
  overdueBalance: p.overdue,
  sourceHash: p.hash,
  sourceWatermark: p.watermark,
  unallocatedPaymentBalance: p.unallocated,
});
const balanceData = (
  tenantId: string,
  propertyUnitId: string,
  p: Projection,
) => ({
  ...balanceValues(p),
  currency: "USD" as const,
  id: randomUUID(),
  isStale: false,
  propertyUnitId,
  tenantId,
});
const statementNumber = (tenantId: string, id: string) =>
  `ST-${tenantId.slice(0, 8)}-${id.slice(0, 8)}`.toUpperCase();
const envelope = (data: unknown, traceId: string) => ({
  data,
  meta: { requestId: traceId },
});
const ok = (
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
  httpStatus = 200,
) => ({
  httpStatus,
  responseBody: envelope(data, traceId),
  resourceId,
  resourceType,
});
const offset = (q: StatementPageQueryDto) => (q.page - 1) * q.pageSize;
const page = (
  data: unknown[],
  total: number,
  q: StatementPageQueryDto,
  traceId: string,
) => ({
  data,
  meta: { page: q.page, pageSize: q.pageSize, requestId: traceId, total },
});
function publicMovements(values: readonly Movement[]) {
  let running = new Prisma.Decimal(0);
  return values.map((v) => {
    running = running.plus(v.debit).minus(v.credit);
    return {
      credit: v.credit.toFixed(2),
      date: isoDate(v.date),
      debit: v.debit.toFixed(2),
      descriptionCode: v.descriptionCode,
      dueDate: v.dueDate ? isoDate(v.dueDate) : null,
      sourceId: v.id,
      sourceType: v.sourceType,
      type: v.lineType,
      balance: running.toFixed(2),
    };
  });
}
function serializeStatement(
  v: AccountStatement & { lines?: readonly AccountStatementLine[] },
) {
  return {
    id: v.id,
    propertyUnitId: v.propertyUnitId,
    billingPeriodId: v.billingPeriodId,
    statementNumber: v.statementNumber,
    status: String(v.status).toLowerCase(),
    currency: v.currency,
    asOfDate: isoDate(v.asOfDate),
    openingBalance: v.openingBalance.toFixed(2),
    chargesTotal: v.chargesTotal.toFixed(2),
    adjustmentsTotal: v.adjustmentsTotal.toFixed(2),
    paymentsTotal: v.paymentsTotal.toFixed(2),
    reversalsTotal: v.reversalsTotal.toFixed(2),
    creditBalance: v.creditBalance.toFixed(2),
    closingBalance: v.closingBalance.toFixed(2),
    overdueBalance: v.overdueBalance.toFixed(2),
    notDueBalance: v.notDueBalance.toFixed(2),
    lineCount: v.lineCount,
    generatedAt: v.generatedAt,
    previousStatementId: v.previousStatementId,
    supersededById: v.supersededById,
    ...(v.lines
      ? {
          lines: v.lines.map((l) => ({
            id: l.id,
            type: String(l.lineType).toLowerCase(),
            descriptionCode: l.descriptionCode,
            date: isoDate(l.lineDate),
            dueDate: l.dueDate ? isoDate(l.dueDate) : null,
            debit: l.debitAmount.toFixed(2),
            credit: l.creditAmount.toFixed(2),
            balance: l.balanceAfterLine.toFixed(2),
            sourceType: l.sourceType
              ? String(l.sourceType).toLowerCase()
              : null,
          })),
        }
      : {}),
  };
}
function serializeBalance(v: UnitBalance) {
  return {
    id: v.id,
    propertyUnitId: v.propertyUnitId,
    currency: v.currency,
    outstandingBalance: v.outstandingBalance.toFixed(2),
    overdueBalance: v.overdueBalance.toFixed(2),
    notDueBalance: v.notDueBalance.toFixed(2),
    creditBalance: v.creditBalance.toFixed(2),
    unallocatedPaymentBalance: v.unallocatedPaymentBalance.toFixed(2),
    calculatedAt: v.calculatedAt,
    isStale: v.isStale,
  };
}
const emptyBalance = (propertyUnitId: string) => ({
  propertyUnitId,
  currency: "USD",
  outstandingBalance: "0.00",
  overdueBalance: "0.00",
  notDueBalance: "0.00",
  creditBalance: "0.00",
  unallocatedPaymentBalance: "0.00",
  calculatedAt: null,
  isStale: true,
});

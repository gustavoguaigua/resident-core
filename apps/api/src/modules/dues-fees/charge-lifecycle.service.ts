import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Charge, ChargeBatch, PrismaClient } from "@prisma/client";

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
import type {
  AdjustChargeDto,
  ChargePageQueryDto,
  ChargeReasonDto,
  CreateChargeDto,
  GenerateMonthlyChargesDto,
  ReverseChargeDto,
} from "./charge-lifecycle.dto.js";
import { DuesFeesError, type DuesActorContext } from "./dues-fees.contract.js";

type Transaction = Prisma.TransactionClient;
type ReadClient = Pick<
  PrismaClient,
  "membershipRole" | "tenant" | "userTenantMembership"
>;
type Envelope = {
  readonly data: unknown;
  readonly meta: Readonly<Record<string, unknown>>;
};
const chargeType = {
  extraordinary: "EXTRAORDINARY",
  fine: "FINE",
  manual: "MANUAL",
  other: "OTHER",
  reservation: "RESERVATION",
} as const;
const chargeStatus = {
  cancelled: "CANCELLED",
  draft: "DRAFT",
  issued: "ISSUED",
  paid: "PAID",
  partiallyPaid: "PARTIALLY_PAID",
  reversed: "REVERSED",
} as const;
const RECOVERABLE = new Set([
  "ASSIGNMENT_OR_SCHEDULE_INACTIVE",
  "PROPERTY_UNIT_INACTIVE",
  "EQUIVALENT_CHARGE_EXISTS",
  "CHARGE_FINANCIAL_CONFLICT",
  "CHARGE_ITEM_CONSTRAINT_REJECTED",
]);

@Injectable()
export class ChargeLifecycleService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
  ) {}

  public closePeriod(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: ChargeReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "billingPeriods.close",
      { billingPeriodId: id },
      body,
      "billingPeriods.close",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const period = required(
          await tx.billingPeriod.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (period.status !== "OPEN") throw conflict();
        const value = await tx.billingPeriod.update({
          data: {
            closedAt: new Date(),
            closedBy: actor.userProfileId,
            status: "CLOSED",
          },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "billingPeriod.closed",
          id,
          statuses("OPEN", "CLOSED"),
        );
        return ok(serializePeriod(value), traceId, "BillingPeriod", id);
      },
    );
  }

  public lockPeriod(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: ChargeReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "billingPeriods.lock",
      { billingPeriodId: id },
      body,
      "billingPeriods.lock",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const period = required(
          await tx.billingPeriod.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (period.status !== "CLOSED") throw conflict();
        const value = await tx.billingPeriod.update({
          data: {
            lockedAt: new Date(),
            lockedBy: actor.userProfileId,
            status: "LOCKED",
          },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "billingPeriod.locked",
          id,
          statuses("CLOSED", "LOCKED"),
        );
        return ok(serializePeriod(value), traceId, "BillingPeriod", id);
      },
    );
  }

  public async listBatches(
    actor: DuesActorContext,
    query: ChargePageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "fees.readBatches");
    const where: Prisma.ChargeBatchWhereInput = {
      tenantId: actor.tenantId,
      ...(query.billingPeriodId === undefined
        ? {}
        : { billingPeriodId: query.billingPeriodId }),
    };
    const [values, total] = await Promise.all([
      this.prisma.chargeBatch.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.chargeBatch.count({ where }),
    ]);
    return page(values.map(serializeBatch), total, query, traceId);
  }

  public async getBatch(actor: DuesActorContext, id: string, traceId: string) {
    await this.authorize(this.prisma, actor, "fees.readBatches");
    return envelope(
      serializeBatch(
        required(
          await this.prisma.chargeBatch.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public async listCharges(
    actor: DuesActorContext,
    query: ChargePageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "charges.read");
    return this.findCharges(actor.tenantId, query, traceId);
  }

  public async getCharge(actor: DuesActorContext, id: string, traceId: string) {
    await this.authorize(this.prisma, actor, "charges.read");
    return envelope(
      serializeCharge(
        required(
          await this.prisma.charge.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public async listOwnCharges(
    actor: DuesActorContext,
    query: ChargePageQueryDto,
    traceId: string,
    requireUnit = false,
  ) {
    await this.authorize(this.prisma, actor, "charges.read.own");
    const person = required(
      await this.prisma.person.findFirst({
        where: {
          status: "ACTIVE",
          tenantId: actor.tenantId,
          userProfileId: actor.userProfileId,
        },
      }),
    );
    const [ownerships, residencies, leases] = await Promise.all([
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
    const allowed = new Set(
      [...ownerships, ...residencies, ...leases].map(
        (value) => value.propertyUnitId,
      ),
    );
    if (
      query.propertyUnitId !== undefined &&
      !allowed.has(query.propertyUnitId)
    )
      throw new DuesFeesError("RESOURCE_NOT_FOUND");
    if (requireUnit && query.propertyUnitId === undefined) throw validation();
    return this.findCharges(actor.tenantId, query, traceId, [...allowed]);
  }

  public createCharge(
    actor: DuesActorContext,
    key: string | undefined,
    body: CreateChargeDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "charges.create",
      {},
      body,
      "charges.create",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        const amount = money(body.amount);
        const issuedDate = date(body.issuedDate);
        const dueDate = date(body.dueDate);
        if (dueDate < issuedDate) throw validation();
        const period = required(
          await tx.billingPeriod.findFirst({
            where: { id: body.billingPeriodId, tenantId: actor.tenantId },
          }),
        );
        if (
          period.status !== "OPEN" ||
          issuedDate < period.startsAt ||
          issuedDate > period.endsAt
        )
          throw conflict();
        await this.requireReferences(
          tx,
          actor.tenantId,
          body.propertyUnitId,
          body.chargeConceptId,
          body.feeScheduleId,
        );
        const value = await tx.charge.create({
          data: {
            billingPeriodId: body.billingPeriodId,
            chargeConceptId: body.chargeConceptId,
            currency,
            ...(body.description === undefined
              ? {}
              : { description: body.description }),
            effectiveAmount: amount,
            ...(body.feeScheduleId === undefined
              ? {}
              : { feeScheduleId: body.feeScheduleId }),
            issuedDate,
            dueDate,
            originalAmount: amount,
            propertyUnitId: body.propertyUnitId,
            status: "ISSUED",
            tenantId: actor.tenantId,
            type: chargeType[body.type as keyof typeof chargeType],
          },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "charge.created",
          value.id,
          financial(value),
        );
        return created(serializeCharge(value), traceId, "Charge", value.id);
      },
    );
  }

  public cancelCharge(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: ChargeReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "charges.cancel",
      { chargeId: id },
      body,
      "charges.cancel",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const charge = required(
          await tx.charge.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (charge.status !== "DRAFT") throw conflict();
        const value = await tx.charge.update({
          data: {
            cancellationReason: body.reason,
            cancelledAt: new Date(),
            cancelledBy: actor.userProfileId,
            effectiveAmount: new Prisma.Decimal(0),
            status: "CANCELLED",
          },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "charge.cancelled",
          id,
          financial(value, "DRAFT", "CANCELLED"),
        );
        return ok(serializeCharge(value), traceId, "Charge", id);
      },
    );
  }

  public adjustCharge(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: AdjustChargeDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "charges.adjust",
      { chargeId: id },
      body,
      "charges.adjust",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await this.requireOpenEffectivePeriod(
          tx,
          actor.tenantId,
          body.effectiveDate,
        );
        const charge = required(
          await tx.charge.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (charge.status !== "ISSUED") throw conflict();
        const amount = money(body.amount);
        const next =
          body.type === "increase"
            ? charge.effectiveAmount.plus(amount)
            : charge.effectiveAmount.minus(amount);
        if (next.isNegative()) throw validation();
        const adjustment = await tx.chargeAdjustment.create({
          data: {
            amount,
            chargeId: id,
            createdBy: actor.userProfileId,
            effectiveDate: date(body.effectiveDate),
            reason: body.reason,
            tenantId: actor.tenantId,
            type: body.type === "increase" ? "INCREASE" : "DECREASE",
          },
        });
        const value = await tx.charge.update({
          data: { effectiveAmount: next },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "charge.adjusted",
          id,
          financial(value),
        );
        return created(
          {
            adjustment: serializeAdjustment(adjustment),
            charge: serializeCharge(value),
          },
          traceId,
          "ChargeAdjustment",
          adjustment.id,
        );
      },
    );
  }

  public reverseCharge(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: ReverseChargeDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "charges.reverse",
      { chargeId: id },
      body,
      "charges.reverse",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        await this.requireOpenEffectivePeriod(
          tx,
          actor.tenantId,
          body.effectiveDate,
        );
        const charge = required(
          await tx.charge.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (charge.status !== "ISSUED") throw conflict();
        const reversal = await tx.chargeReversal.create({
          data: {
            amount: charge.effectiveAmount,
            chargeId: id,
            currency,
            effectiveDate: date(body.effectiveDate),
            reason: body.reason,
            reversedBy: actor.userProfileId,
            tenantId: actor.tenantId,
          },
        });
        const value = await tx.charge.update({
          data: { effectiveAmount: new Prisma.Decimal(0), status: "REVERSED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "charge.reversed",
          id,
          financial(value, "ISSUED", "REVERSED", String(reversal.amount)),
        );
        return ok(
          {
            charge: serializeCharge(value),
            reversal: serializeReversal(reversal),
          },
          traceId,
          "Charge",
          id,
        );
      },
    );
  }

  public generateMonthly(
    actor: DuesActorContext,
    key: string | undefined,
    body: GenerateMonthlyChargesDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "charges.generateMonthly",
      {},
      body,
      "fees.generate",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        const period = required(
          await tx.billingPeriod.findFirst({
            where: { id: body.billingPeriodId, tenantId: actor.tenantId },
          }),
        );
        if (period.status !== "OPEN") throw conflict();
        if (
          body.feeScheduleId !== undefined &&
          (await tx.feeSchedule.findFirst({
            where: { id: body.feeScheduleId, tenantId: actor.tenantId },
          })) === null
        )
          throw new DuesFeesError("CROSS_TENANT_REFERENCE");
        const candidates = await tx.unitFeeAssignment.findMany({
          include: {
            feeSchedule: { include: { chargeConcept: true } },
            propertyUnit: true,
          },
          orderBy: [
            { propertyUnitId: "asc" },
            { feeScheduleId: "asc" },
            { id: "asc" },
          ],
          where: {
            ...(body.feeScheduleId === undefined
              ? {}
              : { feeScheduleId: body.feeScheduleId }),
            startDate: { lte: period.endsAt },
            tenantId: actor.tenantId,
          },
        });
        let batch = await tx.chargeBatch.create({
          data: {
            billingPeriodId: period.id,
            currency,
            ...(body.feeScheduleId === undefined
              ? {}
              : { feeScheduleId: body.feeScheduleId }),
            requestedBy: actor.userProfileId,
            startedAt: new Date(),
            status: "PROCESSING",
            tenantId: actor.tenantId,
            totalItems: candidates.length,
          },
        });
        await this.record(tx, actor, traceId, "chargeBatch.created", batch.id);
        let successItems = 0;
        let skippedItems = 0;
        let failedItems = 0;
        const errors = new Map<string, number>();
        for (const candidate of candidates) {
          await tx.$executeRawUnsafe("SAVEPOINT charge_item");
          try {
            const code = classifyCandidate(candidate, period);
            if (code !== undefined) throw new RecoverableChargeItemError(code);
            const existing = await tx.charge.findFirst({
              where: {
                billingPeriodId: period.id,
                chargeConceptId: candidate.feeSchedule.chargeConceptId,
                propertyUnitId: candidate.propertyUnitId,
                tenantId: actor.tenantId,
                type: "ORDINARY",
              },
            });
            if (existing !== null) {
              if (
                existing.originalAmount.equals(candidate.feeSchedule.amount) &&
                existing.currency === currency
              ) {
                skippedItems += 1;
              } else
                throw new RecoverableChargeItemError(
                  "CHARGE_FINANCIAL_CONFLICT",
                );
            } else {
              const value = await tx.charge.create({
                data: {
                  billingPeriodId: period.id,
                  chargeBatchId: batch.id,
                  chargeConceptId: candidate.feeSchedule.chargeConceptId,
                  currency,
                  dueDate: period.dueDate,
                  effectiveAmount: candidate.feeSchedule.amount,
                  feeScheduleId: candidate.feeScheduleId,
                  issuedDate: period.startsAt,
                  originalAmount: candidate.feeSchedule.amount,
                  propertyUnitId: candidate.propertyUnitId,
                  status: "ISSUED",
                  tenantId: actor.tenantId,
                  type: "ORDINARY",
                },
              });
              await this.record(
                tx,
                actor,
                traceId,
                "charge.created",
                value.id,
                financial(value),
              );
              successItems += 1;
            }
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT charge_item");
          } catch (error) {
            await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT charge_item");
            await tx.$executeRawUnsafe("RELEASE SAVEPOINT charge_item");
            if (
              !(error instanceof RecoverableChargeItemError) ||
              !RECOVERABLE.has(error.code)
            )
              throw error;
            failedItems += 1;
            errors.set(error.code, (errors.get(error.code) ?? 0) + 1);
          }
        }
        const status =
          failedItems === 0 ? "COMPLETED" : "COMPLETED_WITH_ERRORS";
        batch = await tx.chargeBatch.update({
          data: {
            completedAt: new Date(),
            errorSummary:
              errors.size === 0
                ? Prisma.DbNull
                : {
                    codes: [...errors].map(([code, count]) => ({
                      code,
                      count,
                    })),
                  },
            failedItems,
            skippedItems,
            status,
            successItems,
          },
          where: { id: batch.id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          status === "COMPLETED"
            ? "chargeBatch.completed"
            : "chargeBatch.completedWithErrors",
          batch.id,
        );
        return created(serializeBatch(batch), traceId, "ChargeBatch", batch.id);
      },
    );
  }

  private async findCharges(
    tenantId: string,
    query: ChargePageQueryDto,
    traceId: string,
    allowedUnits?: string[],
  ) {
    const where: Prisma.ChargeWhereInput = {
      tenantId,
      ...(allowedUnits === undefined
        ? {}
        : { propertyUnitId: { in: allowedUnits } }),
      ...(query.propertyUnitId === undefined
        ? {}
        : { propertyUnitId: query.propertyUnitId }),
      ...(query.billingPeriodId === undefined
        ? {}
        : { billingPeriodId: query.billingPeriodId }),
      ...(query.status === undefined
        ? {}
        : { status: chargeStatus[query.status as keyof typeof chargeStatus] }),
    };
    const [values, total] = await Promise.all([
      this.prisma.charge.findMany({
        orderBy: [{ issuedDate: "desc" }, { id: "asc" }],
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.charge.count({ where }),
    ]);
    return page(values.map(serializeCharge), total, query, traceId);
  }

  private mutate(
    actor: DuesActorContext,
    key: string | undefined,
    operationType: string,
    path: Readonly<Record<string, string>>,
    body: unknown,
    permission: string,
    mutation: (tx: Transaction) => Promise<{
      httpStatus: number;
      responseBody: Envelope;
      resourceType?: string;
      resourceId?: string;
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
    actor: DuesActorContext,
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
    if (membership === null) throw denied();
    const role = await client.membershipRole.findFirst({
      where: {
        membershipId: actor.membershipId,
        removedAt: null,
        role: {
          scope: "TENANT",
          tenantId: actor.tenantId,
          permissions: { some: { permission: { code: permission } } },
        },
      },
    });
    if (role === null) throw denied();
  }
  private async currency(client: ReadClient, tenantId: string): Promise<"USD"> {
    const tenant = await client.tenant.findFirst({
      select: { currency: true },
      where: { id: tenantId, status: "ACTIVE" },
    });
    if (tenant === null) throw denied();
    if (tenant.currency !== "USD")
      throw new DuesFeesError("UNSUPPORTED_TENANT_CURRENCY");
    return "USD";
  }
  private async requireReferences(
    tx: Transaction,
    tenantId: string,
    propertyUnitId: string,
    chargeConceptId: string,
    feeScheduleId?: string,
  ) {
    const [unit, concept, schedule] = await Promise.all([
      tx.propertyUnit.findFirst({
        where: { id: propertyUnitId, status: "ACTIVE", tenantId },
      }),
      tx.chargeConcept.findFirst({
        where: { id: chargeConceptId, status: "ACTIVE", tenantId },
      }),
      feeScheduleId === undefined
        ? Promise.resolve({ id: "none", chargeConceptId })
        : tx.feeSchedule.findFirst({
            where: {
              chargeConceptId,
              id: feeScheduleId,
              status: "ACTIVE",
              tenantId,
            },
          }),
    ]);
    if (unit === null || concept === null || schedule === null)
      throw new DuesFeesError("CROSS_TENANT_REFERENCE");
  }
  private async requireOpenEffectivePeriod(
    tx: Transaction,
    tenantId: string,
    value: string,
  ) {
    const effectiveDate = date(value);
    if (
      (await tx.billingPeriod.findFirst({
        where: {
          startsAt: { lte: effectiveDate },
          endsAt: { gte: effectiveDate },
          status: "OPEN",
          tenantId,
        },
      })) === null
    )
      throw conflict();
  }
  private async record(
    tx: Transaction,
    actor: DuesActorContext,
    traceId: string,
    action: AuditAction,
    resourceId: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) {
    await this.audit.recordConfirmed(
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
        ...(metadata === undefined ? {} : { metadata }),
        occurredAt: new Date(),
        resourceId,
      },
    );
  }
}

class RecoverableChargeItemError extends Error {
  public constructor(public readonly code: string) {
    super(code);
  }
}
const denied = () => new DuesFeesError("ACCESS_DENIED");
const conflict = () => new DuesFeesError("RESOURCE_STATE_CONFLICT");
const validation = () => new DuesFeesError("VALIDATION_ERROR");
function required<T>(value: T | null): T {
  if (value === null) throw new DuesFeesError("RESOURCE_NOT_FOUND");
  return value;
}
function money(value: string) {
  const result = new Prisma.Decimal(value);
  if (!result.isPositive() || result.isZero() || result.decimalPlaces() > 2)
    throw validation();
  return result;
}
function date(value: string) {
  const result = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(result.getTime()) ||
    result.toISOString().slice(0, 10) !== value
  )
    throw validation();
  return result;
}
function classifyCandidate(
  candidate: {
    endDate: Date | null;
    status: string;
    propertyUnit: { status: string };
    feeSchedule: {
      amount: Prisma.Decimal;
      currency: string;
      effectiveFrom: Date;
      effectiveTo: Date | null;
      frequency: string;
      status: string;
      chargeConcept: { status: string };
    };
  },
  period: { startsAt: Date; endsAt: Date },
) {
  if (
    candidate.status !== "ACTIVE" ||
    candidate.feeSchedule.status !== "ACTIVE" ||
    candidate.feeSchedule.chargeConcept.status !== "ACTIVE" ||
    candidate.feeSchedule.frequency !== "MONTHLY" ||
    candidate.feeSchedule.effectiveFrom > period.endsAt ||
    (candidate.feeSchedule.effectiveTo !== null &&
      candidate.feeSchedule.effectiveTo < period.startsAt) ||
    (candidate.endDate !== null && candidate.endDate < period.startsAt)
  )
    return "ASSIGNMENT_OR_SCHEDULE_INACTIVE";
  if (candidate.propertyUnit.status !== "ACTIVE")
    return "PROPERTY_UNIT_INACTIVE";
  if (
    candidate.feeSchedule.currency !== "USD" ||
    !candidate.feeSchedule.amount.isPositive()
  )
    throw new DuesFeesError("UNSUPPORTED_TENANT_CURRENCY");
  return undefined;
}
const statuses = (previousStatus: string, newStatus: string) => ({
  newStatus,
  previousStatus,
});
function financial(
  value: Charge,
  previousStatus?: string,
  newStatus?: string,
  amount = String(value.effectiveAmount),
) {
  return {
    amount,
    billingPeriodId: value.billingPeriodId,
    chargeId: value.id,
    currency: value.currency,
    ...(newStatus === undefined ? {} : { newStatus }),
    ...(previousStatus === undefined ? {} : { previousStatus }),
    propertyUnitId: value.propertyUnitId,
  };
}
const envelope = (data: unknown, traceId: string): Envelope => ({
  data,
  meta: { traceId },
});
const page = (
  data: unknown[],
  total: number,
  query: ChargePageQueryDto,
  traceId: string,
): Envelope => ({
  data,
  meta: { page: query.page, pageSize: query.pageSize, total, traceId },
});
const offset = (query: ChargePageQueryDto) => (query.page - 1) * query.pageSize;
const created = (
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) => ({
  httpStatus: 201,
  responseBody: envelope(data, traceId),
  resourceId,
  resourceType,
});
const ok = (
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) => ({
  httpStatus: 200,
  responseBody: envelope(data, traceId),
  resourceId,
  resourceType,
});
const serializePeriod = (value: {
  id: string;
  periodCode: string;
  startsAt: Date;
  endsAt: Date;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...value,
  startsAt: value.startsAt.toISOString().slice(0, 10),
  endsAt: value.endsAt.toISOString().slice(0, 10),
  dueDate: value.dueDate.toISOString().slice(0, 10),
});
const serializeBatch = (value: ChargeBatch) => ({
  id: value.id,
  billingPeriodId: value.billingPeriodId,
  feeScheduleId: value.feeScheduleId,
  type: value.type,
  status: value.status,
  totalItems: value.totalItems,
  successItems: value.successItems,
  skippedItems: value.skippedItems,
  failedItems: value.failedItems,
  errorSummary: value.errorSummary,
  currency: value.currency,
  startedAt: value.startedAt,
  completedAt: value.completedAt,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});
const serializeCharge = (value: Charge) => ({
  id: value.id,
  billingPeriodId: value.billingPeriodId,
  propertyUnitId: value.propertyUnitId,
  chargeConceptId: value.chargeConceptId,
  feeScheduleId: value.feeScheduleId,
  chargeBatchId: value.chargeBatchId,
  type: value.type,
  description: value.description,
  originalAmount: String(value.originalAmount),
  effectiveAmount: String(value.effectiveAmount),
  currency: value.currency,
  issuedDate: value.issuedDate.toISOString().slice(0, 10),
  dueDate: value.dueDate.toISOString().slice(0, 10),
  status: value.status,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});
const serializeAdjustment = (value: {
  id: string;
  chargeId: string;
  type: string;
  amount: Prisma.Decimal;
  effectiveDate: Date;
  reason: string;
  createdAt: Date;
}) => ({
  ...value,
  amount: String(value.amount),
  effectiveDate: value.effectiveDate.toISOString().slice(0, 10),
});
const serializeReversal = (value: {
  id: string;
  chargeId: string;
  amount: Prisma.Decimal;
  currency: string;
  effectiveDate: Date;
  reason: string;
  createdAt: Date;
}) => ({
  ...value,
  amount: String(value.amount),
  effectiveDate: value.effectiveDate.toISOString().slice(0, 10),
});

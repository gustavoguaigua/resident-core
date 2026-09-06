import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  BillingPeriod,
  BillingPeriodStatus,
  ChargeConcept,
  ChargeConceptStatus,
  FeeSchedule,
  FeeScheduleStatus,
  PrismaClient,
  UnitFeeAssignment,
  UnitFeeAssignmentStatus,
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
import { DuesFeesError, type DuesActorContext } from "./dues-fees.contract.js";
import type {
  CreateBillingPeriodDto,
  CreateChargeConceptDto,
  CreateFeeScheduleDto,
  CreateUnitFeeDto,
  DuesPageQueryDto,
  EndUnitFeeDto,
  UpdateChargeConceptDto,
  UpdateFeeScheduleDto,
} from "./dues-fees.dto.js";

type Transaction = Prisma.TransactionClient;
type ReadClient = Pick<
  PrismaClient,
  "membershipRole" | "tenant" | "userTenantMembership"
>;
type Envelope = {
  readonly data: unknown;
  readonly meta: Readonly<Record<string, unknown>>;
};

const category = {
  extraordinary: "EXTRAORDINARY",
  fine: "FINE",
  ordinary: "ORDINARY",
  other: "OTHER",
  reservation: "RESERVATION",
  service: "SERVICE",
} as const;
const frequency = {
  annual: "ANNUAL",
  monthly: "MONTHLY",
  oneTime: "ONE_TIME",
  quarterly: "QUARTERLY",
} as const;
const mutableStatus = { active: "ACTIVE", inactive: "INACTIVE" } as const;

@Injectable()
export class DuesFeesService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
  ) {}

  public async listChargeConcepts(
    actor: DuesActorContext,
    query: DuesPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "chargeConcepts.read");
    const where: Prisma.ChargeConceptWhereInput = {
      tenantId: actor.tenantId,
      ...(query.status === undefined
        ? {}
        : {
            status: statusValue(query.status, [
              "active",
              "inactive",
              "archived",
            ]) as ChargeConceptStatus,
          }),
      ...(query.search === undefined
        ? {}
        : {
            OR: [
              { code: { contains: query.search, mode: "insensitive" } },
              { name: { contains: query.search, mode: "insensitive" } },
            ],
          }),
    };
    const [values, total] = await Promise.all([
      this.prisma.chargeConcept.findMany({
        orderBy: { code: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.chargeConcept.count({ where }),
    ]);
    return page(values.map(serializeConcept), total, query, traceId);
  }

  public async getChargeConcept(
    actor: DuesActorContext,
    id: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "chargeConcepts.read");
    return envelope(
      serializeConcept(
        required(
          await this.prisma.chargeConcept.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createChargeConcept(
    actor: DuesActorContext,
    key: string | undefined,
    body: CreateChargeConceptDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "chargeConcepts.create",
      {},
      body,
      "chargeConcepts.create",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        const amount = optionalMoney(body.defaultAmount);
        const value = await tx.chargeConcept.create({
          data: {
            category:
              body.category === undefined
                ? "ORDINARY"
                : category[body.category as keyof typeof category],
            code: body.code,
            currency,
            ...(amount === undefined ? {} : { defaultAmount: amount }),
            ...(body.description === undefined
              ? {}
              : { description: body.description }),
            name: body.name,
            tenantId: actor.tenantId,
          },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "chargeConcept.created",
          value.id,
        );
        return created(
          serializeConcept(value),
          traceId,
          "ChargeConcept",
          value.id,
        );
      },
    );
  }

  public updateChargeConcept(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: UpdateChargeConceptDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "chargeConcepts.update",
      { chargeConceptId: id },
      body,
      "chargeConcepts.update",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const current = required(
          await tx.chargeConcept.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const changedFields = Object.keys(body);
        if (changedFields.length === 0) throw validation();
        const value = await tx.chargeConcept.update({
          data: compact({
            category:
              body.category === undefined
                ? undefined
                : category[body.category as keyof typeof category],
            defaultAmount:
              body.defaultAmount === undefined
                ? undefined
                : money(body.defaultAmount),
            description: body.description,
            name: body.name,
            status:
              body.status === undefined
                ? undefined
                : mutableStatus[body.status as keyof typeof mutableStatus],
          }),
          where: { id },
        });
        await this.record(tx, actor, traceId, "chargeConcept.updated", id, {
          changedFields,
        });
        return ok(serializeConcept(value), traceId, "ChargeConcept", id);
      },
    );
  }

  public archiveChargeConcept(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "chargeConcepts.archive",
      { chargeConceptId: id },
      {},
      "chargeConcepts.archive",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const current = required(
          await tx.chargeConcept.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const value = await tx.chargeConcept.update({
          data: { archivedAt: new Date(), status: "ARCHIVED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "chargeConcept.archived",
          id,
          statuses(current.status, "ARCHIVED"),
        );
        return ok(serializeConcept(value), traceId, "ChargeConcept", id);
      },
    );
  }

  public async listFeeSchedules(
    actor: DuesActorContext,
    query: DuesPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "feeSchedules.read");
    const where: Prisma.FeeScheduleWhereInput = {
      tenantId: actor.tenantId,
      ...(query.status === undefined
        ? {}
        : {
            status: statusValue(query.status, [
              "active",
              "inactive",
              "archived",
            ]) as FeeScheduleStatus,
          }),
      ...(query.search === undefined
        ? {}
        : { name: { contains: query.search, mode: "insensitive" } }),
    };
    const [values, total] = await Promise.all([
      this.prisma.feeSchedule.findMany({
        orderBy: { name: "asc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.feeSchedule.count({ where }),
    ]);
    return page(values.map(serializeSchedule), total, query, traceId);
  }

  public async getFeeSchedule(
    actor: DuesActorContext,
    id: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "feeSchedules.read");
    return envelope(
      serializeSchedule(
        required(
          await this.prisma.feeSchedule.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createFeeSchedule(
    actor: DuesActorContext,
    key: string | undefined,
    body: CreateFeeScheduleDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "feeSchedules.create",
      {},
      body,
      "feeSchedules.create",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        const concept = await tx.chargeConcept.findFirst({
          where: {
            id: body.chargeConceptId,
            status: "ACTIVE",
            tenantId: actor.tenantId,
          },
        });
        if (concept === null) throw crossTenant();
        assertRange(body.effectiveFrom, body.effectiveTo);
        const value = await tx.feeSchedule.create({
          data: {
            amount: money(body.amount),
            chargeConceptId: body.chargeConceptId,
            currency,
            effectiveFrom: date(body.effectiveFrom),
            ...(body.effectiveTo === undefined
              ? {}
              : { effectiveTo: date(body.effectiveTo) }),
            frequency:
              body.frequency === undefined
                ? "MONTHLY"
                : frequency[body.frequency as keyof typeof frequency],
            name: body.name,
            tenantId: actor.tenantId,
          },
        });
        await this.record(tx, actor, traceId, "feeSchedule.created", value.id);
        return created(
          serializeSchedule(value),
          traceId,
          "FeeSchedule",
          value.id,
        );
      },
    );
  }

  public updateFeeSchedule(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: UpdateFeeScheduleDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "PATCH",
      "feeSchedules.update",
      { feeScheduleId: id },
      body,
      "feeSchedules.update",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const current = required(
          await tx.feeSchedule.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const changedFields = Object.keys(body);
        if (changedFields.length === 0) throw validation();
        const from = body.effectiveFrom ?? isoDate(current.effectiveFrom);
        const to =
          body.effectiveTo ??
          (current.effectiveTo === null
            ? undefined
            : isoDate(current.effectiveTo));
        assertRange(from, to);
        const value = await tx.feeSchedule.update({
          data: compact({
            amount: body.amount === undefined ? undefined : money(body.amount),
            effectiveFrom:
              body.effectiveFrom === undefined
                ? undefined
                : date(body.effectiveFrom),
            effectiveTo:
              body.effectiveTo === undefined
                ? undefined
                : date(body.effectiveTo),
            frequency:
              body.frequency === undefined
                ? undefined
                : frequency[body.frequency as keyof typeof frequency],
            name: body.name,
            status:
              body.status === undefined
                ? undefined
                : mutableStatus[body.status as keyof typeof mutableStatus],
          }),
          where: { id },
        });
        await this.record(tx, actor, traceId, "feeSchedule.updated", id, {
          changedFields,
        });
        return ok(serializeSchedule(value), traceId, "FeeSchedule", id);
      },
    );
  }

  public archiveFeeSchedule(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "feeSchedules.archive",
      { feeScheduleId: id },
      {},
      "feeSchedules.archive",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const current = required(
          await tx.feeSchedule.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (current.status === "ARCHIVED") throw conflict();
        const value = await tx.feeSchedule.update({
          data: { archivedAt: new Date(), status: "ARCHIVED" },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "feeSchedule.archived",
          id,
          statuses(current.status, "ARCHIVED"),
        );
        return ok(serializeSchedule(value), traceId, "FeeSchedule", id);
      },
    );
  }

  public async listUnitFees(
    actor: DuesActorContext,
    query: DuesPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "unitFees.read");
    const where: Prisma.UnitFeeAssignmentWhereInput = {
      tenantId: actor.tenantId,
      ...(query.status === undefined
        ? {}
        : {
            status: statusValue(query.status, [
              "active",
              "inactive",
              "archived",
              "ended",
            ]) as UnitFeeAssignmentStatus,
          }),
    };
    const [values, total] = await Promise.all([
      this.prisma.unitFeeAssignment.findMany({
        orderBy: { startDate: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.unitFeeAssignment.count({ where }),
    ]);
    return page(values.map(serializeUnitFee), total, query, traceId);
  }

  public async getUnitFee(
    actor: DuesActorContext,
    id: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "unitFees.read");
    return envelope(
      serializeUnitFee(
        required(
          await this.prisma.unitFeeAssignment.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createUnitFee(
    actor: DuesActorContext,
    key: string | undefined,
    body: CreateUnitFeeDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "unitFees.assign",
      {},
      body,
      "unitFees.assign",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        assertRange(body.startDate, body.endDate);
        const [unit, schedule, duplicate] = await Promise.all([
          tx.propertyUnit.findFirst({
            where: {
              id: body.propertyUnitId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
            },
          }),
          tx.feeSchedule.findFirst({
            where: {
              id: body.feeScheduleId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
              chargeConcept: { status: "ACTIVE" },
            },
          }),
          tx.unitFeeAssignment.findFirst({
            where: {
              feeScheduleId: body.feeScheduleId,
              propertyUnitId: body.propertyUnitId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
            },
          }),
        ]);
        if (unit === null || schedule === null) throw crossTenant();
        if (duplicate !== null) throw conflict();
        const value = await tx.unitFeeAssignment.create({
          data: {
            ...(body.endDate === undefined
              ? {}
              : { endDate: date(body.endDate) }),
            feeScheduleId: body.feeScheduleId,
            propertyUnitId: body.propertyUnitId,
            startDate: date(body.startDate),
            tenantId: actor.tenantId,
          },
        });
        await this.record(tx, actor, traceId, "unitFee.assigned", value.id);
        return created(serializeUnitFee(value), traceId, "UnitFee", value.id);
      },
    );
  }

  public endUnitFee(
    actor: DuesActorContext,
    id: string,
    key: string | undefined,
    body: EndUnitFeeDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "unitFees.end",
      { unitFeeAssignmentId: id },
      body,
      "unitFees.end",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const current = required(
          await tx.unitFeeAssignment.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        );
        if (
          current.status !== "ACTIVE" ||
          date(body.endDate) < current.startDate
        )
          throw conflict();
        const value = await tx.unitFeeAssignment.update({
          data: {
            endDate: date(body.endDate),
            endedAt: new Date(),
            endedBy: actor.userProfileId,
            endReason: body.reason,
            status: "ENDED",
          },
          where: { id },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "unitFee.ended",
          id,
          statuses(current.status, "ENDED"),
        );
        return ok(serializeUnitFee(value), traceId, "UnitFee", id);
      },
    );
  }

  public async listBillingPeriods(
    actor: DuesActorContext,
    query: DuesPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "billingPeriods.read");
    const where: Prisma.BillingPeriodWhereInput = {
      tenantId: actor.tenantId,
      ...(query.status === undefined
        ? {}
        : {
            status: statusValue(query.status, ["open"]) as BillingPeriodStatus,
          }),
    };
    const [values, total] = await Promise.all([
      this.prisma.billingPeriod.findMany({
        orderBy: { startsAt: "desc" },
        skip: offset(query),
        take: query.pageSize,
        where,
      }),
      this.prisma.billingPeriod.count({ where }),
    ]);
    return page(values.map(serializePeriod), total, query, traceId);
  }

  public async getBillingPeriod(
    actor: DuesActorContext,
    id: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "billingPeriods.read");
    return envelope(
      serializePeriod(
        required(
          await this.prisma.billingPeriod.findFirst({
            where: { id, tenantId: actor.tenantId },
          }),
        ),
      ),
      traceId,
    );
  }

  public createBillingPeriod(
    actor: DuesActorContext,
    key: string | undefined,
    body: CreateBillingPeriodDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "POST",
      "billingPeriods.create",
      {},
      body,
      "billingPeriods.create",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        assertPeriod(body);
        const value = await tx.billingPeriod.create({
          data: {
            dueDate: date(body.dueDate),
            endsAt: date(body.endsAt),
            periodCode: body.periodCode,
            startsAt: date(body.startsAt),
            tenantId: actor.tenantId,
          },
        });
        await this.record(
          tx,
          actor,
          traceId,
          "billingPeriod.created",
          value.id,
        );
        return created(
          serializePeriod(value),
          traceId,
          "BillingPeriod",
          value.id,
        );
      },
    );
  }

  private mutate(
    actor: DuesActorContext,
    key: string | undefined,
    method: "PATCH" | "POST",
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
        method,
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

const denied = () => new DuesFeesError("ACCESS_DENIED");
const conflict = () => new DuesFeesError("RESOURCE_STATE_CONFLICT");
const validation = () => new DuesFeesError("VALIDATION_ERROR");
const crossTenant = () => new DuesFeesError("CROSS_TENANT_REFERENCE");
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
function optionalMoney(value?: string) {
  return value === undefined ? undefined : money(value);
}
function date(value: string) {
  const result = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(result.getTime()) || isoDate(result) !== value)
    throw validation();
  return result;
}
function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
function assertRange(from: string, to?: string) {
  if (to !== undefined && date(to) < date(from)) throw validation();
}
function assertPeriod(body: CreateBillingPeriodDto) {
  const start = date(body.startsAt);
  const end = date(body.endsAt);
  const due = date(body.dueDate);
  const [year, month] = body.periodCode.split("-").map(Number);
  const expectedStart = new Date(Date.UTC(year!, month! - 1, 1));
  const expectedEnd = new Date(Date.UTC(year!, month!, 0));
  if (
    start.getTime() !== expectedStart.getTime() ||
    end.getTime() !== expectedEnd.getTime() ||
    due < start
  )
    throw validation();
}
function statuses(previousStatus: string, newStatus: string) {
  return { newStatus, previousStatus };
}
function statusValue(value: string, allowed: readonly string[]) {
  if (!allowed.includes(value)) throw validation();
  return value.replace(/[A-Z]/gu, (letter) => `_${letter}`).toUpperCase();
}
function offset(query: DuesPageQueryDto) {
  return (query.page - 1) * query.pageSize;
}
function envelope(data: unknown, traceId: string): Envelope {
  return { data, meta: { traceId } };
}
function page(
  data: unknown[],
  total: number,
  query: DuesPageQueryDto,
  traceId: string,
): Envelope {
  return {
    data,
    meta: { page: query.page, pageSize: query.pageSize, total, traceId },
  };
}
function created(
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) {
  return {
    httpStatus: 201,
    responseBody: envelope(data, traceId),
    resourceId,
    resourceType,
  };
}
function ok(
  data: unknown,
  traceId: string,
  resourceType: string,
  resourceId: string,
) {
  return {
    httpStatus: 200,
    responseBody: envelope(data, traceId),
    resourceId,
    resourceType,
  };
}
function compact(value: Readonly<Record<string, unknown>>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}
const serializeConcept = (value: ChargeConcept) => ({
  id: value.id,
  code: value.code,
  name: value.name,
  description: value.description,
  category: value.category,
  defaultAmount:
    value.defaultAmount === null ? null : String(value.defaultAmount),
  currency: value.currency,
  status: value.status,
  isSystem: value.isSystem,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
  archivedAt: value.archivedAt,
});
const serializeSchedule = (value: FeeSchedule) => ({
  id: value.id,
  chargeConceptId: value.chargeConceptId,
  name: value.name,
  amount: String(value.amount),
  currency: value.currency,
  frequency: value.frequency,
  effectiveFrom: isoDate(value.effectiveFrom),
  effectiveTo: value.effectiveTo === null ? null : isoDate(value.effectiveTo),
  status: value.status,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
  archivedAt: value.archivedAt,
});
const serializeUnitFee = (value: UnitFeeAssignment) => ({
  id: value.id,
  propertyUnitId: value.propertyUnitId,
  feeScheduleId: value.feeScheduleId,
  status: value.status,
  startDate: isoDate(value.startDate),
  endDate: value.endDate === null ? null : isoDate(value.endDate),
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
  endedAt: value.endedAt,
  endReason: value.endReason,
});
const serializePeriod = (value: BillingPeriod) => ({
  id: value.id,
  periodCode: value.periodCode,
  startsAt: isoDate(value.startsAt),
  endsAt: isoDate(value.endsAt),
  dueDate: isoDate(value.dueDate),
  status: value.status,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});

import { randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  Charge,
  Payment,
  PaymentAllocation,
  PrismaClient,
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
import { PaymentError, type PaymentActorContext } from "./payments.contract.js";
import type {
  AllocatePaymentDto,
  PaymentAllocationItemDto,
} from "./payment-allocations.dto.js";
import type { PaymentReasonDto } from "./payments.dto.js";

type Transaction = Prisma.TransactionClient;
type ReadClient = Pick<
  PrismaClient,
  | "membershipRole"
  | "settingDefinition"
  | "tenant"
  | "tenantSettingValue"
  | "userTenantMembership"
>;

@Injectable()
export class PaymentAllocationsService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
  ) {}

  public async list(
    actor: PaymentActorContext,
    paymentId: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "payments.read");
    await this.requirePayment(this.prisma, actor.tenantId, paymentId);
    const values = await this.prisma.paymentAllocation.findMany({
      orderBy: [{ allocatedAt: "asc" }, { id: "asc" }],
      where: { paymentId, tenantId: actor.tenantId },
    });
    return envelope(values.map(serializeAllocation), traceId);
  }

  public async get(
    actor: PaymentActorContext,
    allocationId: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "payments.read");
    const value = await this.requireAllocation(
      this.prisma,
      actor.tenantId,
      allocationId,
    );
    return envelope(serializeAllocation(value), traceId);
  }

  public allocate(
    actor: PaymentActorContext,
    paymentId: string,
    key: string | undefined,
    body: AllocatePaymentDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.allocate",
      { paymentId },
      body,
      "payments.allocate",
      async (tx) => {
        if (
          new Set(body.allocations.map((item) => item.chargeId)).size !==
          body.allocations.length
        )
          throw validation();
        await this.currency(tx, actor.tenantId);
        await lockPayment(tx, actor.tenantId, paymentId);
        const payment = await this.requireAssignablePayment(
          tx,
          actor.tenantId,
          paymentId,
        );
        const items = [...body.allocations].sort((a, b) =>
          a.chargeId.localeCompare(b.chargeId),
        );
        await lockCharges(
          tx,
          actor.tenantId,
          items.map((item) => item.chargeId),
        );
        const partialAllowed = await this.setting(
          tx,
          actor.tenantId,
          "financial.partialPaymentsAllowed",
        );
        const available = await this.paymentAvailable(tx, payment);
        let requested = new Prisma.Decimal(0);
        const prepared: Array<{
          charge: Charge;
          amount: Prisma.Decimal;
          item: PaymentAllocationItemDto;
        }> = [];
        for (const item of items) {
          const amount = money(item.amount);
          const charge = await this.requireCharge(
            tx,
            actor.tenantId,
            payment.propertyUnitId,
            item.chargeId,
          );
          const outstanding = await this.chargeOutstanding(tx, charge);
          if (
            amount.gt(outstanding) ||
            (!partialAllowed && !amount.eq(outstanding))
          )
            throw conflict();
          requested = requested.plus(amount);
          prepared.push({ amount, charge, item });
        }
        if (requested.gt(available)) throw conflict();

        const created: PaymentAllocation[] = [];
        for (const entry of prepared) {
          const allocation = await tx.paymentAllocation.create({
            data: {
              allocatedBy: actor.userProfileId,
              amount: entry.amount,
              chargeId: entry.charge.id,
              currency: "USD",
              id: randomUUID(),
              paymentId,
              propertyUnitId: payment.propertyUnitId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
            },
          });
          created.push(allocation);
          await this.record(
            tx,
            actor,
            traceId,
            "paymentAllocation.created",
            allocation.id,
            allocationMetadata(allocation),
          );
        }
        const updatedPayment = await this.recalculatePayment(
          tx,
          paymentId,
          actor.tenantId,
        );
        for (const entry of prepared)
          await this.recalculateCharge(tx, entry.charge.id, actor.tenantId);
        return ok(
          {
            ...serializePaymentTotals(updatedPayment),
            allocations: created.map(serializeAllocation),
          },
          traceId,
          "Payment",
          paymentId,
        );
      },
    );
  }

  public autoAllocate(
    actor: PaymentActorContext,
    paymentId: string,
    key: string | undefined,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.autoAllocate",
      { paymentId },
      {},
      "payments.allocate",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        if (
          !(await this.setting(
            tx,
            actor.tenantId,
            "financial.autoAllocationEnabled",
          ))
        )
          throw conflict();
        await lockPayment(tx, actor.tenantId, paymentId);
        const payment = await this.requireAssignablePayment(
          tx,
          actor.tenantId,
          paymentId,
        );
        const charges = await tx.charge.findMany({
          orderBy: [{ dueDate: "asc" }, { issuedDate: "asc" }, { id: "asc" }],
          where: {
            currency: "USD",
            propertyUnitId: payment.propertyUnitId,
            status: { in: ["ISSUED", "PARTIALLY_PAID"] },
            tenantId: actor.tenantId,
          },
        });
        await lockCharges(
          tx,
          actor.tenantId,
          charges.map((charge) => charge.id),
        );
        const partialAllowed = await this.setting(
          tx,
          actor.tenantId,
          "financial.partialPaymentsAllowed",
        );
        const overpaymentsAllowed = await this.setting(
          tx,
          actor.tenantId,
          "financial.overpaymentsAllowed",
        );
        let remaining = await this.paymentAvailable(tx, payment);
        const created: PaymentAllocation[] = [];
        for (const charge of charges) {
          if (remaining.eq(0)) break;
          const outstanding = await this.chargeOutstanding(tx, charge);
          if (outstanding.lte(0)) continue;
          if (!partialAllowed && remaining.lt(outstanding)) continue;
          const amount = Prisma.Decimal.min(remaining, outstanding);
          const allocation = await tx.paymentAllocation.create({
            data: {
              allocatedBy: actor.userProfileId,
              amount,
              chargeId: charge.id,
              currency: "USD",
              id: randomUUID(),
              paymentId,
              propertyUnitId: payment.propertyUnitId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
            },
          });
          created.push(allocation);
          remaining = remaining.minus(amount);
          await this.record(
            tx,
            actor,
            traceId,
            "paymentAllocation.created",
            allocation.id,
            allocationMetadata(allocation),
          );
        }
        if (!overpaymentsAllowed && remaining.gt(0)) throw conflict();
        const updatedPayment = await this.recalculatePayment(
          tx,
          paymentId,
          actor.tenantId,
        );
        for (const charge of charges)
          await this.recalculateCharge(tx, charge.id, actor.tenantId);
        return ok(
          {
            ...serializePaymentTotals(updatedPayment),
            allocations: created.map(serializeAllocation),
          },
          traceId,
          "Payment",
          paymentId,
        );
      },
    );
  }

  public reverseAllocation(
    actor: PaymentActorContext,
    allocationId: string,
    key: string | undefined,
    body: PaymentReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.allocation.reverse",
      { allocationId },
      body,
      "payments.allocations.reverse",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const initial = await this.requireAllocation(
          tx,
          actor.tenantId,
          allocationId,
        );
        await lockPayment(tx, actor.tenantId, initial.paymentId);
        await lockCharges(tx, actor.tenantId, [initial.chargeId]);
        const allocation = await this.requireAllocation(
          tx,
          actor.tenantId,
          allocationId,
        );
        if (allocation.status !== "ACTIVE") throw conflict();
        const reversal = await tx.paymentAllocationReversal.create({
          data: {
            allocationId,
            amount: allocation.amount,
            currency: allocation.currency,
            id: randomUUID(),
            reason: reason(body.reason),
            reversedBy: actor.userProfileId,
            tenantId: actor.tenantId,
          },
        });
        const value = await tx.paymentAllocation.update({
          data: { status: "REVERSED" },
          where: {
            id_tenantId: { id: allocationId, tenantId: actor.tenantId },
          },
        });
        const payment = await this.recalculatePayment(
          tx,
          allocation.paymentId,
          actor.tenantId,
        );
        await this.recalculateCharge(tx, allocation.chargeId, actor.tenantId);
        await this.record(
          tx,
          actor,
          traceId,
          "paymentAllocation.reversed",
          allocationId,
          allocationMetadata(value),
        );
        return ok(
          {
            ...serializeAllocation(value),
            payment: serializePaymentTotals(payment),
            reversalId: reversal.id,
          },
          traceId,
          "PaymentAllocation",
          allocationId,
        );
      },
    );
  }

  public reversePayment(
    actor: PaymentActorContext,
    paymentId: string,
    key: string | undefined,
    body: PaymentReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.reverse",
      { paymentId },
      body,
      "payments.reverse",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        await lockPayment(tx, actor.tenantId, paymentId);
        const payment = await this.requirePayment(
          tx,
          actor.tenantId,
          paymentId,
        );
        if (
          !(
            ["CONFIRMED", "PARTIALLY_ALLOCATED", "ALLOCATED"] as const
          ).includes(payment.status as never)
        )
          throw conflict();
        const allocations = await tx.paymentAllocation.findMany({
          orderBy: { chargeId: "asc" },
          where: { paymentId, status: "ACTIVE", tenantId: actor.tenantId },
        });
        const chargeIds = [
          ...new Set(allocations.map((value) => value.chargeId)),
        ].sort();
        await lockCharges(tx, actor.tenantId, chargeIds);
        const reversal = await tx.paymentReversal.create({
          data: {
            amount: payment.amount,
            currency: payment.currency,
            id: randomUUID(),
            paymentId,
            reason: reason(body.reason),
            reversedBy: actor.userProfileId,
            tenantId: actor.tenantId,
          },
        });
        for (const allocation of allocations) {
          await tx.paymentAllocationReversal.create({
            data: {
              allocationId: allocation.id,
              amount: allocation.amount,
              currency: allocation.currency,
              id: randomUUID(),
              reason: reason(body.reason),
              reversedBy: actor.userProfileId,
              tenantId: actor.tenantId,
            },
          });
          const value = await tx.paymentAllocation.update({
            data: { status: "REVERSED" },
            where: {
              id_tenantId: { id: allocation.id, tenantId: actor.tenantId },
            },
          });
          await this.record(
            tx,
            actor,
            traceId,
            "paymentAllocation.reversed",
            allocation.id,
            allocationMetadata(value),
          );
        }
        for (const chargeId of chargeIds)
          await this.recalculateCharge(tx, chargeId, actor.tenantId);
        const value = await tx.payment.update({
          data: {
            allocatedAmount: new Prisma.Decimal(0),
            status: "REVERSED",
            unallocatedAmount: new Prisma.Decimal(0),
          },
          where: { id_tenantId: { id: paymentId, tenantId: actor.tenantId } },
        });
        await this.record(tx, actor, traceId, "payment.reversed", paymentId, {
          amount: payment.amount.toFixed(2),
          currency: payment.currency,
          paymentId,
          previousStatus: payment.status,
          newStatus: "REVERSED",
        });
        return ok(
          {
            ...serializePaymentTotals(value),
            reversalId: reversal.id,
            reversedAllocations: allocations.length,
          },
          traceId,
          "Payment",
          paymentId,
        );
      },
    );
  }

  private mutate<T>(
    actor: PaymentActorContext,
    key: string | undefined,
    operationType: string,
    path: Readonly<Record<string, string>>,
    body: unknown,
    permission: string,
    mutation: (tx: Transaction) => Promise<{
      httpStatus: number;
      responseBody: T;
      resourceId?: string;
      resourceType?: string;
    }>,
  ): Promise<IdempotentResult<T>> {
    return this.idempotency.execute(
      {
        actor: actor as IdempotentActor,
        body,
        key,
        method: "POST",
        operationType,
        path,
      },
      (tx) => this.authorize(tx as never, actor, permission),
      mutation,
    );
  }

  private async authorize(
    client: ReadClient,
    actor: PaymentActorContext,
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
          permissions: { some: { permission: { code: permission } } },
          scope: "TENANT",
          tenantId: actor.tenantId,
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
      throw new PaymentError("UNSUPPORTED_TENANT_CURRENCY");
    return "USD";
  }

  private async setting(client: ReadClient, tenantId: string, key: string) {
    const definition = await client.settingDefinition.findUnique({
      where: { key },
    });
    if (definition === null || definition.status !== "ACTIVE") throw conflict();
    const override = await client.tenantSettingValue.findFirst({
      where: { key, status: "ACTIVE", tenantId },
    });
    const value = override?.value ?? definition.defaultValue;
    if (typeof value !== "boolean") throw conflict();
    return value;
  }

  private async requirePayment(
    client: Pick<PrismaClient, "payment"> | Transaction,
    tenantId: string,
    id: string,
  ) {
    const value = await client.payment.findFirst({ where: { id, tenantId } });
    if (value === null) throw notFound();
    return value;
  }

  private async requireAssignablePayment(
    tx: Transaction,
    tenantId: string,
    id: string,
  ) {
    const payment = await this.requirePayment(tx, tenantId, id);
    if (
      !(["CONFIRMED", "PARTIALLY_ALLOCATED"] as const).includes(
        payment.status as never,
      )
    )
      throw conflict();
    return payment;
  }

  private async requireCharge(
    tx: Transaction,
    tenantId: string,
    propertyUnitId: string,
    id: string,
  ) {
    const value = await tx.charge.findFirst({
      where: {
        currency: "USD",
        id,
        propertyUnitId,
        status: { in: ["ISSUED", "PARTIALLY_PAID"] },
        tenantId,
      },
    });
    if (value === null) throw notFound();
    return value;
  }

  private async requireAllocation(
    client: Pick<PrismaClient, "paymentAllocation"> | Transaction,
    tenantId: string,
    id: string,
  ) {
    const value = await client.paymentAllocation.findFirst({
      where: { id, tenantId },
    });
    if (value === null) throw notFound();
    return value;
  }

  private async paymentAvailable(tx: Transaction, payment: Payment) {
    const aggregate = await tx.paymentAllocation.aggregate({
      _sum: { amount: true },
      where: {
        paymentId: payment.id,
        status: "ACTIVE",
        tenantId: payment.tenantId,
      },
    });
    return payment.amount.minus(aggregate._sum.amount ?? 0);
  }

  private async chargeOutstanding(tx: Transaction, charge: Charge) {
    const aggregate = await tx.paymentAllocation.aggregate({
      _sum: { amount: true },
      where: {
        chargeId: charge.id,
        status: "ACTIVE",
        tenantId: charge.tenantId,
      },
    });
    return charge.effectiveAmount.minus(aggregate._sum.amount ?? 0);
  }

  private async recalculatePayment(
    tx: Transaction,
    id: string,
    tenantId: string,
  ) {
    const payment = await this.requirePayment(tx, tenantId, id);
    const allocated = payment.amount.minus(
      await this.paymentAvailable(tx, payment),
    );
    const unallocated = payment.amount.minus(allocated);
    const status = allocated.eq(0)
      ? "CONFIRMED"
      : unallocated.eq(0)
        ? "ALLOCATED"
        : "PARTIALLY_ALLOCATED";
    return tx.payment.update({
      data: {
        allocatedAmount: allocated,
        status,
        unallocatedAmount: unallocated,
      },
      where: { id_tenantId: { id, tenantId } },
    });
  }

  private async recalculateCharge(
    tx: Transaction,
    id: string,
    tenantId: string,
  ) {
    const charge = await tx.charge.findFirst({ where: { id, tenantId } });
    if (charge === null) throw notFound();
    const outstanding = await this.chargeOutstanding(tx, charge);
    if (outstanding.lt(0)) throw conflict();
    const status = outstanding.eq(0)
      ? "PAID"
      : outstanding.eq(charge.effectiveAmount)
        ? "ISSUED"
        : "PARTIALLY_PAID";
    return tx.charge.update({
      data: { status },
      where: { id_tenantId: { id, tenantId } },
    });
  }

  private record(
    tx: Transaction,
    actor: PaymentActorContext,
    traceId: string,
    action: AuditAction,
    resourceId: string,
    metadata: Readonly<Record<string, unknown>>,
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
      { action, metadata, occurredAt: new Date(), resourceId },
    );
  }
}

async function lockPayment(
  tx: Transaction,
  tenantId: string,
  paymentId: string,
) {
  await tx.$queryRaw(
    Prisma.sql`SELECT "id" FROM "payments" WHERE "tenant_id" = ${tenantId} AND "id" = ${paymentId} FOR UPDATE`,
  );
}

async function lockCharges(
  tx: Transaction,
  tenantId: string,
  chargeIds: string[],
) {
  for (const chargeId of [...new Set(chargeIds)].sort())
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "charges" WHERE "tenant_id" = ${tenantId} AND "id" = ${chargeId} FOR UPDATE`,
    );
}

function money(value: string) {
  const amount = new Prisma.Decimal(value);
  if (amount.lte(0) || amount.decimalPlaces() > 2) throw validation();
  return amount;
}

function reason(value: string) {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 500) throw validation();
  return normalized;
}

const denied = () => new PaymentError("ACCESS_DENIED");
const notFound = () => new PaymentError("RESOURCE_NOT_FOUND");
const conflict = () => new PaymentError("RESOURCE_STATE_CONFLICT");
const validation = () => new PaymentError("VALIDATION_ERROR");
const envelope = (data: unknown, traceId: string) => ({
  data,
  meta: { requestId: traceId },
});
const ok = <T>(
  data: T,
  traceId: string,
  resourceType: string,
  resourceId: string,
) => ({
  httpStatus: 200,
  responseBody: envelope(data, traceId),
  resourceId,
  resourceType,
});
const serializeAllocation = (value: PaymentAllocation) => ({
  id: value.id,
  paymentId: value.paymentId,
  chargeId: value.chargeId,
  propertyUnitId: value.propertyUnitId,
  amount: value.amount.toFixed(2),
  currency: value.currency,
  status: value.status,
  allocatedAt: value.allocatedAt.toISOString(),
});
const serializePaymentTotals = (value: Payment) => ({
  paymentId: value.id,
  amount: value.amount.toFixed(2),
  allocatedAmount: value.allocatedAmount.toFixed(2),
  unallocatedAmount: value.unallocatedAmount.toFixed(2),
  currency: value.currency,
  status: value.status,
});
const allocationMetadata = (value: PaymentAllocation) => ({
  allocationId: value.id,
  amount: value.amount.toFixed(2),
  chargeId: value.chargeId,
  currency: value.currency,
  paymentId: value.paymentId,
  propertyUnitId: value.propertyUnitId,
});

import { randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Payment, PaymentReceipt, PrismaClient } from "@prisma/client";

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
  type DocumentActor,
  DocumentStorageError,
  type SourceResourceAuthorizer,
} from "../secure-document-storage/secure-document-storage.contract.js";
import { SecureDocumentStorageService } from "../secure-document-storage/secure-document-storage.service.js";
import { PaymentError, type PaymentActorContext } from "./payments.contract.js";
import type {
  CreatePaymentDto,
  PaymentPageQueryDto,
  PaymentReasonDto,
  ReceiptUploadDto,
} from "./payments.dto.js";

type Transaction = Prisma.TransactionClient;
type ReadClient = Pick<
  PrismaClient,
  | "membershipRole"
  | "person"
  | "propertyOwnership"
  | "residency"
  | "lease"
  | "settingDefinition"
  | "tenant"
  | "tenantSettingValue"
  | "userTenantMembership"
>;
type Envelope = {
  readonly data: unknown;
  readonly meta: Readonly<Record<string, unknown>>;
};

const paymentMethod = {
  bankTransfer: "BANK_TRANSFER",
  cash: "CASH",
  check: "CHECK",
  deposit: "DEPOSIT",
  online: "ONLINE",
  other: "OTHER",
} as const;
const paymentStatus = {
  confirmed: "CONFIRMED",
  draft: "DRAFT",
  pendingValidation: "PENDING_VALIDATION",
  rejected: "REJECTED",
  reported: "REPORTED",
} as const;

@Injectable()
export class PaymentsService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(AUDIT_WRITER_PORT) private readonly audit: AuditWriterPort,
    @Inject(SecureDocumentStorageService)
    private readonly documents: SecureDocumentStorageService,
  ) {}

  public async list(
    actor: PaymentActorContext,
    query: PaymentPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "payments.read");
    return this.findPayments(actor.tenantId, query, traceId);
  }

  public async get(actor: PaymentActorContext, id: string, traceId: string) {
    await this.authorize(this.prisma, actor, "payments.read");
    return envelope(
      serializePayment(
        await this.requirePayment(this.prisma, actor.tenantId, id),
      ),
      traceId,
    );
  }

  public create(
    actor: PaymentActorContext,
    key: string | undefined,
    body: CreatePaymentDto,
    traceId: string,
  ) {
    return this.createPayment(actor, key, body, traceId, false);
  }

  public reportOwn(
    actor: PaymentActorContext,
    key: string | undefined,
    body: CreatePaymentDto,
    traceId: string,
  ) {
    return this.createPayment(actor, key, body, traceId, true);
  }

  public confirm(
    actor: PaymentActorContext,
    id: string,
    key: string | undefined,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.confirm",
      { paymentId: id },
      {},
      "payments.confirm",
      async (tx) => {
        await this.currency(tx, actor.tenantId);
        const payment = await this.requirePayment(tx, actor.tenantId, id);
        if (
          !(["DRAFT", "PENDING_VALIDATION"] as const).includes(
            payment.status as never,
          )
        )
          throw conflict();
        if (
          payment.createdBy === actor.userProfileId ||
          payment.reportedBy === actor.userProfileId
        )
          throw separation();
        if (
          ["BANK_TRANSFER", "DEPOSIT"].includes(payment.method) &&
          (await this.setting(tx, actor.tenantId, "financial.receiptRequired"))
        ) {
          const receipt = await tx.paymentReceipt.findUnique({
            include: { secureDocument: true },
            where: {
              tenantId_paymentId: { tenantId: actor.tenantId, paymentId: id },
            },
          });
          if (
            receipt?.status !== "ACCEPTED" ||
            receipt.secureDocument.status !== "AVAILABLE"
          )
            throw new PaymentError("DOCUMENT_NOT_AVAILABLE");
        }
        const value = await tx.payment.update({
          data: {
            confirmedAt: new Date(),
            confirmedBy: actor.userProfileId,
            status: "CONFIRMED",
          },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        await this.record(tx, actor, traceId, "payment.confirmed", id, {
          previousStatus: payment.status,
          newStatus: "CONFIRMED",
        });
        return ok(serializePayment(value), traceId, "Payment", id);
      },
    );
  }

  public reject(
    actor: PaymentActorContext,
    id: string,
    key: string | undefined,
    body: PaymentReasonDto,
    traceId: string,
  ) {
    return this.mutate(
      actor,
      key,
      "payments.reject",
      { paymentId: id },
      body,
      "payments.reject",
      async (tx) => {
        const payment = await this.requirePayment(tx, actor.tenantId, id);
        if (payment.status !== "PENDING_VALIDATION") throw conflict();
        if (
          payment.createdBy === actor.userProfileId ||
          payment.reportedBy === actor.userProfileId
        )
          throw separation();
        const value = await tx.payment.update({
          data: {
            rejectedAt: new Date(),
            rejectedBy: actor.userProfileId,
            rejectionReason: body.reason,
            status: "REJECTED",
          },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        await this.record(tx, actor, traceId, "payment.rejected", id, {
          previousStatus: "PENDING_VALIDATION",
          newStatus: "REJECTED",
        });
        return ok(serializePayment(value), traceId, "Payment", id);
      },
    );
  }

  public async listOwn(
    actor: PaymentActorContext,
    query: PaymentPageQueryDto,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "payments.read.own");
    const allowed = await this.ownUnitIds(this.prisma, actor);
    if (
      query.propertyUnitId !== undefined &&
      !allowed.has(query.propertyUnitId)
    )
      throw notFound();
    return this.findPayments(actor.tenantId, query, traceId, [...allowed]);
  }

  public async getOwn(actor: PaymentActorContext, id: string, traceId: string) {
    await this.authorize(this.prisma, actor, "payments.read.own");
    const payment = await this.requirePayment(this.prisma, actor.tenantId, id);
    if (
      !(await this.ownUnitIds(this.prisma, actor)).has(payment.propertyUnitId)
    )
      throw notFound();
    return envelope(serializePayment(payment), traceId);
  }

  public async listReceipts(
    actor: PaymentActorContext,
    paymentId: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "paymentReceipts.read");
    await this.requirePayment(this.prisma, actor.tenantId, paymentId);
    const values = await this.prisma.paymentReceipt.findMany({
      where: { paymentId, tenantId: actor.tenantId },
    });
    return envelope(values.map(serializeReceipt), traceId);
  }

  public async getReceipt(
    actor: PaymentActorContext,
    id: string,
    traceId: string,
  ) {
    await this.authorize(this.prisma, actor, "paymentReceipts.read");
    return envelope(
      serializeReceipt(
        await this.requireReceipt(this.prisma, actor.tenantId, id),
      ),
      traceId,
    );
  }

  public async uploadReceipt(
    actor: PaymentActorContext,
    paymentId: string,
    key: string | undefined,
    body: ReceiptUploadDto,
    file: { buffer: Uint8Array; mimetype: string; originalname: string },
    traceId: string,
    own: boolean,
  ) {
    await this.authorize(
      this.prisma,
      actor,
      own ? "paymentReceipts.create.own" : "paymentReceipts.create",
    );
    const payment = await this.requirePayment(
      this.prisma,
      actor.tenantId,
      paymentId,
    );
    if (
      own &&
      !(await this.ownUnitIds(this.prisma, actor)).has(payment.propertyUnitId)
    )
      throw notFound();
    if (
      ["CONFIRMED", "REJECTED", "CANCELLED", "REVERSED", "ARCHIVED"].includes(
        payment.status,
      )
    )
      throw conflict();
    const current = await this.prisma.paymentReceipt.findUnique({
      where: { tenantId_paymentId: { tenantId: actor.tenantId, paymentId } },
    });
    const isReupload = current?.status === "REJECTED";
    const receiptId = current?.id ?? randomUUID();
    const request = {
      actor: documentActor(actor, traceId),
      content: file.buffer,
      declaredMimeType: file.mimetype,
      fileName: file.originalname,
      idempotencyKey: key ?? "",
      sourceResourceId: receiptId,
      title: "Payment receipt",
    };
    const authorizer = this.receiptAuthorizer(actor, paymentId, own, "upload");
    const finalize = async (
      tx: Transaction,
      result: { documentId: string },
    ) => {
      if (current !== null && !isReupload) throw conflict();
      if (current === null) {
        await tx.paymentReceipt.create({
          data: {
            id: receiptId,
            paymentId,
            receiptNumber: body.receiptNumber ?? null,
            secureDocumentId: result.documentId,
            status: "UPLOADED",
            tenantId: actor.tenantId,
            transactionReference: body.transactionReference ?? null,
            uploadedAt: new Date(),
            uploadedBy: actor.userProfileId,
          },
        });
      } else {
        await tx.paymentReceipt.update({
          data: {
            receiptNumber: body.receiptNumber ?? null,
            rejectionReason: null,
            reviewedAt: null,
            reviewedBy: null,
            status: "UPLOADED",
            transactionReference: body.transactionReference ?? null,
            uploadedAt: new Date(),
            uploadedBy: actor.userProfileId,
          },
          where: { id_tenantId: { id: current.id, tenantId: actor.tenantId } },
        });
      }
      await this.record(
        tx,
        actor,
        traceId,
        isReupload ? "paymentReceipt.reuploaded" : "paymentReceipt.uploaded",
        receiptId,
        { paymentId, paymentReceiptId: receiptId },
      );
    };
    try {
      const result = !isReupload
        ? await this.documents.uploadPaymentReceipt(
            request,
            authorizer,
            finalize,
          )
        : await this.documents.reuploadPaymentReceipt(
            { ...request, documentId: current.secureDocumentId },
            authorizer,
            finalize,
          );
      return envelope(
        {
          ...serializeReceipt(
            await this.requireReceipt(this.prisma, actor.tenantId, receiptId),
          ),
          document: {
            fileName: result.fileName,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            status: result.status,
          },
        },
        traceId,
      );
    } catch (error) {
      if (error instanceof DocumentStorageError)
        throw new PaymentError(
          error.code === "DOCUMENT_NOT_AVAILABLE"
            ? "DOCUMENT_NOT_AVAILABLE"
            : "VALIDATION_ERROR",
        );
      throw error;
    }
  }

  public acceptReceipt(
    actor: PaymentActorContext,
    id: string,
    key: string | undefined,
    traceId: string,
  ) {
    return this.reviewReceipt(actor, id, key, undefined, traceId, true);
  }

  public rejectReceipt(
    actor: PaymentActorContext,
    id: string,
    key: string | undefined,
    body: PaymentReasonDto,
    traceId: string,
  ) {
    return this.reviewReceipt(actor, id, key, body.reason, traceId, false);
  }

  public async downloadReceipt(
    actor: PaymentActorContext,
    id: string,
    traceId: string,
    own: boolean,
  ) {
    await this.authorize(
      this.prisma,
      actor,
      own ? "paymentReceipts.download.own" : "paymentReceipts.download",
    );
    const receipt = await this.requireReceipt(this.prisma, actor.tenantId, id);
    const payment = await this.requirePayment(
      this.prisma,
      actor.tenantId,
      receipt.paymentId,
    );
    if (
      own &&
      !(await this.ownUnitIds(this.prisma, actor)).has(payment.propertyUnitId)
    )
      throw notFound();
    if (!(["UPLOADED", "ACCEPTED"] as const).includes(receipt.status as never))
      throw new PaymentError("DOCUMENT_NOT_AVAILABLE");
    const value = await this.documents.readAvailable(
      documentActor(actor, traceId),
      receipt.secureDocumentId,
      this.receiptAuthorizer(actor, receipt.paymentId, own, "read"),
    );
    await this.prisma.$transaction((tx) =>
      this.record(tx, actor, traceId, "paymentReceipt.downloaded", id, {
        paymentId: receipt.paymentId,
        paymentReceiptId: id,
      }),
    );
    return value;
  }

  private createPayment(
    actor: PaymentActorContext,
    key: string | undefined,
    body: CreatePaymentDto,
    traceId: string,
    own: boolean,
  ) {
    return this.mutate(
      actor,
      key,
      own ? "payments.report.own" : "payments.create",
      {},
      body,
      own ? "payments.create.own" : "payments.create",
      async (tx) => {
        const currency = await this.currency(tx, actor.tenantId);
        if (
          own &&
          !(await this.ownUnitIds(tx as never, actor)).has(body.propertyUnitId)
        )
          throw notFound();
        if (
          !own &&
          (await tx.propertyUnit.findFirst({
            where: {
              id: body.propertyUnitId,
              status: "ACTIVE",
              tenantId: actor.tenantId,
            },
          })) === null
        )
          throw new PaymentError("CROSS_TENANT_REFERENCE");
        const amount = money(body.amount);
        const value = await tx.payment.create({
          data: {
            allocatedAmount: new Prisma.Decimal(0),
            amount,
            createdBy: actor.userProfileId,
            currency,
            externalReference: body.externalReference ?? null,
            method: paymentMethod[body.method as keyof typeof paymentMethod],
            notes: body.notes ?? null,
            paidAt: new Date(body.paidAt),
            propertyUnitId: body.propertyUnitId,
            reportedAt: own ? new Date() : null,
            reportedBy: own ? actor.userProfileId : null,
            status: own ? "PENDING_VALIDATION" : "DRAFT",
            tenantId: actor.tenantId,
            transactionReference: body.transactionReference ?? null,
            unallocatedAmount: amount,
          },
        });
        await this.record(
          tx,
          actor,
          traceId,
          own ? "payment.reported" : "payment.created",
          value.id,
          {
            amount: amount.toFixed(2),
            currency,
            paymentMethod: value.method,
            propertyUnitId: value.propertyUnitId,
          },
        );
        return created(serializePayment(value), traceId, "Payment", value.id);
      },
    );
  }

  private reviewReceipt(
    actor: PaymentActorContext,
    id: string,
    key: string | undefined,
    reason: string | undefined,
    traceId: string,
    accept: boolean,
  ) {
    return this.mutate(
      actor,
      key,
      accept ? "paymentReceipts.accept" : "paymentReceipts.reject",
      { paymentReceiptId: id },
      reason === undefined ? {} : { reason },
      "paymentReceipts.review",
      async (tx) => {
        const receipt = await this.requireReceipt(tx, actor.tenantId, id);
        if (receipt.status !== "UPLOADED") throw conflict();
        if (receipt.uploadedBy === actor.userProfileId) throw separation();
        const next = accept ? "ACCEPTED" : "REJECTED";
        const value = await tx.paymentReceipt.update({
          data: {
            rejectionReason: accept ? null : (reason ?? null),
            reviewedAt: new Date(),
            reviewedBy: actor.userProfileId,
            status: next,
          },
          where: { id_tenantId: { id, tenantId: actor.tenantId } },
        });
        await this.record(
          tx,
          actor,
          traceId,
          accept ? "paymentReceipt.accepted" : "paymentReceipt.rejected",
          id,
          {
            paymentId: receipt.paymentId,
            paymentReceiptId: id,
            previousStatus: "UPLOADED",
            newStatus: next,
          },
        );
        return ok(serializeReceipt(value), traceId, "PaymentReceipt", id);
      },
    );
  }

  private receiptAuthorizer(
    actor: PaymentActorContext,
    paymentId: string,
    own: boolean,
    access: "read" | "upload",
  ): SourceResourceAuthorizer {
    const verify = async (tx: Transaction) => {
      await this.authorize(
        tx as never,
        actor,
        access === "read"
          ? own
            ? "paymentReceipts.download.own"
            : "paymentReceipts.download"
          : own
            ? "paymentReceipts.create.own"
            : "paymentReceipts.create",
      );
      await this.requirePayment(tx, actor.tenantId, paymentId);
      if (
        own &&
        !(await this.ownUnitIds(tx as never, actor)).has(
          (await this.requirePayment(tx, actor.tenantId, paymentId))
            .propertyUnitId,
        )
      )
        throw notFound();
    };
    return {
      authorizeArchive: (tx) => verify(tx),
      authorizeRead: (tx) => verify(tx),
      authorizeUpload: (tx) => verify(tx),
    };
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
      throw new PaymentError("UNSUPPORTED_TENANT_CURRENCY");
    return "USD";
  }

  private async setting(
    client: ReadClient,
    tenantId: string,
    key: string,
  ): Promise<boolean> {
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

  private async ownUnitIds(
    client: ReadClient,
    actor: PaymentActorContext,
  ): Promise<Set<string>> {
    const person = await client.person.findFirst({
      where: {
        status: "ACTIVE",
        tenantId: actor.tenantId,
        userProfileId: actor.userProfileId,
      },
    });
    if (person === null) throw notFound();
    const [ownerships, residencies, leases] = await Promise.all([
      client.propertyOwnership.findMany({
        select: { propertyUnitId: true },
        where: {
          personId: person.id,
          status: "ACTIVE",
          tenantId: actor.tenantId,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
      client.residency.findMany({
        select: { propertyUnitId: true },
        where: {
          personId: person.id,
          status: "ACTIVE",
          tenantId: actor.tenantId,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
      client.lease.findMany({
        select: { propertyUnitId: true },
        where: {
          status: "ACTIVE",
          tenantId: actor.tenantId,
          tenantPersonId: person.id,
          propertyUnit: { status: "ACTIVE" },
        },
      }),
    ]);
    return new Set(
      [...ownerships, ...residencies, ...leases].map(
        (value) => value.propertyUnitId,
      ),
    );
  }

  private async findPayments(
    tenantId: string,
    query: PaymentPageQueryDto,
    traceId: string,
    units?: string[],
  ) {
    const where: Prisma.PaymentWhereInput = {
      tenantId,
      ...(query.propertyUnitId === undefined
        ? {}
        : { propertyUnitId: query.propertyUnitId }),
      ...(query.status === undefined
        ? {}
        : {
            status: paymentStatus[query.status as keyof typeof paymentStatus],
          }),
      ...(units === undefined ? {} : { propertyUnitId: { in: units } }),
    };
    const [values, total] = await Promise.all([
      this.prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        where,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      data: values.map(serializePayment),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        requestId: traceId,
        total,
      },
    };
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

  private async requireReceipt(
    client: Pick<PrismaClient, "paymentReceipt"> | Transaction,
    tenantId: string,
    id: string,
  ) {
    const value = await client.paymentReceipt.findFirst({
      where: { id, tenantId },
    });
    if (value === null) throw notFound();
    return value;
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

function money(value: string): Prisma.Decimal {
  const amount = new Prisma.Decimal(value);
  if (amount.lte(0) || amount.decimalPlaces() > 2)
    throw new PaymentError("VALIDATION_ERROR");
  return amount;
}
const denied = () => new PaymentError("ACCESS_DENIED");
const notFound = () => new PaymentError("RESOURCE_NOT_FOUND");
const conflict = () => new PaymentError("RESOURCE_STATE_CONFLICT");
const separation = () => new PaymentError("SEPARATION_OF_DUTIES_VIOLATION");
const envelope = (data: unknown, traceId: string): Envelope => ({
  data,
  meta: { requestId: traceId },
});
const created = <T>(
  data: T,
  traceId: string,
  resourceType: string,
  resourceId: string,
) => ({
  httpStatus: 201,
  responseBody: envelope(data, traceId),
  resourceId,
  resourceType,
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
const documentActor = (
  actor: PaymentActorContext,
  traceId: string,
): DocumentActor => ({ ...actor, traceId });
const serializePayment = (value: Payment) => ({
  id: value.id,
  propertyUnitId: value.propertyUnitId,
  method: value.method,
  amount: value.amount.toFixed(2),
  allocatedAmount: value.allocatedAmount.toFixed(2),
  unallocatedAmount: value.unallocatedAmount.toFixed(2),
  currency: value.currency,
  paidAt: value.paidAt.toISOString(),
  status: value.status,
  transactionReference: value.transactionReference,
  externalReference: value.externalReference,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
const serializeReceipt = (value: PaymentReceipt) => ({
  id: value.id,
  paymentId: value.paymentId,
  receiptNumber: value.receiptNumber,
  transactionReference: value.transactionReference,
  status: value.status,
  uploadedAt: value.uploadedAt?.toISOString() ?? null,
  reviewedAt: value.reviewedAt?.toISOString() ?? null,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});

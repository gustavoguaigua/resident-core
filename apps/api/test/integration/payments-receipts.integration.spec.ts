import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import type { PaymentActorContext } from "../../src/modules/payments/payments.contract.js";
import { PaymentsService } from "../../src/modules/payments/payments.service.js";
import { parseDocumentStorageConfig } from "../../src/modules/secure-document-storage/document-storage.config.js";
import { S3DocumentStorageAdapter } from "../../src/modules/secure-document-storage/s3-document-storage.adapter.js";
import { SecureDocumentStorageService } from "../../src/modules/secure-document-storage/secure-document-storage.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.PAYMENTS_PHASE6_TEST === "1";
const prisma = new PrismaService();
const idempotency = new IdempotencyService(prisma);
const audit = new PrismaAuditWriter(prisma);
const storage = new S3DocumentStorageAdapter(
  parseDocumentStorageConfig(process.env),
);
const documents = new SecureDocumentStorageService(
  prisma,
  idempotency,
  storage,
);
const service = new PaymentsService(prisma, idempotency, audit, documents);
const permissions = [
  "payments.read",
  "payments.create",
  "payments.confirm",
  "payments.reject",
  "payments.read.own",
  "payments.create.own",
  "paymentReceipts.read",
  "paymentReceipts.create",
  "paymentReceipts.download",
  "paymentReceipts.review",
  "paymentReceipts.create.own",
  "paymentReceipts.download.own",
] as const;
const key = (label: string) => `${label}-${randomUUID()}`;
const trace = (label: string) => `phase6-${label}-${randomUUID()}`;
const paymentBody = (propertyUnitId: string) => ({
  amount: "125.50",
  method: "bankTransfer",
  paidAt: "2026-09-06T10:30:00.000Z",
  propertyUnitId,
  transactionReference: "TX-SAFE-001",
});
const pdf = () => ({
  buffer: Buffer.from("%PDF-1.7\n%%EOF", "utf8"),
  mimetype: "application/pdf",
  originalname: "receipt.pdf",
});

beforeAll(async () => {
  await prisma.$connect();
  await storage.ensurePrivateBucket();
});
afterAll(async () => prisma.$disconnect());

describe
  .skipIf(!enabled)
  .sequential("Sprint 3 Phase 6 payments and receipts", () => {
    it("creates an administrative draft idempotently with USD decimal invariants", async () => {
      const { actor, unit } = await createActor(permissions);
      const requestKey = key("admin-create");
      const first = await service.create(
        actor,
        requestKey,
        paymentBody(unit.id),
        trace("create"),
      );
      const replay = await service.create(
        actor,
        requestKey,
        paymentBody(unit.id),
        trace("replay"),
      );
      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(first.responseBody.data).toMatchObject({
        allocatedAmount: "0.00",
        amount: "125.50",
        currency: "USD",
        status: "DRAFT",
        unallocatedAmount: "125.50",
      });
      expect(
        await prisma.payment.count({ where: { tenantId: actor.tenantId } }),
      ).toBe(1);
      expect(
        await prisma.auditLog.count({
          where: { action: "payment.created", tenantId: actor.tenantId },
        }),
      ).toBe(1);
      await expect(
        service.create(
          actor,
          requestKey,
          { ...paymentBody(unit.id), amount: "126.00" },
          trace("conflict"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      await expect(
        service.create(
          actor,
          undefined,
          paymentBody(unit.id),
          trace("missing"),
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REQUIRED" });
    });

    it("reports own payments and enforces ownership and separation of duties", async () => {
      const owner = await createActor(permissions, undefined, true);
      const reported = await service.reportOwn(
        owner.actor,
        key("own"),
        paymentBody(owner.unit.id),
        trace("own"),
      );
      const paymentId = (reported.responseBody.data as { id: string }).id;
      expect(reported.responseBody.data).toMatchObject({
        status: "PENDING_VALIDATION",
      });
      await expect(
        service.confirm(
          owner.actor,
          paymentId,
          key("self-confirm"),
          trace("self"),
        ),
      ).rejects.toMatchObject({ code: "SEPARATION_OF_DUTIES_VIOLATION" });
      const reviewer = await createActor(permissions, owner.actor.tenantId);
      await expect(
        service.confirm(
          reviewer.actor,
          paymentId,
          key("needs-receipt"),
          trace("needs-receipt"),
        ),
      ).rejects.toMatchObject({ code: "DOCUMENT_NOT_AVAILABLE" });
      const outsider = await createActor(permissions, undefined, true);
      await expect(
        service.getOwn(outsider.actor, paymentId, trace("cross-tenant")),
      ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
    });

    it("uploads, rejects and reuploads one private receipt without exposing storage internals", async () => {
      const owner = await createActor(permissions, undefined, true);
      const reported = await service.reportOwn(
        owner.actor,
        key("payment"),
        paymentBody(owner.unit.id),
        trace("payment"),
      );
      const paymentId = (reported.responseBody.data as { id: string }).id;
      const uploadKey = key("upload");
      const uploaded = await service.uploadReceipt(
        owner.actor,
        paymentId,
        uploadKey,
        { receiptNumber: "R-001" },
        pdf(),
        trace("upload"),
        true,
      );
      const receipt = uploaded.data as {
        id: string;
        document: unknown;
        status: string;
      };
      expect(receipt.status).toBe("UPLOADED");
      expect(JSON.stringify(uploaded)).not.toMatch(
        /storageKey|bucket|provider|fileHash/iu,
      );
      const replay = await service.uploadReceipt(
        owner.actor,
        paymentId,
        uploadKey,
        { receiptNumber: "R-001" },
        pdf(),
        trace("upload-replay"),
        true,
      );
      expect((replay.data as { id: string }).id).toBe(receipt.id);
      expect(await prisma.paymentReceipt.count({ where: { paymentId } })).toBe(
        1,
      );
      expect(
        await prisma.secureDocument.count({
          where: { sourceResourceId: receipt.id },
        }),
      ).toBe(1);
      const reviewer = await createActor(permissions, owner.actor.tenantId);
      await service.rejectReceipt(
        reviewer.actor,
        receipt.id,
        key("reject-receipt"),
        { reason: "UNREADABLE" },
        trace("reject"),
      );
      const reuploaded = await service.uploadReceipt(
        owner.actor,
        paymentId,
        key("reupload"),
        { receiptNumber: "R-002" },
        { ...pdf(), buffer: Buffer.from("%PDF-1.7\nnew\n%%EOF") },
        trace("reupload"),
        true,
      );
      expect((reuploaded.data as { status: string }).status).toBe("UPLOADED");
      const stored = await prisma.paymentReceipt.findUniqueOrThrow({
        where: { id: receipt.id },
      });
      expect(
        await prisma.secureDocumentVersion.count({
          where: { documentId: stored.secureDocumentId },
        }),
      ).toBe(2);
    });

    it("reviews, downloads and confirms with durable sanitized audit", async () => {
      const owner = await createActor(permissions, undefined, true);
      const reported = await service.reportOwn(
        owner.actor,
        key("confirm-payment"),
        paymentBody(owner.unit.id),
        trace("payment"),
      );
      const paymentId = (reported.responseBody.data as { id: string }).id;
      const uploaded = await service.uploadReceipt(
        owner.actor,
        paymentId,
        key("confirm-upload"),
        {},
        pdf(),
        trace("upload"),
        true,
      );
      const receiptId = (uploaded.data as { id: string }).id;
      const reviewer = await createActor(permissions, owner.actor.tenantId);
      await service.acceptReceipt(
        reviewer.actor,
        receiptId,
        key("accept"),
        trace("accept"),
      );
      const downloaded = await service.downloadReceipt(
        owner.actor,
        receiptId,
        trace("download"),
        true,
      );
      expect(Buffer.from(downloaded.body).toString("utf8")).toContain("%PDF");
      const confirmer = await createActor(permissions, owner.actor.tenantId);
      const confirmed = await service.confirm(
        confirmer.actor,
        paymentId,
        key("confirm"),
        trace("confirm"),
      );
      expect(confirmed.responseBody.data).toMatchObject({
        status: "CONFIRMED",
      });
      expect(
        await prisma.auditLog.count({
          where: { action: "paymentReceipt.downloaded", resourceId: receiptId },
        }),
      ).toBe(1);
      const auditRows = await prisma.auditLog.findMany({
        where: { tenantId: owner.actor.tenantId },
      });
      expect(JSON.stringify(auditRows)).not.toMatch(
        /TX-SAFE-001|receipt\.pdf|storageKey|fileHash/iu,
      );
    });

    it("rejects non-USD tenants, invalid amounts, permission absence and cross-tenant units", async () => {
      const denied = await createActor([]);
      await expect(
        service.create(
          denied.actor,
          key("denied"),
          paymentBody(denied.unit.id),
          trace("denied"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      const foreign = await createActor(permissions);
      const actor = await createActor(permissions);
      await expect(
        service.create(
          actor.actor,
          key("foreign"),
          paymentBody(foreign.unit.id),
          trace("foreign"),
        ),
      ).rejects.toMatchObject({ code: "CROSS_TENANT_REFERENCE" });
      await prisma.tenant.update({
        data: { currency: "EUR" },
        where: { id: actor.actor.tenantId },
      });
      await expect(
        service.create(
          actor.actor,
          key("currency"),
          paymentBody(actor.unit.id),
          trace("currency"),
        ),
      ).rejects.toMatchObject({ code: "UNSUPPORTED_TENANT_CURRENCY" });
      await expect(
        service.create(
          foreign.actor,
          key("amount"),
          { ...paymentBody(foreign.unit.id), amount: "0" },
          trace("amount"),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

async function createActor(
  codes: readonly string[],
  tenantId: string = randomUUID(),
  own = false,
): Promise<{ actor: PaymentActorContext; unit: { id: string } }> {
  const userProfile = await prisma.userProfile.create({
    data: {
      displayName: "Phase Six User",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
    },
  });
  const tenant = await prisma.tenant.upsert({
    create: {
      currency: "USD",
      id: tenantId,
      name: `Tenant ${tenantId}`,
      slug: `t-${tenantId}`,
      status: "ACTIVE",
    },
    update: {},
    where: { id: tenantId },
  });
  await prisma.settingDefinition.upsert({
    create: {
      category: "FINANCIAL",
      createdBy: userProfile.id,
      defaultValue: true,
      key: "financial.receiptRequired",
      schema: { type: "boolean" },
      status: "ACTIVE",
      valueType: "BOOLEAN",
    },
    update: {},
    where: { key: "financial.receiptRequired" },
  });
  const membership = await prisma.userTenantMembership.create({
    data: {
      joinedAt: new Date(),
      status: "ACTIVE",
      tenantId: tenant.id,
      userProfileId: userProfile.id,
    },
  });
  const role = await prisma.role.create({
    data: {
      code: `Phase6-${randomUUID()}`,
      name: "Phase 6",
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
  if (own) {
    const person = await prisma.person.create({
      data: {
        displayName: "Owner",
        status: "ACTIVE",
        tenantId: tenant.id,
        userProfileId: userProfile.id,
      },
    });
    await prisma.propertyOwnership.create({
      data: {
        personId: person.id,
        propertyUnitId: unit.id,
        startDate: new Date("2026-01-01"),
        status: "ACTIVE",
        tenantId: tenant.id,
      },
    });
  }
  return {
    actor: {
      membershipId: membership.id,
      tenantId: tenant.id,
      userProfileId: userProfile.id,
    },
    unit,
  };
}

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseDocumentStorageConfig } from "../../src/modules/secure-document-storage/document-storage.config.js";
import { S3DocumentStorageAdapter } from "../../src/modules/secure-document-storage/s3-document-storage.adapter.js";
import type {
  DocumentActor,
  DocumentStoragePort,
  SourceResourceAuthorizer,
} from "../../src/modules/secure-document-storage/secure-document-storage.contract.js";
import { SecureDocumentStorageService } from "../../src/modules/secure-document-storage/secure-document-storage.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";
import { IdempotencyService } from "../../src/platform/idempotency/idempotency.service.js";

const enabled = process.env.DOCUMENTS_PHASE3_TEST === "1";
const prisma = new PrismaService();
const config = parseDocumentStorageConfig(process.env);
const storage = new S3DocumentStorageAdapter(config);
const service = new SecureDocumentStorageService(
  prisma,
  new IdempotencyService(prisma),
  storage,
);
const pdf = Uint8Array.from(Buffer.from("%PDF- synthetic phase 3 receipt"));
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const png = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1,
]);

const allow: SourceResourceAuthorizer = {
  async authorizeArchive() {},
  async authorizeRead() {},
  async authorizeUpload() {},
};
const deny: SourceResourceAuthorizer = {
  async authorizeArchive() {
    throw new Error("ACCESS_DENIED");
  },
  async authorizeRead() {
    throw new Error("ACCESS_DENIED");
  },
  async authorizeUpload() {
    throw new Error("ACCESS_DENIED");
  },
};

beforeAll(async () => {
  if (!enabled) return;
  await prisma.$connect();
  await storage.ensurePrivateBucket();
});
afterAll(async () => {
  if (enabled) await prisma.$disconnect();
});

describe
  .skipIf(!enabled)
  .sequential("Sprint 3 Phase 3 secure document storage", () => {
    it("uploads, replays and reads an allowlisted private receipt without exposing internals", async () => {
      const actor = await createActor();
      const sourceResourceId = randomUUID();
      const idempotencyKey = `phase3-upload-${randomUUID()}`;
      const request = {
        actor,
        content: pdf,
        declaredMimeType: "application/pdf",
        fileName: "receipt.pdf",
        idempotencyKey,
        sourceResourceId,
        title: "Payment receipt",
      } as const;
      const first = await service.uploadPaymentReceipt(request, allow);
      const replay = await service.uploadPaymentReceipt(request, allow);
      expect(first.replayed).toBe(false);
      expect(replay).toEqual({ ...first, replayed: true });
      expect(JSON.stringify(first)).not.toMatch(
        /storageKey|fileHash|bucket|provider/iu,
      );
      expect(
        await prisma.secureDocument.count({ where: { id: first.documentId } }),
      ).toBe(1);
      expect(
        await prisma.secureDocumentVersion.count({
          where: { documentId: first.documentId },
        }),
      ).toBe(1);
      expect(
        await prisma.secureDocumentFile.count({
          where: { documentId: first.documentId },
        }),
      ).toBe(1);
      expect(
        await prisma.auditLog.count({
          where: {
            action: "document.uploadFinalized",
            resourceId: first.documentId,
          },
        }),
      ).toBe(1);
      const operation = await prisma.idempotencyOperation.findFirstOrThrow({
        where: {
          operationType: "secureDocument.paymentReceipt.upload",
          tenantId: actor.tenantId,
        },
      });
      expect(JSON.stringify(operation)).not.toContain(idempotencyKey);
      expect(JSON.stringify(operation)).not.toContain(
        Buffer.from(pdf).toString("utf8"),
      );
      const downloaded = await service.readAvailable(
        actor,
        first.documentId,
        allow,
      );
      expect(downloaded.body).toEqual(pdf);
      expect(downloaded).toMatchObject({
        fileName: "receipt.pdf",
        mimeType: "application/pdf",
      });
    });

    it.each([
      ["photo.jpg", "image/jpeg", jpeg],
      ["image.png", "image/png", png],
    ])(
      "accepts %s with matching MIME and magic bytes",
      async (fileName, mimeType, content) => {
        const result = await service.uploadPaymentReceipt(
          input(await createActor(), fileName, mimeType, content),
          allow,
        );
        expect(result.status).toBe("AVAILABLE");
      },
    );

    it.each([
      ["empty.pdf", "application/pdf", new Uint8Array()],
      ["receipt/evil.pdf", "application/pdf", pdf],
      ["receipt..pdf", "application/pdf", pdf],
      ["receipt.svg", "image/svg+xml", Uint8Array.from([1])],
      ["receipt.jpg", "image/png", png],
      ["receipt.pdf", "application/pdf", Uint8Array.from([1, 2, 3])],
      ["large.pdf", "application/pdf", new Uint8Array(10_485_761)],
    ])(
      "rejects unsafe or mismatched file %s",
      async (fileName, mimeType, content) => {
        await expect(
          service.uploadPaymentReceipt(
            input(await createActor(), fileName, mimeType, content),
            allow,
          ),
        ).rejects.toMatchObject({
          code: expect.stringMatching(/^DOCUMENT_FILE_/u),
        });
      },
    );

    it("fails closed before ledger or storage access when source authorization is denied", async () => {
      const actor = await createActor();
      const before = await prisma.idempotencyOperation.count({
        where: { tenantId: actor.tenantId },
      });
      await expect(
        service.uploadPaymentReceipt(input(actor), deny),
      ).rejects.toThrow("ACCESS_DENIED");
      expect(
        await prisma.idempotencyOperation.count({
          where: { tenantId: actor.tenantId },
        }),
      ).toBe(before);
    });

    it("isolates tenants and rejects cross-tenant document relations", async () => {
      const left = await createActor();
      const right = await createActor();
      const document = await service.uploadPaymentReceipt(input(right), allow);
      await expect(
        service.readAvailable(left, document.documentId, allow),
      ).rejects.toMatchObject({
        code: "DOCUMENT_NOT_FOUND",
      });
      await expect(
        prisma.secureDocumentVersion.create({
          data: {
            createdBy: left.userProfileId,
            documentId: document.documentId,
            status: "DRAFT",
            tenantId: left.tenantId,
            versionNumber: 2,
          },
        }),
      ).rejects.toMatchObject({ code: "P2003" });
    });

    it("conflicts on a changed payload and fails closed for unavailable states", async () => {
      const actor = await createActor();
      const request = input(actor);
      const created = await service.uploadPaymentReceipt(request, allow);
      await expect(
        service.uploadPaymentReceipt(
          {
            ...request,
            content: png,
            declaredMimeType: "image/png",
            fileName: "receipt.png",
          },
          allow,
        ),
      ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_CONFLICT" });
      await prisma.secureDocumentFile.update({
        data: { status: "QUARANTINED" },
        where: { id: created.fileId },
      });
      await expect(
        service.readAvailable(actor, created.documentId, allow),
      ).rejects.toMatchObject({
        code: "DOCUMENT_NOT_AVAILABLE",
      });
    });

    it("rejects a concurrent upload while the same idempotency operation is in progress", async () => {
      const actor = await createActor();
      const request = input(actor);
      let releasePromotion!: () => void;
      let promotionStarted!: () => void;
      const release = new Promise<void>((resolve) => {
        releasePromotion = resolve;
      });
      const started = new Promise<void>((resolve) => {
        promotionStarted = resolve;
      });
      const blockingStorage: DocumentStoragePort = {
        delete: (key) => storage.delete(key),
        ensurePrivateBucket: () => storage.ensurePrivateBucket(),
        listTenantObjects: (tenantId) => storage.listTenantObjects(tenantId),
        promote: async (temporaryKey, tenantId, objectId) => {
          promotionStarted();
          await release;
          return storage.promote(temporaryKey, tenantId, objectId);
        },
        read: (key) => storage.read(key),
        writeTemporary: (tenantId, uploadId, body) =>
          storage.writeTemporary(tenantId, uploadId, body),
      };
      const blocking = new SecureDocumentStorageService(
        prisma,
        new IdempotencyService(prisma),
        blockingStorage,
      );
      const first = blocking.uploadPaymentReceipt(request, allow);
      await started;
      await expect(
        blocking.uploadPaymentReceipt(request, allow),
      ).rejects.toMatchObject({
        code: "IDEMPOTENCY_OPERATION_IN_PROGRESS",
      });
      releasePromotion();
      await expect(first).resolves.toMatchObject({
        replayed: false,
        status: "AVAILABLE",
      });
    });

    it("rolls back DB and ledger and compensates a promoted object when Audit validation fails", async () => {
      const actor = { ...(await createActor()), traceId: "invalid trace" };
      const before = await prisma.secureDocument.count();
      await expect(
        service.uploadPaymentReceipt(input(actor), allow),
      ).rejects.toThrow();
      expect(await prisma.secureDocument.count()).toBe(before);
      expect(
        await prisma.idempotencyOperation.count({
          where: { tenantId: actor.tenantId },
        }),
      ).toBe(0);
    });

    it("records failed compensation without leaking the internal object key", async () => {
      const actor = { ...(await createActor()), traceId: "invalid trace" };
      const failingStorage: DocumentStoragePort = {
        ...storage,
        delete: async () => {
          throw new Error("synthetic delete failure");
        },
        ensurePrivateBucket: () => storage.ensurePrivateBucket(),
        listTenantObjects: (tenantId) => storage.listTenantObjects(tenantId),
        promote: (temporaryKey, tenantId, objectId) =>
          storage.promote(temporaryKey, tenantId, objectId),
        read: (key) => storage.read(key),
        writeTemporary: (tenantId, uploadId, body) =>
          storage.writeTemporary(tenantId, uploadId, body),
      };
      const failing = new SecureDocumentStorageService(
        prisma,
        new IdempotencyService(prisma),
        failingStorage,
      );
      await expect(
        failing.uploadPaymentReceipt(input(actor), allow),
      ).rejects.toThrow();
      const audit = await prisma.auditLog.findFirstOrThrow({
        where: {
          action: "document.compensationFailed",
          tenantId: actor.tenantId,
        },
      });
      expect(JSON.stringify(audit)).not.toMatch(
        /storageKey|bucket|synthetic delete/iu,
      );
    });

    it("reconciles only expired unreferenced tenant objects", async () => {
      const actor = await createActor();
      const orphanId = randomUUID();
      const orphanKey = await storage.writeTemporary(
        actor.tenantId,
        orphanId,
        pdf,
      );
      const result = await service.uploadPaymentReceipt(input(actor), allow);
      expect(
        await service.reconcileExpiredOrphans(
          actor.tenantId,
          new Date(Date.now() + 25 * 60 * 60 * 1000),
        ),
      ).toBeGreaterThanOrEqual(1);
      await expect(storage.read(orphanKey)).rejects.toThrow();
      await expect(
        service.readAvailable(actor, result.documentId, allow),
      ).resolves.toMatchObject({ body: pdf });
      expect(
        await prisma.auditLog.count({
          where: {
            action: "document.orphanDetected",
            tenantId: actor.tenantId,
          },
        }),
      ).toBeGreaterThanOrEqual(1);
    });

    it("requires TLS and SSE outside local", () => {
      expect(() =>
        parseDocumentStorageConfig({
          APP_ENV: "production",
          DOCUMENT_STORAGE_PROVIDER: "S3_COMPATIBLE",
          S3_ACCESS_KEY: "synthetic",
          S3_BUCKET: "private",
          S3_ENDPOINT: "http://storage.example.test",
          S3_SECRET_KEY: "synthetic",
        }),
      ).toThrow(/TLS/u);
    });

    it("archives tenant metadata without deleting its referenced private object", async () => {
      const actor = await createActor();
      const created = await service.uploadPaymentReceipt(input(actor), allow);
      const file = await prisma.secureDocumentFile.findUniqueOrThrow({
        where: { id: created.fileId },
      });
      await service.archiveMetadata(actor, created.documentId, allow);
      await expect(
        service.readAvailable(actor, created.documentId, allow),
      ).rejects.toMatchObject({
        code: "DOCUMENT_NOT_AVAILABLE",
      });
      await expect(storage.read(file.storageKey)).resolves.toEqual(pdf);
      await expect(
        prisma.secureDocument.findUniqueOrThrow({
          where: { id: created.documentId },
        }),
      ).resolves.toMatchObject({
        status: "ARCHIVED",
        archivedAt: expect.any(Date),
      });
    });
  });

function input(
  actor: DocumentActor,
  fileName = "receipt.pdf",
  declaredMimeType = "application/pdf",
  content = pdf,
) {
  return {
    actor,
    content,
    declaredMimeType,
    fileName,
    idempotencyKey: `phase3-${randomUUID()}`,
    sourceResourceId: randomUUID(),
    title: "Synthetic receipt",
  };
}

async function createActor(): Promise<DocumentActor> {
  const user = await prisma.userProfile.create({
    data: {
      displayName: "Phase 3 Actor",
      email: `${randomUUID()}@example.test`,
      keycloakSubjectId: randomUUID(),
      status: "ACTIVE",
      userType: "HUMAN",
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      name: "Phase 3 Tenant",
      slug: `phase3-${randomUUID()}`,
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
  return {
    membershipId: membership.id,
    tenantId: tenant.id,
    traceId: `phase3-${randomUUID()}`,
    userProfileId: user.id,
  };
}

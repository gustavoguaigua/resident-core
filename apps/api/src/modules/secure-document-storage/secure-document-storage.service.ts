import { createHash, randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";

import { prepareAuditRecord } from "../audit/domain-audit-event.js";
import { PrismaService } from "../../platform/database/prisma.service.js";
import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import {
  DOCUMENT_STORAGE_PORT,
  DocumentStorageError,
  type DocumentActor,
  type DocumentStoragePort,
  type SecureDocumentResult,
  type SourceResourceAuthorizer,
  type UploadPaymentReceiptDocument,
} from "./secure-document-storage.contract.js";

const MAX_FILE_SIZE = 10_485_760;
const ORPHAN_RETENTION_MS = 24 * 60 * 60 * 1000;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

interface ValidatedFile {
  readonly body: Uint8Array;
  readonly extension: ".jpeg" | ".jpg" | ".pdf" | ".png";
  readonly fileHash: string;
  readonly fileName: string;
  readonly mimeGroup: "IMAGE" | "PDF";
  readonly mimeType: "application/pdf" | "image/jpeg" | "image/png";
}

@Injectable()
export class SecureDocumentStorageService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(IdempotencyService)
    private readonly idempotency: IdempotencyService,
    @Inject(DOCUMENT_STORAGE_PORT)
    private readonly storage: DocumentStoragePort,
  ) {}

  public async uploadPaymentReceipt(
    request: UploadPaymentReceiptDocument,
    authorizer: SourceResourceAuthorizer,
  ): Promise<SecureDocumentResult & { readonly replayed: boolean }> {
    requireUuid(request.sourceResourceId);
    const file = validateFile(
      request.fileName,
      request.declaredMimeType,
      request.content,
    );
    const documentId = randomUUID();
    const versionId = randomUUID();
    const fileId = randomUUID();
    const uploadId = randomUUID();
    let promotedKey: string | undefined;

    try {
      const result = await this.idempotency.execute<SecureDocumentResult>(
        {
          actor: request.actor,
          body: {
            contentHash: file.fileHash,
            declaredMimeType: file.mimeType,
            fileName: file.fileName,
            sourceResourceId: request.sourceResourceId,
            title: request.title,
          },
          key: request.idempotencyKey,
          method: "POST",
          operationType: "secureDocument.paymentReceipt.upload",
          path: { sourceResourceId: request.sourceResourceId },
        },
        (transaction) =>
          authorizer.authorizeUpload(
            transaction,
            request.actor,
            request.sourceResourceId,
          ),
        async (transaction) => {
          const temporaryKey = await this.storage.writeTemporary(
            request.actor.tenantId,
            uploadId,
            file.body,
          );
          promotedKey = await this.storage.promote(
            temporaryKey,
            request.actor.tenantId,
            fileId,
          );
          await transaction.secureDocument.create({
            data: {
              category: "PAYMENT_RECEIPT",
              createdBy: request.actor.userProfileId,
              id: documentId,
              sourceModule: "PAYMENTS",
              sourceResourceId: request.sourceResourceId,
              sourceResourceType: "PAYMENT_RECEIPT",
              status: "AVAILABLE",
              title: requireTitle(request.title),
              tenantId: request.actor.tenantId,
              visibility: "PRIVATE",
              sensitivity: "RESTRICTED",
              currentVersionId: versionId,
              activeFileId: fileId,
              versions: {
                create: {
                  id: versionId,
                  versionNumber: 1,
                  status: "ACTIVE",
                  createdBy: request.actor.userProfileId,
                },
              },
            },
          });
          await transaction.secureDocumentFile.create({
            data: {
              documentId,
              extension: file.extension,
              fileHash: file.fileHash,
              fileSize: file.body.byteLength,
              id: fileId,
              mimeGroup: file.mimeGroup,
              mimeType: file.mimeType,
              provider: storageProvider(),
              safeFileName: file.fileName,
              scanStatus: "NOT_REQUIRED",
              status: "AVAILABLE",
              storageKey: promotedKey,
              tenantId: request.actor.tenantId,
              uploadedBy: request.actor.userProfileId,
              versionId,
            },
          });
          await transaction.secureDocumentLink.create({
            data: {
              createdBy: request.actor.userProfileId,
              documentId,
              linkType: "RECEIPT_OF",
              resourceId: request.sourceResourceId,
              resourceType: "PAYMENT_RECEIPT",
              sourceModule: "PAYMENTS",
              tenantId: request.actor.tenantId,
            },
          });
          await transaction.secureDocumentPolicy.create({
            data: {
              createdBy: request.actor.userProfileId,
              documentId,
              policyType: "SOURCE_DELEGATED",
              sourceModuleDelegated: true,
              tenantId: request.actor.tenantId,
            },
          });
          await transaction.auditLog.create({
            data: prepareAuditRecord(
              {
                actor: {
                  membershipId: request.actor.membershipId,
                  type: "USER",
                  userProfileId: request.actor.userProfileId,
                },
                tenantId: request.actor.tenantId,
                traceId: request.actor.traceId,
              },
              {
                action: "document.uploadFinalized",
                metadata: {
                  category: "PAYMENT_RECEIPT",
                  documentId,
                  fileId,
                  fileSize: file.body.byteLength,
                  verifiedMimeType: file.mimeType,
                  versionId,
                },
                occurredAt: new Date(),
                resourceId: documentId,
              },
            ),
          });
          return {
            httpStatus: 201,
            resourceId: documentId,
            resourceType: "SecureDocument",
            responseBody: {
              documentId,
              fileId,
              fileName: file.fileName,
              fileSize: file.body.byteLength,
              mimeType: file.mimeType,
              status: "AVAILABLE",
              versionId,
            },
          };
        },
      );
      return { ...result.responseBody, replayed: result.replayed };
    } catch (error) {
      if (promotedKey !== undefined) {
        try {
          await this.storage.delete(promotedKey);
        } catch {
          await this.recordCompensationFailure(
            request.actor.tenantId,
            documentId,
            fileId,
          );
        }
      }
      throw error;
    }
  }

  public async readAvailable(
    actor: DocumentActor,
    documentId: string,
    authorizer: SourceResourceAuthorizer,
  ): Promise<{
    readonly body: Uint8Array;
    readonly fileName: string;
    readonly mimeType: string;
  }> {
    const file = await this.prisma.$transaction(async (transaction) => {
      const document = await transaction.secureDocument.findUnique({
        where: { id_tenantId: { id: documentId, tenantId: actor.tenantId } },
      });
      if (document === null)
        throw new DocumentStorageError("DOCUMENT_NOT_FOUND");
      await authorizer.authorizeRead(
        transaction,
        actor,
        document.sourceResourceId,
      );
      const found = await transaction.secureDocumentFile.findFirst({
        where: { id: document.activeFileId ?? "", tenantId: actor.tenantId },
      });
      if (
        document.status !== "AVAILABLE" ||
        found?.status !== "AVAILABLE" ||
        found.scanStatus !== "NOT_REQUIRED"
      ) {
        throw new DocumentStorageError("DOCUMENT_NOT_AVAILABLE");
      }
      await transaction.secureDocumentAccessLog.create({
        data: {
          accessType: "DOWNLOAD",
          actorUserId: actor.userProfileId,
          documentId,
          fileId: found.id,
          outcome: "ALLOWED",
          sourceModule: "PAYMENTS",
          sourceResourceId: document.sourceResourceId,
          sourceResourceType: "PAYMENT_RECEIPT",
          tenantId: actor.tenantId,
          traceId: actor.traceId,
          versionId: found.versionId,
        },
      });
      return found;
    });
    try {
      return {
        body: await this.storage.read(file.storageKey),
        fileName: file.safeFileName,
        mimeType: file.mimeType,
      };
    } catch {
      throw new DocumentStorageError("DOCUMENT_STORAGE_UNAVAILABLE");
    }
  }

  public async archiveMetadata(
    actor: DocumentActor,
    documentId: string,
    authorizer: SourceResourceAuthorizer,
  ): Promise<void> {
    requireUuid(documentId);
    await this.prisma.$transaction(async (transaction) => {
      const document = await transaction.secureDocument.findUnique({
        where: { id_tenantId: { id: documentId, tenantId: actor.tenantId } },
      });
      if (document === null)
        throw new DocumentStorageError("DOCUMENT_NOT_FOUND");
      await authorizer.authorizeArchive(
        transaction,
        actor,
        document.sourceResourceId,
      );
      const archivedAt = new Date();
      await transaction.secureDocumentVersion.updateMany({
        data: { archivedAt, status: "ARCHIVED" },
        where: { documentId, tenantId: actor.tenantId },
      });
      await transaction.secureDocumentFile.updateMany({
        data: { archivedAt, status: "ARCHIVED" },
        where: { documentId, tenantId: actor.tenantId },
      });
      await transaction.secureDocumentLink.updateMany({
        data: { archivedAt },
        where: { documentId, tenantId: actor.tenantId },
      });
      await transaction.secureDocumentPolicy.updateMany({
        data: { archivedAt },
        where: { documentId, tenantId: actor.tenantId },
      });
      await transaction.secureDocument.update({
        data: {
          archiveReason: "SOURCE_ARCHIVED",
          archivedAt,
          status: "ARCHIVED",
        },
        where: { id_tenantId: { id: documentId, tenantId: actor.tenantId } },
      });
    });
  }

  public async reconcileExpiredOrphans(
    tenantId: string,
    now = new Date(),
  ): Promise<number> {
    requireUuid(tenantId);
    const cutoff = new Date(now.getTime() - ORPHAN_RETENTION_MS);
    const candidates = (await this.storage.listTenantObjects(tenantId)).filter(
      (item) => item.lastModified <= cutoff,
    );
    let reconciled = 0;
    for (const candidate of candidates) {
      const referenced = await this.prisma.secureDocumentFile.count({
        where: { storageKey: candidate.key, tenantId },
      });
      if (referenced > 0) continue;
      const resourceId = candidate.key.split("/").at(-1);
      if (resourceId === undefined || !UUID.test(resourceId)) continue;
      await this.recordSystemEvent(
        tenantId,
        resourceId,
        "document.orphanDetected",
      );
      await this.storage.delete(candidate.key);
      await this.recordSystemEvent(
        tenantId,
        resourceId,
        "document.orphanReconciled",
      );
      reconciled += 1;
    }
    return reconciled;
  }

  private async recordCompensationFailure(
    tenantId: string,
    documentId: string,
    fileId: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: prepareAuditRecord(
        { actor: { type: "SYSTEM" }, tenantId, traceId: randomUUID() },
        {
          action: "document.compensationFailed",
          metadata: { category: "PAYMENT_RECEIPT", documentId, fileId },
          occurredAt: new Date(),
          reasonCode: "OBJECT_DELETE_FAILED",
          resourceId: documentId,
        },
      ),
    });
  }

  private async recordSystemEvent(
    tenantId: string,
    resourceId: string,
    action: "document.orphanDetected" | "document.orphanReconciled",
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: prepareAuditRecord(
        { actor: { type: "SYSTEM" }, tenantId, traceId: randomUUID() },
        {
          action,
          metadata: { category: "PAYMENT_RECEIPT", documentId: resourceId },
          occurredAt: new Date(),
          resourceId,
        },
      ),
    });
  }
}

function validateFile(
  fileName: string,
  declaredMimeType: string,
  content: Uint8Array,
): ValidatedFile {
  if (content.byteLength === 0)
    throw new DocumentStorageError("DOCUMENT_FILE_INVALID");
  if (content.byteLength > MAX_FILE_SIZE)
    throw new DocumentStorageError("DOCUMENT_FILE_TOO_LARGE");
  if (
    fileName.length === 0 ||
    fileName.length > 255 ||
    fileName.includes("..") ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    [...fileName].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 31 || codePoint === 127;
    })
  ) {
    throw new DocumentStorageError("DOCUMENT_FILE_INVALID");
  }
  const normalized = fileName.normalize("NFKC");
  const extension = normalized.slice(normalized.lastIndexOf(".")).toLowerCase();
  const signatures = {
    "application/pdf": {
      extensions: [".pdf"],
      magic: [0x25, 0x50, 0x44, 0x46, 0x2d],
      mimeGroup: "PDF",
    },
    "image/jpeg": {
      extensions: [".jpg", ".jpeg"],
      magic: [0xff, 0xd8, 0xff],
      mimeGroup: "IMAGE",
    },
    "image/png": {
      extensions: [".png"],
      magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      mimeGroup: "IMAGE",
    },
  } as const;
  const signature = signatures[declaredMimeType as keyof typeof signatures];
  if (
    signature === undefined ||
    !signature.extensions.includes(extension as never) ||
    !signature.magic.every((byte, index) => content[index] === byte)
  ) {
    throw new DocumentStorageError("DOCUMENT_FILE_INVALID");
  }
  return {
    body: content,
    extension: extension as ValidatedFile["extension"],
    fileHash: createHash("sha256").update(content).digest("hex"),
    fileName: normalized,
    mimeGroup: signature.mimeGroup,
    mimeType: declaredMimeType as ValidatedFile["mimeType"],
  };
}

function requireUuid(value: string): void {
  if (!UUID.test(value))
    throw new DocumentStorageError("DOCUMENT_FILE_INVALID");
}

function requireTitle(value: string): string {
  const title = value.trim();
  if (title.length === 0 || title.length > 160) {
    throw new DocumentStorageError("DOCUMENT_FILE_INVALID");
  }
  return title;
}

function storageProvider(): "MINIO" | "S3" | "S3_COMPATIBLE" {
  const provider = process.env.DOCUMENT_STORAGE_PROVIDER ?? "MINIO";
  return provider === "S3" || provider === "S3_COMPATIBLE" ? provider : "MINIO";
}

import type { Prisma } from "@prisma/client";

export const DOCUMENT_STORAGE_PORT = Symbol("DOCUMENT_STORAGE_PORT");

export interface StoredObject {
  readonly key: string;
  readonly lastModified: Date;
}

export interface DocumentStoragePort {
  ensurePrivateBucket(): Promise<void>;
  writeTemporary(
    tenantId: string,
    uploadId: string,
    body: Uint8Array,
  ): Promise<string>;
  promote(
    temporaryKey: string,
    tenantId: string,
    objectId: string,
  ): Promise<string>;
  read(key: string): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
  listTenantObjects(tenantId: string): Promise<readonly StoredObject[]>;
}

export interface DocumentActor {
  readonly tenantId: string;
  readonly membershipId: string;
  readonly userProfileId: string;
  readonly traceId: string;
}

export interface SourceResourceAuthorizer {
  authorizeArchive(
    transaction: Prisma.TransactionClient,
    actor: DocumentActor,
    sourceResourceId: string,
  ): Promise<void>;
  authorizeUpload(
    transaction: Prisma.TransactionClient,
    actor: DocumentActor,
    sourceResourceId: string,
  ): Promise<void>;
  authorizeRead(
    transaction: Prisma.TransactionClient,
    actor: DocumentActor,
    sourceResourceId: string,
  ): Promise<void>;
}

export interface UploadPaymentReceiptDocument {
  readonly actor: DocumentActor;
  readonly idempotencyKey: string;
  readonly sourceResourceId: string;
  readonly title: string;
  readonly fileName: string;
  readonly declaredMimeType: string;
  readonly content: Uint8Array;
}

export interface SecureDocumentResult {
  readonly documentId: string;
  readonly versionId: string;
  readonly fileId: string;
  readonly status: "AVAILABLE";
  readonly fileSize: number;
  readonly mimeType: string;
  readonly fileName: string;
}

export class DocumentStorageError extends Error {
  public constructor(
    public readonly code:
      | "DOCUMENT_FILE_INVALID"
      | "DOCUMENT_FILE_TOO_LARGE"
      | "DOCUMENT_NOT_AVAILABLE"
      | "DOCUMENT_NOT_FOUND"
      | "DOCUMENT_STORAGE_UNAVAILABLE",
  ) {
    super(code);
  }
}

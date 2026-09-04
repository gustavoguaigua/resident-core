import { Module } from "@nestjs/common";

import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import { parseDocumentStorageConfig } from "./document-storage.config.js";
import { S3DocumentStorageAdapter } from "./s3-document-storage.adapter.js";
import { DOCUMENT_STORAGE_PORT } from "./secure-document-storage.contract.js";
import { SecureDocumentStorageService } from "./secure-document-storage.service.js";

@Module({
  exports: [DOCUMENT_STORAGE_PORT, SecureDocumentStorageService],
  providers: [
    IdempotencyService,
    SecureDocumentStorageService,
    {
      provide: DOCUMENT_STORAGE_PORT,
      useFactory: () =>
        new S3DocumentStorageAdapter(parseDocumentStorageConfig(process.env)),
    },
  ],
})
export class SecureDocumentStorageModule {}

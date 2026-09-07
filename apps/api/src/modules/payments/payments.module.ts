import { Module } from "@nestjs/common";

import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import { SecureDocumentStorageModule } from "../secure-document-storage/secure-document-storage.module.js";
import {
  PaymentReceiptsController,
  PaymentsController,
  OwnPaymentsController,
} from "./payments.controller.js";
import { PaymentsService } from "./payments.service.js";

@Module({
  controllers: [
    PaymentsController,
    PaymentReceiptsController,
    OwnPaymentsController,
  ],
  imports: [
    AccessControlModule,
    AuditModule,
    IdentityIntegrationModule,
    SecureDocumentStorageModule,
  ],
  providers: [IdempotencyService, PaymentsService],
})
export class PaymentsModule {}

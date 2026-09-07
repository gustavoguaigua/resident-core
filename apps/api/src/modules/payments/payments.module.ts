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
import {
  PaymentAllocationCommandsController,
  PaymentAllocationsController,
} from "./payment-allocations.controller.js";
import { PaymentAllocationsService } from "./payment-allocations.service.js";

@Module({
  controllers: [
    PaymentsController,
    PaymentReceiptsController,
    OwnPaymentsController,
    PaymentAllocationCommandsController,
    PaymentAllocationsController,
  ],
  imports: [
    AccessControlModule,
    AuditModule,
    IdentityIntegrationModule,
    SecureDocumentStorageModule,
  ],
  providers: [IdempotencyService, PaymentAllocationsService, PaymentsService],
})
export class PaymentsModule {}

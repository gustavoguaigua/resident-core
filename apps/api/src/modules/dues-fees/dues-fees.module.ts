import { Module } from "@nestjs/common";

import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import {
  BillingPeriodsController,
  ChargeConceptsController,
  FeeSchedulesController,
  UnitFeesController,
} from "./dues-fees.controller.js";
import { DuesFeesService } from "./dues-fees.service.js";

@Module({
  controllers: [
    ChargeConceptsController,
    FeeSchedulesController,
    UnitFeesController,
    BillingPeriodsController,
  ],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [DuesFeesService, IdempotencyService],
})
export class DuesFeesModule {}

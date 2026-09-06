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
import {
  BillingPeriodLifecycleController,
  ChargeBatchesController,
  ChargesController,
  OwnChargesController,
} from "./charge-lifecycle.controller.js";
import { ChargeLifecycleService } from "./charge-lifecycle.service.js";

@Module({
  controllers: [
    ChargeConceptsController,
    FeeSchedulesController,
    UnitFeesController,
    BillingPeriodsController,
    BillingPeriodLifecycleController,
    ChargeBatchesController,
    ChargesController,
    OwnChargesController,
  ],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [DuesFeesService, ChargeLifecycleService, IdempotencyService],
})
export class DuesFeesModule {}

import { Module } from "@nestjs/common";

import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import {
  LeasesController,
  LegalEntitiesController,
  OwnResidentsController,
  OwnershipsController,
  PersonsController,
  PropertyUnitsController,
  ResidenciesController,
} from "./residents-properties.controller.js";
import { ResidentsPropertiesService } from "./residents-properties.service.js";

@Module({
  controllers: [
    PropertyUnitsController,
    PersonsController,
    LegalEntitiesController,
    OwnershipsController,
    ResidenciesController,
    LeasesController,
    OwnResidentsController,
  ],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [IdempotencyService, ResidentsPropertiesService],
})
export class ResidentsPropertiesModule {}

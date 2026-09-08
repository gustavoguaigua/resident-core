import { Module } from "@nestjs/common";

import { IdempotencyService } from "../../platform/idempotency/idempotency.service.js";
import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import {
  AccountStatementsController,
  BalancesController,
  OwnAccountStatementsController,
} from "./account-statements.controller.js";
import { AccountStatementsService } from "./account-statements.service.js";

@Module({
  controllers: [
    AccountStatementsController,
    BalancesController,
    OwnAccountStatementsController,
  ],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [AccountStatementsService, IdempotencyService],
})
export class AccountStatementsModule {}

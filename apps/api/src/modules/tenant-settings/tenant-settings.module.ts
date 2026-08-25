import { Module } from "@nestjs/common";

import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import {
  SettingDefinitionsController,
  TenantSettingsController,
} from "./tenant-settings.controller.js";
import { TenantSettingsService } from "./tenant-settings.service.js";

@Module({
  controllers: [SettingDefinitionsController, TenantSettingsController],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [TenantSettingsService],
})
export class TenantSettingsModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import {
  type ApplicationEnvironment,
  validateApplicationEnvironment,
} from "@resident/config";

import { applicationConfig } from "./platform/config/application-config.js";
import { AccessControlModule } from "./modules/access-control/access-control.module.js";
import { AuditModule } from "./modules/audit/audit.module.js";
import { IdentityIntegrationModule } from "./modules/identity-integration/identity-integration.module.js";
import { HealthModule } from "./modules/platform/health/health.module.js";
import { TenantsModule } from "./modules/tenants/tenants.module.js";
import { TenantSettingsModule } from "./modules/tenant-settings/tenant-settings.module.js";
import { UsersRolesModule } from "./modules/users-roles/users-roles.module.js";
import { PrismaModule } from "./platform/database/prisma.module.js";

const applicationConfigModule = ConfigModule.forRoot({
  cache: true,
  isGlobal: true,
  load: [applicationConfig],
  validate: validateApplicationEnvironment,
});

@Module({
  imports: [
    applicationConfigModule,
    IdentityIntegrationModule,
    AccessControlModule,
    AuditModule,
    PrismaModule,
    HealthModule,
    TenantsModule,
    TenantSettingsModule,
    UsersRolesModule,
    ThrottlerModule.forRootAsync({
      inject: [applicationConfig.KEY],
      imports: [applicationConfigModule],
      useFactory: (config: ApplicationEnvironment) => [
        {
          limit: config.RATE_LIMIT_LIMIT,
          ttl: config.RATE_LIMIT_TTL_MS,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

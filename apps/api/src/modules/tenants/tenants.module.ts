import { Module } from "@nestjs/common";

import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import { KeycloakPlatformIdentityClient } from "../platform-admin-bootstrap/keycloak-platform-identity-client.js";
import { TENANT_INITIAL_ADMIN_IDENTITY_PORT } from "./tenant-lifecycle.contract.js";
import { TenantLifecycleService } from "./tenant-lifecycle.service.js";
import { TenantController } from "./tenant.controller.js";

@Module({
  controllers: [TenantController],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [
    TenantLifecycleService,
    {
      provide: TENANT_INITIAL_ADMIN_IDENTITY_PORT,
      useValue: {
        resolveByEmail: (email: string) =>
          KeycloakPlatformIdentityClient.fromEnvironment().resolveByEmail(
            email,
          ),
      },
    },
  ],
})
export class TenantsModule {}

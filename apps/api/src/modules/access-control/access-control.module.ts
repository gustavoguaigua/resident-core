import { Module } from "@nestjs/common";

import {
  PERMISSION_EVALUATOR_PORT,
  TENANT_CONTEXT_RESOLVER_PORT,
} from "@resident/auth";

import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import { PermissionGuard } from "./permission.guard.js";
import { TenantGuard } from "./tenant.guard.js";
import {
  UnavailablePermissionEvaluator,
  UnavailableTenantContextResolver,
} from "./unavailable-access-control.js";

@Module({
  exports: [
    PermissionGuard,
    TenantGuard,
    PERMISSION_EVALUATOR_PORT,
    TENANT_CONTEXT_RESOLVER_PORT,
  ],
  imports: [IdentityIntegrationModule],
  providers: [
    PermissionGuard,
    TenantGuard,
    {
      provide: PERMISSION_EVALUATOR_PORT,
      useClass: UnavailablePermissionEvaluator,
    },
    {
      provide: TENANT_CONTEXT_RESOLVER_PORT,
      useClass: UnavailableTenantContextResolver,
    },
  ],
})
export class AccessControlModule {}

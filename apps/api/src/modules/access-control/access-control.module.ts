import { Module } from "@nestjs/common";

import {
  PERMISSION_EVALUATOR_PORT,
  TENANT_CONTEXT_RESOLVER_PORT,
} from "@resident/auth";

import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import { PrismaService } from "../../platform/database/prisma.service.js";
import { AuditModule } from "../audit/audit.module.js";
import {
  AUDIT_WRITER_PORT,
  type AuditWriterPort,
} from "../audit/audit-writer.port.js";
import { PermissionGuard } from "./permission.guard.js";
import {
  PrismaPermissionEvaluator,
  PrismaTenantContextResolver,
} from "./prisma-access-control.js";
import { TenantGuard } from "./tenant.guard.js";

@Module({
  exports: [
    PermissionGuard,
    TenantGuard,
    PERMISSION_EVALUATOR_PORT,
    TENANT_CONTEXT_RESOLVER_PORT,
  ],
  imports: [AuditModule, IdentityIntegrationModule],
  providers: [
    PermissionGuard,
    TenantGuard,
    {
      provide: PERMISSION_EVALUATOR_PORT,
      inject: [PrismaService, AUDIT_WRITER_PORT],
      useFactory: (prisma: PrismaService, auditWriter: AuditWriterPort) =>
        new PrismaPermissionEvaluator(prisma, auditWriter),
    },
    {
      provide: TENANT_CONTEXT_RESOLVER_PORT,
      inject: [PrismaService, AUDIT_WRITER_PORT],
      useFactory: (prisma: PrismaService, auditWriter: AuditWriterPort) =>
        new PrismaTenantContextResolver(prisma, auditWriter),
    },
  ],
})
export class AccessControlModule {}

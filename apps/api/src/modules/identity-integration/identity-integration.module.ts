import { Module } from "@nestjs/common";

import { IDENTITY_RESOLVER_PORT } from "@resident/auth";

import { PrismaService } from "../../platform/database/prisma.service.js";
import { AuditModule } from "../audit/audit.module.js";
import {
  AUDIT_WRITER_PORT,
  type AuditWriterPort,
} from "../audit/audit-writer.port.js";
import { AuthGuard } from "./auth.guard.js";
import { EnvironmentKeycloakAccessTokenVerifier } from "./keycloak-access-token-verifier.js";
import { PrismaIdentityResolver } from "./prisma-identity-resolver.js";
import { TenantOnboardingAccess } from "./tenant-onboarding-access.js";

@Module({
  exports: [AuthGuard, IDENTITY_RESOLVER_PORT, TenantOnboardingAccess],
  imports: [AuditModule],
  providers: [
    AuthGuard,
    TenantOnboardingAccess,
    {
      provide: IDENTITY_RESOLVER_PORT,
      inject: [PrismaService, AUDIT_WRITER_PORT],
      useFactory: (prisma: PrismaService, auditWriter: AuditWriterPort) =>
        new PrismaIdentityResolver(
          prisma,
          auditWriter,
          new EnvironmentKeycloakAccessTokenVerifier(),
        ),
    },
  ],
})
export class IdentityIntegrationModule {}

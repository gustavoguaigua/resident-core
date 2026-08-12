import { Module } from "@nestjs/common";

import { IDENTITY_RESOLVER_PORT } from "@resident/auth";

import { AuthGuard } from "./auth.guard.js";
import { UnavailableIdentityResolver } from "./unavailable-identity-resolver.js";

@Module({
  exports: [AuthGuard, IDENTITY_RESOLVER_PORT],
  providers: [
    AuthGuard,
    {
      provide: IDENTITY_RESOLVER_PORT,
      useClass: UnavailableIdentityResolver,
    },
  ],
})
export class IdentityIntegrationModule {}

import { Module } from "@nestjs/common";

import { AccessControlModule } from "../access-control/access-control.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IdentityIntegrationModule } from "../identity-integration/identity-integration.module.js";
import {
  InvitationsController,
  TenantInvitationsController,
  TenantMembershipsController,
} from "./invitations-memberships.controller.js";
import { InvitationsMembershipsService } from "./invitations-memberships.service.js";

@Module({
  controllers: [
    InvitationsController,
    TenantInvitationsController,
    TenantMembershipsController,
  ],
  imports: [AccessControlModule, AuditModule, IdentityIntegrationModule],
  providers: [InvitationsMembershipsService],
})
export class UsersRolesModule {}

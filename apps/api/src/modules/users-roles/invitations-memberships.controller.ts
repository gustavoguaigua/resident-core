import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtension,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import type { InvitationStatus } from "@prisma/client";

import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import { ApiErrorEnvelopeDto } from "../../platform/openapi/openapi-dtos.js";
import {
  getAuthenticatedPrincipal,
  getTenantContext,
} from "../../platform/security/request-security-context.js";
import {
  PermissionGuard,
  RequirePermission,
} from "../access-control/permission.guard.js";
import { TenantGuard } from "../access-control/tenant.guard.js";
import { AuthGuard } from "../identity-integration/auth.guard.js";
import type {
  InvitationRecord,
  TenantActorContext,
} from "./invitations-memberships.contract.js";
import { InvitationsMembershipsError } from "./invitations-memberships.contract.js";
import {
  AcceptedInvitationResponseDto,
  AssignMembershipRoleDto,
  CreatedInvitationResponseDto,
  CreateInvitationDto,
  InvitationListResponseDto,
  InvitationResponseDto,
  MembershipResponseDto,
  MembershipRoleResponseDto,
  PublicInvitationResponseDto,
  RevokeMembershipDto,
} from "./invitations-memberships.dto.js";
// Runtime import is required for Nest validation metadata on @Query().
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { InvitationListQueryDto } from "./invitations-memberships.dto.js";
import { InvitationsMembershipsService } from "./invitations-memberships.service.js";

@Controller("tenant/invitations")
@ApiBearerAuth("bearerAuth")
@ApiTags("Tenant invitations")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class TenantInvitationsController {
  public constructor(
    @Inject(InvitationsMembershipsService)
    private readonly service: InvitationsMembershipsService,
  ) {}

  @Post()
  @RequirePermission("users.invite")
  @ApiBody({ type: CreateInvitationDto })
  @ApiOperation({
    operationId: "createTenantInvitation",
    summary: "Create a tenant invitation",
  })
  @ApiCreatedResponse({ type: CreatedInvitationResponseDto })
  @MutationErrors()
  @TenantContract("users.invite", "invitation.created")
  public async create(
    @Body() body: CreateInvitationDto,
    @Req() request: unknown,
  ): Promise<CreatedInvitationResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.createInvitation(
        body,
        readTenantActor(request),
        traceId,
      );
      return {
        data: {
          ...serializeInvitation(result.invitation),
          invitationUrl: `/api/v1/invitations/${result.token}`,
        },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Get()
  @RequirePermission("users.read")
  @ApiOperation({
    operationId: "listTenantInvitations",
    summary: "List tenant invitations",
  })
  @ApiOkResponse({ type: InvitationListResponseDto })
  @MutationErrors()
  @TenantContract("users.read")
  public async list(
    @Query() query: InvitationListQueryDto,
    @Req() request: unknown,
  ): Promise<InvitationListResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.listInvitations(
        readTenantActor(request),
        traceId,
        {
          page: query.page,
          pageSize: query.pageSize,
          ...(query.email === undefined ? {} : { email: query.email }),
          ...(query.status === undefined
            ? {}
            : { status: toPrismaInvitationStatus(query.status) }),
        },
      );
      return {
        data: result.items.map(serializeInvitation),
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / query.pageSize),
          traceId,
        },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Post(":invitationId/revoke")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("users.invite")
  @ApiOperation({
    operationId: "revokeTenantInvitation",
    summary: "Revoke a tenant invitation",
  })
  @ApiParam({ format: "uuid", name: "invitationId", type: String })
  @ApiOkResponse({ type: InvitationResponseDto })
  @MutationErrors()
  @TenantContract("users.invite", "invitation.revoked")
  public async revoke(
    @Param("invitationId", new ParseUUIDPipe({ version: "4" }))
    invitationId: string,
    @Req() request: unknown,
  ): Promise<InvitationResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      return {
        data: serializeInvitation(
          await this.service.revokeInvitation(
            invitationId,
            readTenantActor(request),
            traceId,
          ),
        ),
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }
}

@Controller("tenant/memberships")
@ApiBearerAuth("bearerAuth")
@ApiTags("Tenant memberships")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class TenantMembershipsController {
  public constructor(
    @Inject(InvitationsMembershipsService)
    private readonly service: InvitationsMembershipsService,
  ) {}

  @Post(":membershipId/roles")
  @RequirePermission("users.roles.assign")
  @ApiBody({ type: AssignMembershipRoleDto })
  @ApiOperation({
    operationId: "assignTenantMembershipRole",
    summary: "Assign a tenant role",
  })
  @ApiParam({ format: "uuid", name: "membershipId", type: String })
  @ApiCreatedResponse({ type: MembershipRoleResponseDto })
  @MutationErrors()
  @TenantContract("users.roles.assign", "membership.roleAssigned")
  public async assignRole(
    @Param("membershipId", new ParseUUIDPipe({ version: "4" }))
    membershipId: string,
    @Body() body: AssignMembershipRoleDto,
    @Req() request: unknown,
  ): Promise<MembershipRoleResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.assignRole(
        membershipId,
        body.roleId,
        readTenantActor(request),
        traceId,
      );
      return {
        data: { ...result, assignedAt: result.assignedAt.toISOString() },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Delete(":membershipId/roles/:roleId")
  @RequirePermission("users.roles.remove")
  @ApiOperation({
    operationId: "removeTenantMembershipRole",
    summary: "Remove a tenant role",
  })
  @ApiParam({ format: "uuid", name: "membershipId", type: String })
  @ApiParam({ format: "uuid", name: "roleId", type: String })
  @ApiOkResponse({ type: MembershipRoleResponseDto })
  @MutationErrors()
  @TenantContract("users.roles.remove", "membership.roleRemoved")
  public async removeRole(
    @Param("membershipId", new ParseUUIDPipe({ version: "4" }))
    membershipId: string,
    @Param("roleId", new ParseUUIDPipe({ version: "4" })) roleId: string,
    @Req() request: unknown,
  ): Promise<MembershipRoleResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.removeRole(
        membershipId,
        roleId,
        readTenantActor(request),
        traceId,
      );
      return {
        data: { ...result, removedAt: result.removedAt.toISOString() },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Post(":membershipId/revoke")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("users.membership.revoke")
  @ApiBody({ type: RevokeMembershipDto })
  @ApiOperation({
    operationId: "revokeTenantMembership",
    summary: "Revoke a tenant membership",
  })
  @ApiParam({ format: "uuid", name: "membershipId", type: String })
  @ApiOkResponse({ type: MembershipResponseDto })
  @MutationErrors()
  @TenantContract("users.membership.revoke", "membership.revoked")
  public async revokeMembership(
    @Param("membershipId", new ParseUUIDPipe({ version: "4" }))
    membershipId: string,
    @Body() body: RevokeMembershipDto,
    @Req() request: unknown,
  ): Promise<MembershipResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.revokeMembership(
        membershipId,
        readTenantActor(request),
        traceId,
        body.reason,
      );
      return {
        data: {
          id: result.id,
          revokedAt: result.revokedAt?.toISOString() ?? null,
          status: result.status.toLowerCase(),
        },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }
}

@Controller("invitations")
@ApiTags("Invitations")
export class InvitationsController {
  public constructor(
    @Inject(InvitationsMembershipsService)
    private readonly service: InvitationsMembershipsService,
  ) {}

  @Get(":token")
  @ApiOperation({
    operationId: "getInvitationByToken",
    security: [],
    summary: "Resolve an invitation token",
  })
  @ApiParam({ name: "token", type: String })
  @ApiOkResponse({ type: PublicInvitationResponseDto })
  @ApiConflictResponse({ type: ApiErrorEnvelopeDto })
  @ApiNotFoundResponse({ type: ApiErrorEnvelopeDto })
  @PublicTokenContract(false)
  public async get(
    @Param("token") token: string,
    @Req() request: unknown,
  ): Promise<PublicInvitationResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const result = await this.service.getInvitation(token, traceId);
      return {
        data: { ...result, expiresAt: result.expiresAt.toISOString() },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Post(":token/accept")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    operationId: "acceptInvitation",
    summary: "Accept an invitation",
  })
  @ApiParam({ name: "token", type: String })
  @ApiOkResponse({ type: AcceptedInvitationResponseDto })
  @MutationErrors()
  @PublicTokenContract(true, "invitation.accepted")
  public async accept(
    @Param("token") token: string,
    @Req() request: unknown,
  ): Promise<AcceptedInvitationResponseDto> {
    const traceId = getOrCreateTraceId(request);
    const principal = getAuthenticatedPrincipal(request);
    if (principal === undefined) throw new ForbiddenException();
    try {
      const result = await this.service.acceptInvitation(
        token,
        principal.userProfileId,
        traceId,
      );
      return {
        data: {
          acceptedAt: result.acceptedAt.toISOString(),
          membershipId: result.membership.id,
          membershipStatus: "active",
          roles: [result.role],
          tenantId: result.membership.tenantId,
          tenantSlug: result.tenantSlug,
          userId: result.membership.userProfileId,
        },
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }
}

function TenantContract(
  permission: string,
  auditEvent?: string,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiExtension("x-response-envelope", true)(target, propertyKey, descriptor);
    ApiExtension("x-auth-required", true)(target, propertyKey, descriptor);
    ApiExtension("x-platform-only", false)(target, propertyKey, descriptor);
    ApiExtension("x-tenant-context-required", true)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-tenant-scope", "tenant")(target, propertyKey, descriptor);
    ApiHeader({
      name: "X-Tenant-Id",
      required: true,
      schema: { format: "uuid", type: "string" },
    })(target, propertyKey, descriptor);
    ApiExtension("x-public", false)(target, propertyKey, descriptor);
    ApiExtension("x-required-permission", permission)(
      target,
      propertyKey,
      descriptor,
    );
    if (auditEvent !== undefined)
      ApiExtension("x-audit-event", auditEvent)(
        target,
        propertyKey,
        descriptor,
      );
  };
}

function PublicTokenContract(
  authRequired: boolean,
  auditEvent?: string,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiExtension("x-response-envelope", true)(target, propertyKey, descriptor);
    ApiExtension("x-auth-required", authRequired)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-platform-only", false)(target, propertyKey, descriptor);
    ApiExtension("x-tenant-context-required", false)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-public", !authRequired)(target, propertyKey, descriptor);
    ApiExtension("x-public-token-endpoint", true)(
      target,
      propertyKey,
      descriptor,
    );
    if (auditEvent !== undefined)
      ApiExtension("x-audit-event", auditEvent)(
        target,
        propertyKey,
        descriptor,
      );
  };
}

function MutationErrors(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiConflictResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    ApiForbiddenResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    ApiNotFoundResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    ApiUnauthorizedResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    ApiUnprocessableEntityResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
  };
}

function readTenantActor(request: unknown): TenantActorContext {
  const principal = getAuthenticatedPrincipal(request);
  const tenant = getTenantContext(request);
  if (principal === undefined || tenant === undefined)
    throw new ForbiddenException();
  return {
    membershipId: tenant.membershipId,
    tenantId: tenant.tenantId,
    userProfileId: principal.userProfileId,
  };
}

function serializeInvitation(invitation: InvitationRecord) {
  return {
    createdAt: invitation.createdAt.toISOString(),
    email: invitation.email,
    expiresAt: invitation.expiresAt.toISOString(),
    id: invitation.id,
    revokedAt: invitation.revokedAt?.toISOString() ?? null,
    role: invitation.role,
    status: invitation.status.toLowerCase(),
  };
}

function toPrismaInvitationStatus(
  status: NonNullable<InvitationListQueryDto["status"]>,
): InvitationStatus {
  return status.toUpperCase() as InvitationStatus;
}

function mapError(error: unknown): Error {
  if (!(error instanceof InvitationsMembershipsError)) {
    return error instanceof Error
      ? error
      : new Error("Access operation failed");
  }
  if (
    error.code === "INVITATION_NOT_FOUND" ||
    error.code === "MEMBERSHIP_NOT_FOUND" ||
    error.code === "MEMBERSHIP_ROLE_NOT_FOUND"
  ) {
    return new NotFoundException();
  }
  if (
    error.code === "ACCESS_DENIED" ||
    error.code === "IDENTITY_EMAIL_MISMATCH" ||
    error.code === "IDENTITY_NOT_PROVISIONED" ||
    error.code === "ROLE_NOT_ASSIGNABLE" ||
    error.code === "TENANT_NOT_ACTIVE"
  ) {
    return new ForbiddenException();
  }
  if (error.code === "INVITATION_INVALID_INPUT") {
    return new UnprocessableEntityException();
  }
  return new ConflictException();
}

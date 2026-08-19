import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";

import { ApiErrorEnvelopeDto } from "../../platform/openapi/openapi-dtos.js";
import { getAuthenticatedPrincipal } from "../../platform/security/request-security-context.js";
import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import {
  PermissionGuard,
  RequirePermission,
} from "../access-control/permission.guard.js";
import { AuthGuard } from "../identity-integration/auth.guard.js";
import {
  CreateTenantDto,
  CreateTenantResponseDto,
  TenantLifecycleResponseDto,
  TenantTransitionReasonDto,
} from "./tenant-api.dto.js";
import {
  TenantLifecycleError,
  type TenantLifecycleResult,
} from "./tenant-lifecycle.contract.js";
import { TenantLifecycleService } from "./tenant-lifecycle.service.js";

@Controller("platform/tenants")
@ApiBearerAuth("bearerAuth")
@ApiTags("Tenants")
@UseGuards(AuthGuard, PermissionGuard)
export class TenantController {
  public constructor(
    @Inject(TenantLifecycleService)
    private readonly tenants: TenantLifecycleService,
  ) {}

  @Post()
  @RequirePermission("platform.tenants.create")
  @ApiBody({ type: CreateTenantDto })
  @ApiOperation({ operationId: "createTenant", summary: "Onboard a tenant" })
  @ApiCreatedResponse({ type: CreateTenantResponseDto })
  @ApiConflictResponse({ type: ApiErrorEnvelopeDto })
  @ApiForbiddenResponse({ type: ApiErrorEnvelopeDto })
  @ApiServiceUnavailableResponse({ type: ApiErrorEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ApiErrorEnvelopeDto })
  @ApiUnprocessableEntityResponse({ type: ApiErrorEnvelopeDto })
  @TenantEndpointContract("platform.tenants.create", "tenant.created")
  public async create(
    @Body() body: CreateTenantDto,
    @Req() request: unknown,
  ): Promise<CreateTenantResponseDto> {
    const { actorUserProfileId, traceId } = readSecurityContext(request);
    try {
      const result = await this.tenants.create(
        body,
        actorUserProfileId,
        traceId,
      );
      return {
        data: {
          ...serializeLifecycle(result.tenant),
          branding: result.tenant.branding,
          createdAt: result.tenant.createdAt.toISOString(),
          currency: result.tenant.currency,
          initialAdmin: result.initialAdmin,
          legalName: result.tenant.legalName,
          name: result.tenant.name,
          profile: result.tenant.profile ?? {},
          timezone: result.tenant.timezone,
          wordpressMapping: result.tenant.wordpressMapping,
        },
        meta: { traceId },
      };
    } catch (error) {
      throw mapTenantError(error);
    }
  }

  @Post(":tenantId/activate")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("platform.tenants.activate")
  @ApiOperation({ operationId: "activateTenant", summary: "Activate a tenant" })
  @ApiParam({ format: "uuid", name: "tenantId", type: String })
  @ApiOkResponse({ type: TenantLifecycleResponseDto })
  @LifecycleErrorResponses()
  @TenantEndpointContract("platform.tenants.activate", "tenant.activated")
  public activate(
    @Param("tenantId", new ParseUUIDPipe({ version: "4" })) tenantId: string,
    @Req() request: unknown,
  ): Promise<TenantLifecycleResponseDto> {
    return this.executeTransition(request, (actor, traceId) =>
      this.tenants.activate(tenantId, actor, traceId),
    );
  }

  @Post(":tenantId/suspend")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("platform.tenants.suspend")
  @ApiBody({ type: TenantTransitionReasonDto })
  @ApiOperation({ operationId: "suspendTenant", summary: "Suspend a tenant" })
  @ApiParam({ format: "uuid", name: "tenantId", type: String })
  @ApiOkResponse({ type: TenantLifecycleResponseDto })
  @LifecycleErrorResponses()
  @TenantEndpointContract("platform.tenants.suspend", "tenant.suspended")
  public suspend(
    @Param("tenantId", new ParseUUIDPipe({ version: "4" })) tenantId: string,
    @Body() body: TenantTransitionReasonDto,
    @Req() request: unknown,
  ): Promise<TenantLifecycleResponseDto> {
    return this.executeTransition(request, (actor, traceId) =>
      this.tenants.suspend(tenantId, actor, traceId, body.reason),
    );
  }

  @Post(":tenantId/reactivate")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("platform.tenants.reactivate")
  @ApiOperation({
    operationId: "reactivateTenant",
    summary: "Reactivate a tenant",
  })
  @ApiParam({ format: "uuid", name: "tenantId", type: String })
  @ApiOkResponse({ type: TenantLifecycleResponseDto })
  @LifecycleErrorResponses()
  @TenantEndpointContract("platform.tenants.reactivate", "tenant.reactivated")
  public reactivate(
    @Param("tenantId", new ParseUUIDPipe({ version: "4" })) tenantId: string,
    @Req() request: unknown,
  ): Promise<TenantLifecycleResponseDto> {
    return this.executeTransition(request, (actor, traceId) =>
      this.tenants.reactivate(tenantId, actor, traceId),
    );
  }

  @Post(":tenantId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("platform.tenants.archive")
  @ApiBody({ type: TenantTransitionReasonDto })
  @ApiOperation({ operationId: "archiveTenant", summary: "Archive a tenant" })
  @ApiParam({ format: "uuid", name: "tenantId", type: String })
  @ApiOkResponse({ type: TenantLifecycleResponseDto })
  @LifecycleErrorResponses()
  @TenantEndpointContract("platform.tenants.archive", "tenant.archived")
  public archive(
    @Param("tenantId", new ParseUUIDPipe({ version: "4" })) tenantId: string,
    @Body() body: TenantTransitionReasonDto,
    @Req() request: unknown,
  ): Promise<TenantLifecycleResponseDto> {
    return this.executeTransition(request, (actor, traceId) =>
      this.tenants.archive(tenantId, actor, traceId, body.reason),
    );
  }

  private async executeTransition(
    request: unknown,
    operation: (
      actorUserProfileId: string,
      traceId: string,
    ) => Promise<TenantLifecycleResult>,
  ): Promise<TenantLifecycleResponseDto> {
    const { actorUserProfileId, traceId } = readSecurityContext(request);
    try {
      return {
        data: serializeLifecycle(await operation(actorUserProfileId, traceId)),
        meta: { traceId },
      };
    } catch (error) {
      throw mapTenantError(error);
    }
  }
}

function TenantEndpointContract(
  permission: string,
  auditEvent: string,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiExtension("x-response-envelope", true)(target, propertyKey, descriptor);
    ApiExtension("x-auth-required", true)(target, propertyKey, descriptor);
    ApiExtension("x-platform-only", true)(target, propertyKey, descriptor);
    ApiExtension("x-tenant-context-required", false)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-public", false)(target, propertyKey, descriptor);
    ApiExtension("x-required-permission", permission)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-audit-event", auditEvent)(target, propertyKey, descriptor);
  };
}

function LifecycleErrorResponses(): MethodDecorator {
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

function readSecurityContext(request: unknown): {
  actorUserProfileId: string;
  traceId: string;
} {
  const principal = getAuthenticatedPrincipal(request);
  if (principal === undefined) {
    throw new ForbiddenException();
  }
  return {
    actorUserProfileId: principal.userProfileId,
    traceId: getOrCreateTraceId(request),
  };
}

function serializeLifecycle(result: TenantLifecycleResult) {
  return {
    archivedAt: result.archivedAt?.toISOString() ?? null,
    id: result.id,
    slug: result.slug,
    status: toContractStatus(result.status),
    suspendedAt: result.suspendedAt?.toISOString() ?? null,
    suspensionReason: result.suspensionReason,
    updatedAt: result.updatedAt.toISOString(),
  };
}

function toContractStatus(status: TenantLifecycleResult["status"]): string {
  return {
    ACTIVE: "active",
    ARCHIVED: "archived",
    INACTIVE: "inactive",
    PENDING_SETUP: "pendingSetup",
    SUSPENDED: "suspended",
  }[status];
}

function mapTenantError(error: unknown): Error {
  if (!(error instanceof TenantLifecycleError)) {
    return error instanceof Error
      ? error
      : new Error("Tenant operation failed");
  }
  if (error.code === "TENANT_NOT_FOUND") {
    return new NotFoundException();
  }
  if (error.code === "TENANT_PERMISSION_DENIED") {
    return new ForbiddenException();
  }
  if (error.code === "IDENTITY_PROVIDER_UNAVAILABLE") {
    return new ServiceUnavailableException();
  }
  if (error.code === "TENANT_INVALID_INPUT") {
    return new UnprocessableEntityException();
  }
  return new ConflictException();
}

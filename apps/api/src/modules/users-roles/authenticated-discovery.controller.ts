import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtension,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";

import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import { ApiErrorEnvelopeDto } from "../../platform/openapi/openapi-dtos.js";
import {
  getAuthenticatedPrincipal,
  getTenantContext,
} from "../../platform/security/request-security-context.js";
import { TenantGuard } from "../access-control/tenant.guard.js";
import { AuthGuard } from "../identity-integration/auth.guard.js";
import { AuthenticatedDiscoveryError } from "./authenticated-discovery.contract.js";
import * as DiscoveryDtos from "./authenticated-discovery.dto.js";
import { AuthenticatedDiscoveryService } from "./authenticated-discovery.service.js";

@Controller("me")
@ApiBearerAuth("bearerAuth")
@ApiTags("Authenticated discovery")
@UseGuards(AuthGuard)
export class AuthenticatedDiscoveryController {
  public constructor(
    @Inject(AuthenticatedDiscoveryService)
    private readonly service: AuthenticatedDiscoveryService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: "getCurrentUserProfile",
    summary: "Get the authenticated Core user profile",
  })
  @ApiOkResponse({ type: DiscoveryDtos.CurrentUserResponseDto })
  @DiscoveryContract(false)
  @DiscoveryErrors(false)
  public async getCurrentUser(
    @Req() request: unknown,
  ): Promise<DiscoveryDtos.CurrentUserResponseDto> {
    const principal = requirePrincipal(request);
    try {
      return {
        data: await this.service.getCurrentUser(principal.userProfileId),
        meta: { traceId: getOrCreateTraceId(request) },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Get("tenants")
  @ApiOperation({
    operationId: "listCurrentUserTenants",
    summary: "List active tenants accessible to the authenticated user",
  })
  @ApiOkResponse({ type: DiscoveryDtos.AccessibleTenantsResponseDto })
  @DiscoveryContract(false)
  @DiscoveryErrors(false)
  public async listAccessibleTenants(
    @Req() request: unknown,
  ): Promise<DiscoveryDtos.AccessibleTenantsResponseDto> {
    const principal = requirePrincipal(request);
    try {
      return {
        data: [
          ...(await this.service.listAccessibleTenants(
            principal.userProfileId,
          )),
        ],
        meta: { traceId: getOrCreateTraceId(request) },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Get("permissions")
  @UseGuards(TenantGuard)
  @ApiOperation({
    operationId: "getCurrentUserEffectivePermissions",
    summary: "Get effective Core permissions for the active tenant",
  })
  @ApiOkResponse({ type: DiscoveryDtos.EffectiveTenantPermissionsResponseDto })
  @DiscoveryContract(true)
  @DiscoveryErrors(true)
  public async getEffectivePermissions(
    @Req() request: unknown,
  ): Promise<DiscoveryDtos.EffectiveTenantPermissionsResponseDto> {
    const principal = requirePrincipal(request);
    const tenant = getTenantContext(request);
    if (tenant === undefined)
      throw new ForbiddenException({ code: "TENANT_ACCESS_DENIED" });
    try {
      return {
        data: await this.service.getEffectivePermissions(
          principal.userProfileId,
          tenant,
        ),
        meta: { traceId: getOrCreateTraceId(request) },
      };
    } catch (error) {
      throw mapError(error);
    }
  }
}

function DiscoveryContract(tenantScoped: boolean): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiExtension("x-response-envelope", true)(target, propertyKey, descriptor);
    ApiExtension("x-auth-required", true)(target, propertyKey, descriptor);
    ApiExtension("x-platform-only", false)(target, propertyKey, descriptor);
    ApiExtension("x-public", false)(target, propertyKey, descriptor);
    ApiExtension("x-own-resource", true)(target, propertyKey, descriptor);
    ApiExtension("x-idempotency-required", false)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-tenant-context-required", tenantScoped)(
      target,
      propertyKey,
      descriptor,
    );
    if (tenantScoped) {
      ApiExtension("x-tenant-scope", "tenant")(target, propertyKey, descriptor);
      ApiHeader({
        name: "X-Tenant-Id",
        required: true,
        schema: { format: "uuid", type: "string" },
      })(target, propertyKey, descriptor);
    }
  };
}

function DiscoveryErrors(tenantScoped: boolean): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiUnauthorizedResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    ApiForbiddenResponse({ type: ApiErrorEnvelopeDto })(
      target,
      propertyKey,
      descriptor,
    );
    if (tenantScoped) {
      ApiBadRequestResponse({ type: ApiErrorEnvelopeDto })(
        target,
        propertyKey,
        descriptor,
      );
      ApiUnprocessableEntityResponse({ type: ApiErrorEnvelopeDto })(
        target,
        propertyKey,
        descriptor,
      );
    }
  };
}

function requirePrincipal(request: unknown) {
  const principal = getAuthenticatedPrincipal(request);
  if (principal === undefined)
    throw new ForbiddenException({ code: "ACCESS_DENIED" });
  return principal;
}

function mapError(error: unknown): Error {
  if (error instanceof AuthenticatedDiscoveryError)
    return new ForbiddenException({ code: error.code });
  return error instanceof Error ? error : new Error("Discovery failed");
}

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtension,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import type { SettingDefinition } from "@prisma/client";

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
  EffectiveSetting,
  SettingsActorContext,
} from "./tenant-settings.contract.js";
import { TenantSettingsError } from "./tenant-settings.contract.js";
import {
  EffectiveSettingListResponseDto,
  EffectiveSettingResponseDto,
  SettingDefinitionListResponseDto,
  SettingDefinitionResponseDto,
  UpdateTenantSettingDto,
} from "./tenant-settings.dto.js";
import { TenantSettingsService } from "./tenant-settings.service.js";

@Controller("platform/setting-definitions")
@ApiBearerAuth("bearerAuth")
@ApiTags("Platform setting definitions")
@UseGuards(AuthGuard, PermissionGuard)
export class SettingDefinitionsController {
  public constructor(
    @Inject(TenantSettingsService)
    private readonly service: TenantSettingsService,
  ) {}

  @Get()
  @RequirePermission("platformSettingDefinitions.read")
  @ApiOperation({
    operationId: "listSettingDefinitions",
    summary: "List active setting definitions",
  })
  @ApiOkResponse({ type: SettingDefinitionListResponseDto })
  @ReadContract("platformSettingDefinitions.read", false)
  public async list(
    @Req() request: unknown,
  ): Promise<SettingDefinitionListResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const definitions = await this.service.listDefinitions(
        readPrincipalId(request),
      );
      return {
        data: definitions.map(serializeDefinition),
        meta: { page: 1, pageSize: 25, total: definitions.length, traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Get(":definitionId")
  @RequirePermission("platformSettingDefinitions.read")
  @ApiOperation({
    operationId: "getSettingDefinition",
    summary: "Get an active setting definition",
  })
  @ApiParam({ format: "uuid", name: "definitionId", type: String })
  @ApiOkResponse({ type: SettingDefinitionResponseDto })
  @ReadContract("platformSettingDefinitions.read", false)
  public async get(
    @Param("definitionId", new ParseUUIDPipe({ version: "4" }))
    definitionId: string,
    @Req() request: unknown,
  ): Promise<SettingDefinitionResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      return {
        data: serializeDefinition(
          await this.service.getDefinition(
            definitionId,
            readPrincipalId(request),
          ),
        ),
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }
}

@Controller("tenant/settings")
@ApiBearerAuth("bearerAuth")
@ApiTags("Tenant settings")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class TenantSettingsController {
  public constructor(
    @Inject(TenantSettingsService)
    private readonly service: TenantSettingsService,
  ) {}

  @Get()
  @RequirePermission("tenantSettings.read")
  @ApiOperation({
    operationId: "listEffectiveTenantSettings",
    summary: "List effective settings for the active tenant",
  })
  @ApiOkResponse({ type: EffectiveSettingListResponseDto })
  @ReadContract("tenantSettings.read", true)
  public async list(
    @Req() request: unknown,
  ): Promise<EffectiveSettingListResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      const settings = await this.service.listEffective(
        readTenantActor(request),
      );
      return {
        data: settings.map(serializeEffective),
        meta: { page: 1, pageSize: 25, total: settings.length, traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Get(":key")
  @RequirePermission("tenantSettings.read")
  @ApiOperation({
    operationId: "getEffectiveTenantSetting",
    summary: "Get an effective setting for the active tenant",
  })
  @ApiParam({ example: "general.locale", name: "key", type: String })
  @ApiOkResponse({ type: EffectiveSettingResponseDto })
  @ReadContract("tenantSettings.read", true)
  public async get(
    @Param("key") key: string,
    @Req() request: unknown,
  ): Promise<EffectiveSettingResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      return {
        data: serializeEffective(
          await this.service.getEffective(key, readTenantActor(request)),
        ),
        meta: { traceId },
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  @Patch(":key")
  @RequirePermission("tenantSettings.update")
  @ApiBody({ type: UpdateTenantSettingDto })
  @ApiOperation({
    operationId: "updateTenantSetting",
    summary: "Set the active tenant override",
  })
  @ApiParam({ example: "general.locale", name: "key", type: String })
  @ApiOkResponse({ type: EffectiveSettingResponseDto })
  @ReadContract("tenantSettings.update", true, "tenantSetting.updated")
  public async update(
    @Param("key") key: string,
    @Body() body: UpdateTenantSettingDto,
    @Req() request: unknown,
  ): Promise<EffectiveSettingResponseDto> {
    const traceId = getOrCreateTraceId(request);
    try {
      return {
        data: serializeEffective(
          await this.service.updateOverride(
            key,
            body,
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

function ReadContract(
  permission: string,
  tenantScoped: boolean,
  auditEvent?: string,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    ApiExtension("x-response-envelope", true)(target, propertyKey, descriptor);
    ApiExtension("x-auth-required", true)(target, propertyKey, descriptor);
    ApiExtension("x-platform-only", !tenantScoped)(
      target,
      propertyKey,
      descriptor,
    );
    ApiExtension("x-tenant-context-required", tenantScoped)(
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
    if (auditEvent !== undefined)
      ApiExtension("x-audit-event", auditEvent)(
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

function readPrincipalId(request: unknown): string {
  const principal = getAuthenticatedPrincipal(request);
  if (principal === undefined) throw new ForbiddenException();
  return principal.userProfileId;
}

function readTenantActor(request: unknown): SettingsActorContext {
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

function serializeDefinition(definition: SettingDefinition) {
  return {
    allowedValues: definition.allowedValues,
    category: toContractEnum(definition.category),
    createdAt: definition.createdAt.toISOString(),
    defaultValue: definition.defaultValue,
    description: definition.description,
    id: definition.id,
    isRuntimeCritical: definition.isRuntimeCritical,
    isTenantOverridable: definition.isTenantOverridable,
    key: definition.key,
    requiresRestart: definition.requiresRestart,
    residentVisible: definition.residentVisible,
    schema: definition.schema,
    sensitivity: toContractEnum(definition.sensitivity),
    status: toContractEnum(definition.status),
    updatedAt: definition.updatedAt.toISOString(),
    valueType: toContractEnum(definition.valueType),
  };
}

function serializeEffective(setting: EffectiveSetting) {
  return {
    ...setting,
    category: toContractEnum(setting.category),
    effectiveFrom: setting.effectiveFrom?.toISOString() ?? null,
    effectiveUntil: setting.effectiveUntil?.toISOString() ?? null,
    sensitivity: toContractEnum(setting.sensitivity),
    source: toContractEnum(setting.source) as
      "platformDefault" | "tenantOverride",
    valueType: toContractEnum(setting.valueType),
  };
}

function toContractEnum(value: string): string {
  const [head, ...tail] = value.toLowerCase().split("_");
  return (
    head + tail.map((part) => part[0]?.toUpperCase() + part.slice(1)).join("")
  );
}

function mapError(error: unknown): Error {
  if (!(error instanceof TenantSettingsError)) {
    return error instanceof Error
      ? error
      : new Error("Settings operation failed");
  }
  if (error.code === "SETTING_NOT_FOUND") return new NotFoundException();
  if (
    error.code === "ACCESS_DENIED" ||
    error.code === "SETTING_NOT_OVERRIDABLE" ||
    error.code === "TENANT_NOT_ACTIVE"
  )
    return new ForbiddenException();
  return new UnprocessableEntityException();
}

import {
  Body,
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";

import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import { IdempotencyError } from "../../platform/idempotency/idempotency.service.js";
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
import type { ResidentsActorContext } from "./residents-properties.contract.js";
import { ResidentsPropertiesError } from "./residents-properties.contract.js";
// DTO classes must remain runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ArchiveDto,
  CreateLeaseDto,
  CreateLegalEntityDto,
  CreateOwnershipDto,
  CreatePersonDto,
  CreatePropertyUnitDto,
  CreateResidencyDto,
  EndRelationshipDto,
  LinkUserDto,
  PageQueryDto,
  PropertyUnitQueryDto,
  RelationshipQueryDto,
  UpdateLeaseDto,
  UpdateLegalEntityDto,
  UpdateOwnershipDto,
  UpdatePersonDto,
  UpdatePropertyUnitDto,
  UpdateResidencyDto,
} from "./residents-properties.dto.js";
import { ResidentsPropertiesService } from "./residents-properties.service.js";

@ApiExcludeController()
@Controller("tenant/property-units")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PropertyUnitsController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}

  @Get()
  @RequirePermission("propertyUnits.read")
  public list(@Query() query: PropertyUnitQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listPropertyUnits(context.actor, query, context.traceId),
    );
  }
  @Post()
  @RequirePermission("propertyUnits.create")
  public async create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreatePropertyUnitDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createPropertyUnit(
        context.actor,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Get(":propertyUnitId")
  @RequirePermission("propertyUnits.read")
  public get(
    @Param("propertyUnitId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getPropertyUnit(context.actor, id, context.traceId),
    );
  }
  @Patch(":propertyUnitId")
  @RequirePermission("propertyUnits.update")
  public async update(
    @Param("propertyUnitId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdatePropertyUnitDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updatePropertyUnit(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":propertyUnitId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("propertyUnits.archive")
  public async archive(
    @Param("propertyUnitId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ArchiveDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.archivePropertyUnit(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/persons")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PersonsController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get() @RequirePermission("persons.read") public list(
    @Query() query: PageQueryDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listPersons(context.actor, query, context.traceId),
    );
  }
  @Post() @RequirePermission("persons.create") public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreatePersonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createPerson(context.actor, key, body, context.traceId),
    );
  }
  @Get(":personId") @RequirePermission("persons.read") public get(
    @Param("personId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getPerson(context.actor, id, context.traceId),
    );
  }
  @Patch(":personId") @RequirePermission("persons.update") public update(
    @Param("personId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdatePersonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updatePerson(context.actor, id, key, body, context.traceId),
    );
  }
  @Post(":personId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("persons.archive")
  public archive(
    @Param("personId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ArchiveDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.archivePerson(context.actor, id, key, body, context.traceId),
    );
  }
  @Post(":personId/link-user")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("persons.linkIdentity")
  public linkUser(
    @Param("personId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: LinkUserDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.linkUser(context.actor, id, key, body, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/legal-entities")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class LegalEntitiesController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get() @RequirePermission("legalEntities.read") public list(
    @Query() query: PageQueryDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listLegalEntities(context.actor, query, context.traceId),
    );
  }
  @Post() @RequirePermission("legalEntities.create") public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateLegalEntityDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createLegalEntity(context.actor, key, body, context.traceId),
    );
  }
  @Get(":legalEntityId") @RequirePermission("legalEntities.read") public get(
    @Param("legalEntityId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getLegalEntity(context.actor, id, context.traceId),
    );
  }
  @Patch(":legalEntityId")
  @RequirePermission("legalEntities.update")
  public update(
    @Param("legalEntityId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateLegalEntityDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateLegalEntity(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":legalEntityId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("legalEntities.archive")
  public archive(
    @Param("legalEntityId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ArchiveDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.archiveLegalEntity(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/property-ownerships")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class OwnershipsController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get() @RequirePermission("propertyOwnerships.read") public list(
    @Query() query: RelationshipQueryDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listOwnerships(context.actor, query, context.traceId),
    );
  }
  @Post() @RequirePermission("propertyOwnerships.create") public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateOwnershipDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createOwnership(context.actor, key, body, context.traceId),
    );
  }
  @Get(":ownershipId") @RequirePermission("propertyOwnerships.read") public get(
    @Param("ownershipId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getOwnership(context.actor, id, context.traceId),
    );
  }
  @Patch(":ownershipId")
  @RequirePermission("propertyOwnerships.update")
  public update(
    @Param("ownershipId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateOwnershipDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateOwnership(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":ownershipId/end")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("propertyOwnerships.end")
  public end(
    @Param("ownershipId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: EndRelationshipDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.endOwnership(context.actor, id, key, body, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/residencies")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class ResidenciesController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get() @RequirePermission("residencies.read") public list(
    @Query() query: RelationshipQueryDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listResidencies(context.actor, query, context.traceId),
    );
  }
  @Post() @RequirePermission("residencies.create") public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateResidencyDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createResidency(context.actor, key, body, context.traceId),
    );
  }
  @Get(":residencyId") @RequirePermission("residencies.read") public get(
    @Param("residencyId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getResidency(context.actor, id, context.traceId),
    );
  }
  @Patch(":residencyId") @RequirePermission("residencies.update") public update(
    @Param("residencyId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateResidencyDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateResidency(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":residencyId/end")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("residencies.end")
  public end(
    @Param("residencyId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: EndRelationshipDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.endResidency(context.actor, id, key, body, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/leases")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class LeasesController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get() @RequirePermission("leases.read") public list(
    @Query() query: PageQueryDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listLeases(context.actor, query, context.traceId),
    );
  }
  @Post() @RequirePermission("leases.create") public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateLeaseDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createLease(context.actor, key, body, context.traceId),
    );
  }
  @Get(":leaseId") @RequirePermission("leases.read") public get(
    @Param("leaseId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getLease(context.actor, id, context.traceId),
    );
  }
  @Patch(":leaseId") @RequirePermission("leases.update") public update(
    @Param("leaseId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateLeaseDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateLease(context.actor, id, key, body, context.traceId),
    );
  }
  @Post(":leaseId/end")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("leases.end")
  public end(
    @Param("leaseId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: EndRelationshipDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.endLease(context.actor, id, key, body, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("me")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class OwnResidentsController {
  public constructor(
    @Inject(ResidentsPropertiesService)
    private readonly service: ResidentsPropertiesService,
  ) {}
  @Get("person") @RequirePermission("persons.read.own") public person(
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getOwnPerson(context.actor, context.traceId),
    );
  }
  @Get("property-units")
  @RequirePermission("propertyUnits.read.own")
  public units(@Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.getOwnPropertyUnits(context.actor, context.traceId),
    );
  }
  @Get("residencies")
  @RequirePermission("residencies.read.own")
  public residencies(@Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.getOwnResidencies(context.actor, context.traceId),
    );
  }
}

function uuid() {
  return new ParseUUIDPipe({ version: "4" });
}
function readContext(request: unknown): {
  actor: ResidentsActorContext;
  traceId: string;
} {
  const principal = getAuthenticatedPrincipal(request);
  const tenant = getTenantContext(request);
  if (principal === undefined || tenant === undefined)
    throw new ForbiddenException();
  return {
    actor: {
      membershipId: tenant.membershipId,
      tenantId: tenant.tenantId,
      userProfileId: principal.userProfileId,
    },
    traceId: getOrCreateTraceId(request),
  };
}
async function execute<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapError(error);
  }
}
async function executeResult<T>(
  operation: () => Promise<{ responseBody: T }>,
): Promise<T> {
  return execute(async () => (await operation()).responseBody);
}
function mapError(error: unknown): Error {
  if (error instanceof IdempotencyError)
    return error.code === "IDEMPOTENCY_KEY_REQUIRED"
      ? new BadRequestException({ code: error.code })
      : new ConflictException({ code: error.code });
  if (error instanceof ResidentsPropertiesError) {
    if (error.code === "ACCESS_DENIED")
      return new ForbiddenException({ code: "PERMISSION_DENIED" });
    if (
      error.code === "RESOURCE_NOT_FOUND" ||
      error.code === "CROSS_TENANT_REFERENCE"
    )
      return new NotFoundException({ code: error.code });
    if (error.code === "VALIDATION_ERROR")
      return new UnprocessableEntityException({ code: error.code });
    return new ConflictException({ code: error.code });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return new ConflictException({ code: "RESOURCE_STATE_CONFLICT" });
    if (["P2003", "P2025"].includes(error.code))
      return new NotFoundException({ code: "RESOURCE_NOT_FOUND" });
    if (error.code === "P2004")
      return new UnprocessableEntityException({ code: "VALIDATION_ERROR" });
  }
  return error instanceof Error
    ? error
    : new Error("Residents operation failed");
}

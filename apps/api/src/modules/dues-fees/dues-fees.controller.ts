import {
  BadRequestException,
  Body,
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
import { DuesFeesError, type DuesActorContext } from "./dues-fees.contract.js";
// DTO classes are runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  CreateBillingPeriodDto,
  CreateChargeConceptDto,
  CreateFeeScheduleDto,
  CreateUnitFeeDto,
  DuesPageQueryDto,
  EmptyMutationDto,
  EndUnitFeeDto,
  UpdateChargeConceptDto,
  UpdateFeeScheduleDto,
} from "./dues-fees.dto.js";
import { DuesFeesService } from "./dues-fees.service.js";

@ApiExcludeController()
@Controller("tenant/charge-concepts")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class ChargeConceptsController {
  public constructor(
    @Inject(DuesFeesService) private readonly service: DuesFeesService,
  ) {}
  @Get()
  @RequirePermission("chargeConcepts.read")
  public list(@Query() query: DuesPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listChargeConcepts(context.actor, query, context.traceId),
    );
  }
  @Post()
  @RequirePermission("chargeConcepts.create")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateChargeConceptDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createChargeConcept(
        context.actor,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Get(":chargeConceptId")
  @RequirePermission("chargeConcepts.read")
  public get(
    @Param("chargeConceptId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getChargeConcept(context.actor, id, context.traceId),
    );
  }
  @Patch(":chargeConceptId")
  @RequirePermission("chargeConcepts.update")
  public update(
    @Param("chargeConceptId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateChargeConceptDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateChargeConcept(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":chargeConceptId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("chargeConcepts.archive")
  public archive(
    @Param("chargeConceptId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() _body: EmptyMutationDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.archiveChargeConcept(
        context.actor,
        id,
        key,
        context.traceId,
      ),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/fee-schedules")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class FeeSchedulesController {
  public constructor(
    @Inject(DuesFeesService) private readonly service: DuesFeesService,
  ) {}
  @Get()
  @RequirePermission("feeSchedules.read")
  public list(@Query() query: DuesPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listFeeSchedules(context.actor, query, context.traceId),
    );
  }
  @Post()
  @RequirePermission("feeSchedules.create")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateFeeScheduleDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createFeeSchedule(context.actor, key, body, context.traceId),
    );
  }
  @Get(":feeScheduleId")
  @RequirePermission("feeSchedules.read")
  public get(
    @Param("feeScheduleId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getFeeSchedule(context.actor, id, context.traceId),
    );
  }
  @Patch(":feeScheduleId")
  @RequirePermission("feeSchedules.update")
  public update(
    @Param("feeScheduleId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: UpdateFeeScheduleDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.updateFeeSchedule(
        context.actor,
        id,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Post(":feeScheduleId/archive")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("feeSchedules.archive")
  public archive(
    @Param("feeScheduleId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() _body: EmptyMutationDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.archiveFeeSchedule(context.actor, id, key, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/unit-fees")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class UnitFeesController {
  public constructor(
    @Inject(DuesFeesService) private readonly service: DuesFeesService,
  ) {}
  @Get()
  @RequirePermission("unitFees.read")
  public list(@Query() query: DuesPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listUnitFees(context.actor, query, context.traceId),
    );
  }
  @Post()
  @RequirePermission("unitFees.assign")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateUnitFeeDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createUnitFee(context.actor, key, body, context.traceId),
    );
  }
  @Get(":unitFeeAssignmentId")
  @RequirePermission("unitFees.read")
  public get(
    @Param("unitFeeAssignmentId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getUnitFee(context.actor, id, context.traceId),
    );
  }
  @Post(":unitFeeAssignmentId/end")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("unitFees.end")
  public end(
    @Param("unitFeeAssignmentId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: EndUnitFeeDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.endUnitFee(context.actor, id, key, body, context.traceId),
    );
  }
}

@ApiExcludeController()
@Controller("tenant/billing-periods")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class BillingPeriodsController {
  public constructor(
    @Inject(DuesFeesService) private readonly service: DuesFeesService,
  ) {}
  @Get()
  @RequirePermission("billingPeriods.read")
  public list(@Query() query: DuesPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listBillingPeriods(context.actor, query, context.traceId),
    );
  }
  @Post()
  @RequirePermission("billingPeriods.create")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateBillingPeriodDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return executeResult(() =>
      this.service.createBillingPeriod(
        context.actor,
        key,
        body,
        context.traceId,
      ),
    );
  }
  @Get(":billingPeriodId")
  @RequirePermission("billingPeriods.read")
  public get(
    @Param("billingPeriodId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.getBillingPeriod(context.actor, id, context.traceId),
    );
  }
}

function uuid() {
  return new ParseUUIDPipe({ version: "4" });
}
function readContext(request: unknown): {
  actor: DuesActorContext;
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
  if (error instanceof DuesFeesError) {
    if (error.code === "ACCESS_DENIED")
      return new ForbiddenException({ code: "PERMISSION_DENIED" });
    if (["RESOURCE_NOT_FOUND", "CROSS_TENANT_REFERENCE"].includes(error.code))
      return new NotFoundException({ code: error.code });
    if (
      ["VALIDATION_ERROR", "UNSUPPORTED_TENANT_CURRENCY"].includes(error.code)
    )
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
  return error instanceof Error ? error : new Error("Dues operation failed");
}

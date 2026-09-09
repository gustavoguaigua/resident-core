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
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
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
  AdjustChargeDto,
  ChargePageQueryDto,
  ChargeReasonDto,
  CreateChargeDto,
  GenerateMonthlyChargesDto,
  ReverseChargeDto,
} from "./charge-lifecycle.dto.js";
import { ChargeLifecycleService } from "./charge-lifecycle.service.js";

@Controller("tenant/billing-periods")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class BillingPeriodLifecycleController {
  public constructor(
    @Inject(ChargeLifecycleService)
    private readonly service: ChargeLifecycleService,
  ) {}
  @Post(":billingPeriodId/close")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("billingPeriods.close")
  public close(
    @Param("billingPeriodId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ChargeReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.closePeriod(context.actor, id, key, body, context.traceId),
    );
  }
  @Post(":billingPeriodId/lock")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("billingPeriods.lock")
  public lock(
    @Param("billingPeriodId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ChargeReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.lockPeriod(context.actor, id, key, body, context.traceId),
    );
  }
}

@Controller("tenant/charge-batches")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class ChargeBatchesController {
  public constructor(
    @Inject(ChargeLifecycleService)
    private readonly service: ChargeLifecycleService,
  ) {}
  @Get()
  @RequirePermission("fees.readBatches")
  public list(@Query() query: ChargePageQueryDto, @Req() request: unknown) {
    const c = readContext(request);
    return execute(() => this.service.listBatches(c.actor, query, c.traceId));
  }
  @Get(":chargeBatchId")
  @RequirePermission("fees.readBatches")
  public get(
    @Param("chargeBatchId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return execute(() => this.service.getBatch(c.actor, id, c.traceId));
  }
}

@Controller("tenant/charges")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class ChargesController {
  public constructor(
    @Inject(ChargeLifecycleService)
    private readonly service: ChargeLifecycleService,
  ) {}
  @Post("generate-monthly")
  @RequirePermission("fees.generate")
  public generate(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: GenerateMonthlyChargesDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return result(() =>
      this.service.generateMonthly(c.actor, key, body, c.traceId),
    );
  }
  @Get()
  @RequirePermission("charges.read")
  public list(@Query() query: ChargePageQueryDto, @Req() request: unknown) {
    const c = readContext(request);
    return execute(() => this.service.listCharges(c.actor, query, c.traceId));
  }
  @Post()
  @RequirePermission("charges.create")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreateChargeDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return result(() =>
      this.service.createCharge(c.actor, key, body, c.traceId),
    );
  }
  @Get(":chargeId")
  @RequirePermission("charges.read")
  public get(@Param("chargeId", uuid()) id: string, @Req() request: unknown) {
    const c = readContext(request);
    return execute(() => this.service.getCharge(c.actor, id, c.traceId));
  }
  @Post(":chargeId/cancel")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("charges.cancel")
  public cancel(
    @Param("chargeId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ChargeReasonDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return result(() =>
      this.service.cancelCharge(c.actor, id, key, body, c.traceId),
    );
  }
  @Post(":chargeId/reverse")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("charges.reverse")
  public reverse(
    @Param("chargeId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ReverseChargeDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return result(() =>
      this.service.reverseCharge(c.actor, id, key, body, c.traceId),
    );
  }
  @Post(":chargeId/adjustments")
  @RequirePermission("charges.adjust")
  public adjust(
    @Param("chargeId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: AdjustChargeDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return result(() =>
      this.service.adjustCharge(c.actor, id, key, body, c.traceId),
    );
  }
}

@Controller("me")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class OwnChargesController {
  public constructor(
    @Inject(ChargeLifecycleService)
    private readonly service: ChargeLifecycleService,
  ) {}
  @Get("charges")
  @RequirePermission("charges.read.own")
  public list(@Query() query: ChargePageQueryDto, @Req() request: unknown) {
    const c = readContext(request);
    return execute(() =>
      this.service.listOwnCharges(c.actor, query, c.traceId),
    );
  }
  @Get("property-units/:propertyUnitId/charges")
  @RequirePermission("charges.read.own")
  public listUnit(
    @Param("propertyUnitId", uuid()) id: string,
    @Query() query: ChargePageQueryDto,
    @Req() request: unknown,
  ) {
    const c = readContext(request);
    return execute(() =>
      this.service.listOwnCharges(
        c.actor,
        { ...query, propertyUnitId: id },
        c.traceId,
        true,
      ),
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
const result = <T>(operation: () => Promise<{ responseBody: T }>) =>
  execute(async () => (await operation()).responseBody);
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
  return error instanceof Error ? error : new Error("Charge operation failed");
}

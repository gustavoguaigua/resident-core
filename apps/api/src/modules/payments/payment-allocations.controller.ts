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
import { PaymentAllocationsService } from "./payment-allocations.service.js";
import { PaymentError, type PaymentActorContext } from "./payments.contract.js";
// DTOs are runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AllocatePaymentDto } from "./payment-allocations.dto.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PaymentReasonDto } from "./payments.dto.js";

@Controller("tenant/payments")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PaymentAllocationCommandsController {
  public constructor(
    @Inject(PaymentAllocationsService)
    private readonly service: PaymentAllocationsService,
  ) {}

  @Post(":paymentId/allocate")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.allocate")
  public allocate(
    @Param("paymentId", uuid()) paymentId: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: AllocatePaymentDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.allocate(
        context.actor,
        paymentId,
        key,
        body,
        context.traceId,
      ),
    );
  }

  @Post(":paymentId/auto-allocate")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.allocate")
  public autoAllocate(
    @Param("paymentId", uuid()) paymentId: string,
    @Headers("idempotency-key") key: string | undefined,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.autoAllocate(context.actor, paymentId, key, context.traceId),
    );
  }

  @Post(":paymentId/reverse")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.reverse")
  public reverse(
    @Param("paymentId", uuid()) paymentId: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: PaymentReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.reversePayment(
        context.actor,
        paymentId,
        key,
        body,
        context.traceId,
      ),
    );
  }

  @Get(":paymentId/allocations")
  @RequirePermission("payments.read")
  public list(
    @Param("paymentId", uuid()) paymentId: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.list(context.actor, paymentId, context.traceId),
    );
  }
}

@Controller("tenant/payment-allocations")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PaymentAllocationsController {
  public constructor(
    @Inject(PaymentAllocationsService)
    private readonly service: PaymentAllocationsService,
  ) {}

  @Get(":allocationId")
  @RequirePermission("payments.read")
  public get(
    @Param("allocationId", uuid()) allocationId: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.get(context.actor, allocationId, context.traceId),
    );
  }

  @Post(":allocationId/reverse")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.allocations.reverse")
  public reverse(
    @Param("allocationId", uuid()) allocationId: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: PaymentReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.reverseAllocation(
        context.actor,
        allocationId,
        key,
        body,
        context.traceId,
      ),
    );
  }
}

function uuid() {
  return new ParseUUIDPipe({ version: "4" });
}
function readContext(request: unknown): {
  actor: PaymentActorContext;
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
  if (error instanceof PaymentError) {
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
  return error instanceof Error
    ? error
    : new Error("Payment allocation failed");
}

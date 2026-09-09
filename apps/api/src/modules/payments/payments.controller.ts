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
  StreamableFile,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
import { PaymentError, type PaymentActorContext } from "./payments.contract.js";
// DTOs are runtime imports for Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  CreatePaymentDto,
  PaymentPageQueryDto,
  PaymentReasonDto,
  ReceiptUploadDto,
} from "./payments.dto.js";
import { PaymentsService } from "./payments.service.js";

interface UploadedReceipt {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
}

@Controller("tenant/payments")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PaymentsController {
  public constructor(
    @Inject(PaymentsService) private readonly service: PaymentsService,
  ) {}

  @Get()
  @RequirePermission("payments.read")
  public list(@Query() query: PaymentPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.list(context.actor, query, context.traceId),
    );
  }

  @Post()
  @RequirePermission("payments.create")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreatePaymentDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.create(context.actor, key, body, context.traceId),
    );
  }

  @Get(":paymentId")
  @RequirePermission("payments.read")
  public get(@Param("paymentId", uuid()) id: string, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() => this.service.get(context.actor, id, context.traceId));
  }

  @Post(":paymentId/confirm")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.confirm")
  public confirm(
    @Param("paymentId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.confirm(context.actor, id, key, context.traceId),
    );
  }

  @Post(":paymentId/reject")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("payments.reject")
  public reject(
    @Param("paymentId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: PaymentReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.reject(context.actor, id, key, body, context.traceId),
    );
  }

  @Get(":paymentId/receipts")
  @RequirePermission("paymentReceipts.read")
  public receipts(
    @Param("paymentId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return execute(() =>
      this.service.listReceipts(context.actor, id, context.traceId),
    );
  }

  @Post(":paymentId/receipts")
  @RequirePermission("paymentReceipts.create")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10_485_760 } }),
  )
  public upload(
    @Param("paymentId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ReceiptUploadDto,
    @UploadedFile() file: UploadedReceipt | undefined,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    if (file === undefined)
      throw new UnprocessableEntityException({ code: "VALIDATION_ERROR" });
    return execute(() =>
      this.service.uploadReceipt(
        context.actor,
        id,
        key,
        body,
        file,
        context.traceId,
        false,
      ),
    );
  }
}

@Controller("tenant/payment-receipts")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PaymentReceiptsController {
  public constructor(
    @Inject(PaymentsService) private readonly service: PaymentsService,
  ) {}

  @Get(":receiptId")
  @RequirePermission("paymentReceipts.read")
  public get(@Param("receiptId", uuid()) id: string, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.getReceipt(context.actor, id, context.traceId),
    );
  }

  @Get(":receiptId/download")
  @RequirePermission("paymentReceipts.download")
  public async download(
    @Param("receiptId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    const file = await execute(() =>
      this.service.downloadReceipt(context.actor, id, context.traceId, false),
    );
    return new StreamableFile(Buffer.from(file.body), {
      disposition: `attachment; filename="${file.fileName.replaceAll('"', "")}"`,
      type: file.mimeType,
    });
  }

  @Post(":receiptId/accept")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("paymentReceipts.review")
  public accept(
    @Param("receiptId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.acceptReceipt(context.actor, id, key, context.traceId),
    );
  }

  @Post(":receiptId/reject")
  @HttpCode(HttpStatus.OK)
  @RequirePermission("paymentReceipts.review")
  public reject(
    @Param("receiptId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: PaymentReasonDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.rejectReceipt(context.actor, id, key, body, context.traceId),
    );
  }
}

@Controller("me")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class OwnPaymentsController {
  public constructor(
    @Inject(PaymentsService) private readonly service: PaymentsService,
  ) {}

  @Get("payments")
  @RequirePermission("payments.read.own")
  public list(@Query() query: PaymentPageQueryDto, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.listOwn(context.actor, query, context.traceId),
    );
  }

  @Post("payments")
  @RequirePermission("payments.create.own")
  public create(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: CreatePaymentDto,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    return result(() =>
      this.service.reportOwn(context.actor, key, body, context.traceId),
    );
  }

  @Get("payments/:paymentId")
  @RequirePermission("payments.read.own")
  public get(@Param("paymentId", uuid()) id: string, @Req() request: unknown) {
    const context = readContext(request);
    return execute(() =>
      this.service.getOwn(context.actor, id, context.traceId),
    );
  }

  @Post("payments/:paymentId/receipts")
  @RequirePermission("paymentReceipts.create.own")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10_485_760 } }),
  )
  public upload(
    @Param("paymentId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: ReceiptUploadDto,
    @UploadedFile() file: UploadedReceipt | undefined,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    if (file === undefined)
      throw new UnprocessableEntityException({ code: "VALIDATION_ERROR" });
    return execute(() =>
      this.service.uploadReceipt(
        context.actor,
        id,
        key,
        body,
        file,
        context.traceId,
        true,
      ),
    );
  }

  @Get("payment-receipts/:receiptId/download")
  @RequirePermission("paymentReceipts.download.own")
  public async download(
    @Param("receiptId", uuid()) id: string,
    @Req() request: unknown,
  ) {
    const context = readContext(request);
    const file = await execute(() =>
      this.service.downloadReceipt(context.actor, id, context.traceId, true),
    );
    return new StreamableFile(Buffer.from(file.body), {
      disposition: `attachment; filename="${file.fileName.replaceAll('"', "")}"`,
      type: file.mimeType,
    });
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
  return error instanceof Error ? error : new Error("Payment operation failed");
}

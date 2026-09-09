import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
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
import {
  StatementError,
  type StatementActorContext,
} from "./account-statements.contract.js";
import { AccountStatementsService } from "./account-statements.service.js";
// Runtime imports provide Nest validation metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  GenerateStatementBatchDto,
  GenerateStatementDto,
  RecalculateBalanceDto,
  StatementPageQueryDto,
  StatementReasonDto,
} from "./account-statements.dto.js";

@Controller("tenant/account-statements")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class AccountStatementsController {
  public constructor(
    @Inject(AccountStatementsService)
    private readonly service: AccountStatementsService,
  ) {}
  @Get() @RequirePermission("accountStatements.read") public list(
    @Query() query: StatementPageQueryDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.list(c.actor, query, c.traceId));
  }
  @Post("generate")
  @RequirePermission("accountStatements.generate")
  public generate(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: GenerateStatementDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() => this.service.generate(c.actor, key, body, c.traceId));
  }
  @Post("generate-batch")
  @RequirePermission("accountStatements.generate")
  public batch(
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: GenerateStatementBatchDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.generateBatch(c.actor, key, body, c.traceId),
    );
  }
  @Get(":statementId") @RequirePermission("accountStatements.read") public get(
    @Param("statementId", uuid()) id: string,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.get(c.actor, id, c.traceId, false));
  }
  @Post(":statementId/publish")
  @RequirePermission("accountStatements.publish")
  public publish(
    @Param("statementId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.transition(c.actor, id, key, "publish", {}, c.traceId),
    );
  }
  @Post(":statementId/close")
  @RequirePermission("accountStatements.close")
  public close(
    @Param("statementId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: StatementReasonDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.transition(c.actor, id, key, "close", body, c.traceId),
    );
  }
  @Post(":statementId/lock")
  @RequirePermission("accountStatements.lock")
  public lock(
    @Param("statementId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: StatementReasonDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.transition(c.actor, id, key, "lock", body, c.traceId),
    );
  }
  @Post(":statementId/regenerate")
  @RequirePermission("accountStatements.regenerate")
  public regenerate(
    @Param("statementId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: StatementReasonDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.regenerate(c.actor, id, key, body, c.traceId),
    );
  }
}

@Controller("tenant")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class BalancesController {
  public constructor(
    @Inject(AccountStatementsService)
    private readonly service: AccountStatementsService,
  ) {}
  @Get("balances") @RequirePermission("balances.read") public list(
    @Query() query: StatementPageQueryDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.listBalances(c.actor, query, c.traceId));
  }
  @Get("property-units/:propertyUnitId/balance")
  @RequirePermission("balances.read")
  public balance(
    @Param("propertyUnitId", uuid()) id: string,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.balance(c.actor, id, c.traceId, false));
  }
  @Post("property-units/:propertyUnitId/balance/recalculate")
  @RequirePermission("balances.recalculate")
  public recalculate(
    @Param("propertyUnitId", uuid()) id: string,
    @Headers("idempotency-key") key: string | undefined,
    @Body() body: RecalculateBalanceDto,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return result(() =>
      this.service.recalculate(c.actor, id, key, body, c.traceId),
    );
  }
  @Get("property-units/:propertyUnitId/financial-movements")
  @RequirePermission("financialMovements.read")
  public movements(
    @Param("propertyUnitId", uuid()) id: string,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.movements(c.actor, id, c.traceId, false));
  }
}

@Controller("me")
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class OwnAccountStatementsController {
  public constructor(
    @Inject(AccountStatementsService)
    private readonly service: AccountStatementsService,
  ) {}
  @Get("account-statements")
  @RequirePermission("accountStatements.read.own")
  public list(@Query() query: StatementPageQueryDto, @Req() req: unknown) {
    const c = context(req);
    return execute(() => this.service.listOwn(c.actor, query, c.traceId));
  }
  @Get("account-statements/:statementId")
  @RequirePermission("accountStatements.read.own")
  public get(@Param("statementId", uuid()) id: string, @Req() req: unknown) {
    const c = context(req);
    return execute(() => this.service.get(c.actor, id, c.traceId, true));
  }
  @Get("property-units/:propertyUnitId/balance")
  @RequirePermission("balances.read.own")
  public balance(
    @Param("propertyUnitId", uuid()) id: string,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.balance(c.actor, id, c.traceId, true));
  }
  @Get("property-units/:propertyUnitId/financial-movements")
  @RequirePermission("financialMovements.read.own")
  public movements(
    @Param("propertyUnitId", uuid()) id: string,
    @Req() req: unknown,
  ) {
    const c = context(req);
    return execute(() => this.service.movements(c.actor, id, c.traceId, true));
  }
}

function uuid() {
  return new ParseUUIDPipe({ version: "4" });
}
function context(request: unknown): {
  actor: StatementActorContext;
  traceId: string;
} {
  const p = getAuthenticatedPrincipal(request);
  const t = getTenantContext(request);
  if (!p || !t) throw new ForbiddenException();
  return {
    actor: {
      membershipId: t.membershipId,
      tenantId: t.tenantId,
      userProfileId: p.userProfileId,
    },
    traceId: getOrCreateTraceId(request),
  };
}
const result = <T>(fn: () => Promise<{ responseBody: T }>) =>
  execute(async () => (await fn()).responseBody);
async function execute<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    throw mapError(e);
  }
}
function mapError(e: unknown): Error {
  if (e instanceof IdempotencyError)
    return e.code === "IDEMPOTENCY_KEY_REQUIRED"
      ? new BadRequestException({ code: e.code })
      : new ConflictException({ code: e.code });
  if (e instanceof StatementError) {
    if (e.code === "ACCESS_DENIED")
      return new ForbiddenException({ code: "PERMISSION_DENIED" });
    if (e.code === "RESOURCE_NOT_FOUND")
      return new NotFoundException({ code: e.code });
    if (
      [
        "VALIDATION_ERROR",
        "UNSUPPORTED_TENANT_CURRENCY",
        "FINANCIAL_CURRENCY_MISMATCH",
      ].includes(e.code)
    )
      return new UnprocessableEntityException({ code: e.code });
    return new ConflictException({ code: e.code });
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002")
      return new ConflictException({ code: "RESOURCE_STATE_CONFLICT" });
    if (["P2003", "P2025"].includes(e.code))
      return new NotFoundException({ code: "RESOURCE_NOT_FOUND" });
  }
  return e instanceof Error ? e : new Error("Statement operation failed");
}

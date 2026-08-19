import { Injectable } from "@nestjs/common";

import {
  TenantContextError,
  type PermissionEvaluation,
  type PermissionEvaluatorPort,
  type TenantContext,
  type TenantContextResolverPort,
  type AuthenticatedPrincipal,
} from "@resident/auth";

import type { PrismaService } from "../../platform/database/prisma.service.js";
import { getOrCreateTraceId } from "../../platform/http/trace-context.js";
import type { AuditWriterPort } from "../audit/audit-writer.port.js";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

@Injectable()
export class PrismaTenantContextResolver implements TenantContextResolverPort {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditWriterPort,
  ) {}

  public async resolve(
    principal: AuthenticatedPrincipal,
    request: unknown,
  ): Promise<TenantContext | null> {
    const tenantId = readTenantHeader(request);
    if (hasTenantSelectorConflict(request)) {
      throw new TenantContextError("TENANT_CONTEXT_CONFLICT");
    }

    const membership = await this.prisma.userTenantMembership.findFirst({
      select: { id: true, tenantId: true },
      where: {
        status: "ACTIVE",
        tenant: { status: "ACTIVE" },
        tenantId,
        userProfileId: principal.userProfileId,
      },
    });
    if (membership === null) {
      await this.auditWriter.recordDenied(
        {
          actor: { type: "USER", userProfileId: principal.userProfileId },
          traceId: getOrCreateTraceId(request),
        },
        {
          action: "tenantAccess.denied",
          occurredAt: new Date(),
          reasonCode: "TENANT_ACCESS_DENIED",
        },
      );
      throw new TenantContextError("TENANT_ACCESS_DENIED");
    }

    return { membershipId: membership.id, tenantId: membership.tenantId };
  }
}

@Injectable()
export class PrismaPermissionEvaluator implements PermissionEvaluatorPort {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditWriterPort,
  ) {}

  public async isAllowed(evaluation: PermissionEvaluation): Promise<boolean> {
    const allowed =
      evaluation.tenant === null
        ? await this.hasGlobalPermission(evaluation)
        : await this.hasTenantPermission(evaluation);
    if (!allowed) {
      await this.auditWriter.recordDenied(
        {
          actor:
            evaluation.tenant === null
              ? {
                  type: "USER",
                  userProfileId: evaluation.principal.userProfileId,
                }
              : {
                  type: "USER",
                  userProfileId: evaluation.principal.userProfileId,
                  membershipId: evaluation.tenant.membershipId,
                },
          ...(evaluation.tenant === null
            ? {}
            : { tenantId: evaluation.tenant.tenantId }),
          traceId: evaluation.traceId,
        },
        {
          action: "authorization.denied",
          occurredAt: new Date(),
          reasonCode: "ACCESS_DENIED",
        },
      );
    }
    return allowed;
  }

  private async hasGlobalPermission(
    evaluation: PermissionEvaluation,
  ): Promise<boolean> {
    const assignment = await this.prisma.userGlobalRole.findFirst({
      select: { id: true },
      where: {
        removedAt: null,
        userProfileId: evaluation.principal.userProfileId,
        role: {
          scope: "GLOBAL",
          tenantId: null,
          permissions: {
            some: { permission: { code: evaluation.permission } },
          },
        },
      },
    });
    return assignment !== null;
  }

  private async hasTenantPermission(
    evaluation: PermissionEvaluation,
  ): Promise<boolean> {
    const tenant = evaluation.tenant;
    if (tenant === null) {
      return false;
    }
    const assignment = await this.prisma.membershipRole.findFirst({
      select: { id: true },
      where: {
        membership: {
          id: tenant.membershipId,
          status: "ACTIVE",
          tenant: { status: "ACTIVE" },
          tenantId: tenant.tenantId,
          userProfileId: evaluation.principal.userProfileId,
        },
        removedAt: null,
        role: {
          scope: "TENANT",
          tenantId: tenant.tenantId,
          permissions: {
            some: { permission: { code: evaluation.permission } },
          },
        },
      },
    });
    return assignment !== null;
  }
}

function readTenantHeader(request: unknown): string {
  if (
    typeof request !== "object" ||
    request === null ||
    !("headers" in request)
  ) {
    throw new TenantContextError("TENANT_CONTEXT_REQUIRED");
  }
  const headers = (request as { headers?: unknown }).headers;
  if (typeof headers !== "object" || headers === null) {
    throw new TenantContextError("TENANT_CONTEXT_REQUIRED");
  }
  const value = (headers as Record<string, unknown>)["x-tenant-id"];
  if (value === undefined) {
    throw new TenantContextError("TENANT_CONTEXT_REQUIRED");
  }
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new TenantContextError("TENANT_CONTEXT_INVALID");
  }
  return value;
}

function hasTenantSelectorConflict(request: unknown): boolean {
  if (typeof request !== "object" || request === null) {
    return false;
  }
  const candidate = request as { body?: unknown; query?: unknown };
  return [candidate.body, candidate.query].some(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      Object.prototype.hasOwnProperty.call(value, "tenantId"),
  );
}

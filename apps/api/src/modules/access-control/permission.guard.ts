import {
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import {
  PERMISSION_EVALUATOR_PORT,
  type PermissionEvaluatorPort,
} from "@resident/auth";

import {
  getAuthenticatedPrincipal,
  getTenantContext,
} from "../../platform/security/request-security-context.js";
import { getOrCreateTraceId } from "../../platform/http/trace-context.js";

export const REQUIRED_PERMISSION_METADATA = "resident:required-permission";

export function RequirePermission(permission: string): MethodDecorator {
  return SetMetadata(REQUIRED_PERMISSION_METADATA, permission);
}

@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    @Inject(PERMISSION_EVALUATOR_PORT)
    private readonly permissionEvaluator: PermissionEvaluatorPort,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<unknown>();
    const principal = getAuthenticatedPrincipal(request);
    const permission = this.reflector.getAllAndOverride<string>(
      REQUIRED_PERMISSION_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (
      principal === undefined ||
      permission === undefined ||
      permission.trim().length === 0
    ) {
      throw new ForbiddenException();
    }

    const allowed = await this.permissionEvaluator.isAllowed({
      permission,
      principal,
      tenant: getTenantContext(request) ?? null,
      traceId: getOrCreateTraceId(request),
    });

    if (!allowed) {
      throw new ForbiddenException();
    }

    return true;
  }
}

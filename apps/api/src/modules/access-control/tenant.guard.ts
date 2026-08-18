import {
  ForbiddenException,
  BadRequestException,
  Inject,
  Injectable,
  UnprocessableEntityException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";

import {
  TENANT_CONTEXT_RESOLVER_PORT,
  TenantContextError,
  type TenantContextResolverPort,
} from "@resident/auth";

import {
  getAuthenticatedPrincipal,
  setTenantContext,
} from "../../platform/security/request-security-context.js";

@Injectable()
export class TenantGuard implements CanActivate {
  public constructor(
    @Inject(TENANT_CONTEXT_RESOLVER_PORT)
    private readonly tenantResolver: TenantContextResolverPort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<unknown>();
    const principal = getAuthenticatedPrincipal(request);

    if (
      principal === undefined ||
      typeof request !== "object" ||
      request === null
    ) {
      throw new ForbiddenException();
    }

    let tenant;
    try {
      tenant = await this.tenantResolver.resolve(principal, request);
    } catch (error) {
      if (error instanceof TenantContextError) {
        if (
          error.code === "TENANT_CONTEXT_REQUIRED" ||
          error.code === "TENANT_CONTEXT_INVALID"
        ) {
          throw new BadRequestException();
        }
        if (error.code === "TENANT_CONTEXT_CONFLICT") {
          throw new UnprocessableEntityException();
        }
      }
      throw new ForbiddenException();
    }

    if (tenant === null || tenant.tenantId.trim().length === 0) {
      throw new ForbiddenException();
    }

    setTenantContext(request, tenant);
    return true;
  }
}

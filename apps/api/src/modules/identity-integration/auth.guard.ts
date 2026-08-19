import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  ForbiddenException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";

import {
  IDENTITY_RESOLVER_PORT,
  IdentityResolutionError,
  type IdentityResolverPort,
} from "@resident/auth";

import { setAuthenticatedPrincipal } from "../../platform/security/request-security-context.js";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    @Inject(IDENTITY_RESOLVER_PORT)
    private readonly identityResolver: IdentityResolverPort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<unknown>();
    let principal;
    try {
      principal = await this.identityResolver.resolve(request);
    } catch (error) {
      if (error instanceof IdentityResolutionError) {
        if (error.code === "IDENTITY_PROVIDER_UNAVAILABLE") {
          throw new ServiceUnavailableException();
        }
        if (
          error.code === "IDENTITY_NOT_PROVISIONED" ||
          error.code === "USER_DISABLED"
        ) {
          throw new ForbiddenException();
        }
      }
      throw new UnauthorizedException();
    }

    if (
      principal === null ||
      principal.subject.trim().length === 0 ||
      typeof request !== "object" ||
      request === null
    ) {
      throw new UnauthorizedException();
    }

    setAuthenticatedPrincipal(request, principal);
    return true;
  }
}

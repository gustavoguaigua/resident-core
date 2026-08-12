import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";

import {
  IDENTITY_RESOLVER_PORT,
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
    const principal = await this.identityResolver.resolve(request);

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

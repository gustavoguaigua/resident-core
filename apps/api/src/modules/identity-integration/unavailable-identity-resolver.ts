import { Injectable } from "@nestjs/common";

import type {
  AuthenticatedPrincipal,
  IdentityResolverPort,
} from "@resident/auth";

@Injectable()
export class UnavailableIdentityResolver implements IdentityResolverPort {
  public async resolve(): Promise<AuthenticatedPrincipal | null> {
    return null;
  }
}

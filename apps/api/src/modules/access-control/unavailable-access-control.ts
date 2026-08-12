import { Injectable } from "@nestjs/common";

import type {
  PermissionEvaluatorPort,
  TenantContext,
  TenantContextResolverPort,
} from "@resident/auth";

@Injectable()
export class UnavailableTenantContextResolver implements TenantContextResolverPort {
  public async resolve(): Promise<TenantContext | null> {
    return null;
  }
}

@Injectable()
export class UnavailablePermissionEvaluator implements PermissionEvaluatorPort {
  public async isAllowed(): Promise<boolean> {
    return false;
  }
}

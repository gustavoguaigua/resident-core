export type AuthenticatedDiscoveryErrorCode = "ACCESS_DENIED";

export class AuthenticatedDiscoveryError extends Error {
  public constructor(public readonly code: AuthenticatedDiscoveryErrorCode) {
    super(code);
    this.name = "AuthenticatedDiscoveryError";
  }
}

export interface CurrentUserProfile {
  readonly userProfileId: string;
  readonly displayName: string;
  readonly status: "active";
}

export interface AccessibleTenant {
  readonly tenantId: string;
  readonly slug: string;
  readonly name: string;
  readonly membershipStatus: "active";
}

export interface EffectiveTenantPermissions {
  readonly tenantId: string;
  readonly permissions: readonly string[];
}

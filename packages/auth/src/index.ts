export const AUTH_RUNTIME_STATUS = "identity-membership-authorization" as const;

export interface AuthenticatedPrincipal {
  readonly subject: string;
  readonly userProfileId: string;
}

export interface TenantContext {
  readonly membershipId: string;
  readonly tenantId: string;
}

export interface PermissionEvaluation {
  readonly permission: string;
  readonly principal: AuthenticatedPrincipal;
  readonly tenant: TenantContext | null;
  readonly traceId: string;
}

export type IdentityResolutionErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "IDENTITY_NOT_PROVISIONED"
  | "IDENTITY_PROVIDER_UNAVAILABLE"
  | "INVALID_ACCESS_TOKEN"
  | "USER_DISABLED";

export class IdentityResolutionError extends Error {
  public constructor(public readonly code: IdentityResolutionErrorCode) {
    super(code);
    this.name = "IdentityResolutionError";
  }
}

export type TenantContextErrorCode =
  | "TENANT_ACCESS_DENIED"
  | "TENANT_CONTEXT_CONFLICT"
  | "TENANT_CONTEXT_INVALID"
  | "TENANT_CONTEXT_REQUIRED";

export class TenantContextError extends Error {
  public constructor(public readonly code: TenantContextErrorCode) {
    super(code);
    this.name = "TenantContextError";
  }
}

export interface IdentityResolverPort {
  resolve(request: unknown): Promise<AuthenticatedPrincipal | null>;
}

export interface TenantContextResolverPort {
  resolve(
    principal: AuthenticatedPrincipal,
    request: unknown,
  ): Promise<TenantContext | null>;
}

export interface PermissionEvaluatorPort {
  isAllowed(evaluation: PermissionEvaluation): Promise<boolean>;
}

export const IDENTITY_RESOLVER_PORT = Symbol("IDENTITY_RESOLVER_PORT");
export const TENANT_CONTEXT_RESOLVER_PORT = Symbol(
  "TENANT_CONTEXT_RESOLVER_PORT",
);
export const PERMISSION_EVALUATOR_PORT = Symbol("PERMISSION_EVALUATOR_PORT");

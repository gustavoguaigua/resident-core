export const AUTH_RUNTIME_STATUS = "fail-closed-skeletons" as const;

export interface AuthenticatedPrincipal {
  readonly subject: string;
}

export interface TenantContext {
  readonly tenantId: string;
}

export interface PermissionEvaluation {
  readonly permission: string;
  readonly principal: AuthenticatedPrincipal;
  readonly tenant: TenantContext | null;
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

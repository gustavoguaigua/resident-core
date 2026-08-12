import type { AuthenticatedPrincipal, TenantContext } from "@resident/auth";

interface RequestSecurityContext {
  principal?: AuthenticatedPrincipal;
  tenant?: TenantContext;
}

const requestContexts = new WeakMap<object, RequestSecurityContext>();

export function getAuthenticatedPrincipal(
  request: unknown,
): AuthenticatedPrincipal | undefined {
  return getContext(request)?.principal;
}

export function getTenantContext(request: unknown): TenantContext | undefined {
  return getContext(request)?.tenant;
}

export function setAuthenticatedPrincipal(
  request: object,
  principal: AuthenticatedPrincipal,
): void {
  const context = getOrCreateContext(request);
  context.principal = principal;
}

export function setTenantContext(request: object, tenant: TenantContext): void {
  const context = getOrCreateContext(request);
  context.tenant = tenant;
}

function getContext(request: unknown): RequestSecurityContext | undefined {
  return typeof request === "object" && request !== null
    ? requestContexts.get(request)
    : undefined;
}

function getOrCreateContext(request: object): RequestSecurityContext {
  const existing = requestContexts.get(request);

  if (existing !== undefined) {
    return existing;
  }

  const context: RequestSecurityContext = {};
  requestContexts.set(request, context);
  return context;
}

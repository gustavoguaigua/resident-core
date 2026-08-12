import "reflect-metadata";

import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it } from "vitest";

import { PermissionGuard } from "../src/modules/access-control/permission.guard.js";
import { TenantGuard } from "../src/modules/access-control/tenant.guard.js";
import {
  UnavailablePermissionEvaluator,
  UnavailableTenantContextResolver,
} from "../src/modules/access-control/unavailable-access-control.js";
import { AuthGuard } from "../src/modules/identity-integration/auth.guard.js";
import { UnavailableIdentityResolver } from "../src/modules/identity-integration/unavailable-identity-resolver.js";
import { setAuthenticatedPrincipal } from "../src/platform/security/request-security-context.js";

describe("fail-closed security skeletons", () => {
  it("denies authentication while no identity adapter exists", async () => {
    const guard = new AuthGuard(new UnavailableIdentityResolver());

    await expect(guard.canActivate(createContext({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("denies tenant access while no tenant adapter exists", async () => {
    const guard = new TenantGuard(new UnavailableTenantContextResolver());
    const request = {};
    setAuthenticatedPrincipal(request, { subject: "subject-1" });

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("denies permissions while no permission adapter exists", async () => {
    const guard = new PermissionGuard(
      new UnavailablePermissionEvaluator(),
      new Reflector(),
    );
    const request = {};
    const handler = (): void => undefined;
    Reflect.defineMetadata(
      "resident:required-permission",
      "platform.example",
      handler,
    );
    setAuthenticatedPrincipal(request, { subject: "subject-1" });

    await expect(
      guard.canActivate(createContext(request, handler)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

function createContext(
  request: object,
  handler: () => void = (): void => undefined,
): ExecutionContext {
  class TestController {}

  return {
    getArgByIndex: () => undefined,
    getArgs: () => [],
    getClass: () => TestController,
    getHandler: () => handler,
    getType: () => "http",
    switchToHttp: () => ({
      getNext: () => undefined,
      getRequest: () => request,
      getResponse: () => undefined,
    }),
    switchToRpc: () => ({
      getContext: () => undefined,
      getData: () => undefined,
    }),
    switchToWs: () => ({
      getClient: () => undefined,
      getData: () => undefined,
      getPattern: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

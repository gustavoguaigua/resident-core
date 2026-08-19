import { describe, expect, it } from "vitest";

import {
  AUTH_RUNTIME_STATUS,
  IDENTITY_RESOLVER_PORT,
  PERMISSION_EVALUATOR_PORT,
  TENANT_CONTEXT_RESOLVER_PORT,
} from "../src/index.js";

describe("auth contracts", () => {
  it("exposes only fail-closed Sprint 1 port contracts", () => {
    expect(AUTH_RUNTIME_STATUS).toBe("identity-membership-authorization");
    expect(IDENTITY_RESOLVER_PORT).toBeTypeOf("symbol");
    expect(TENANT_CONTEXT_RESOLVER_PORT).toBeTypeOf("symbol");
    expect(PERMISSION_EVALUATOR_PORT).toBeTypeOf("symbol");
  });
});

import { describe, expect, it } from "vitest";

import { OPENAPI_CLIENT_STATUS } from "../src/index.js";

describe("OpenAPI client scaffold", () => {
  it("does not expose a generated domain client during Sprint 0", () => {
    expect(OPENAPI_CLIENT_STATUS).toBe("tooling-only");
  });
});

import { describe, expect, it } from "vitest";

import { OPENAPI_CLIENT_STATUS } from "../src/index.js";

describe("OpenAPI client scaffold", () => {
  it("exposes the runtime contract without claiming a generated client", () => {
    expect(OPENAPI_CLIENT_STATUS).toBe("contract-only");
  });
});

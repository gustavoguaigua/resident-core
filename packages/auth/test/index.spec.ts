import { describe, expect, it } from "vitest";

import { AUTH_RUNTIME_STATUS } from "../src/index.js";

describe("auth scaffold", () => {
  it("keeps authentication and authorization runtime deferred", () => {
    expect(AUTH_RUNTIME_STATUS).toBe("deferred-to-sprint-1");
  });
});

import { describe, expect, it } from "vitest";

import { isRuntimeEnvironment } from "../src/index.js";

describe("config scaffold", () => {
  it("recognizes only the declared runtime environments", () => {
    expect(isRuntimeEnvironment("development")).toBe(true);
    expect(isRuntimeEnvironment("local-secret")).toBe(false);
  });
});

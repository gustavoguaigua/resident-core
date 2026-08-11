import { describe, expect, it } from "vitest";

import { smokeSuiteName } from "../src/index.js";

describe("testing scaffold", () => {
  it("creates deterministic smoke suite names", () => {
    expect(smokeSuiteName("workspace")).toBe("workspace smoke");
  });

  it("rejects an empty smoke suite scope", () => {
    expect(() => smokeSuiteName("  ")).toThrow(
      "Smoke suite scope must not be empty",
    );
  });
});

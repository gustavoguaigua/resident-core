import { describe, expect, it } from "vitest";

import { scaffoldMetadata } from "../lib/scaffold";

describe("resident-web scaffold", () => {
  it("does not enable runtime capabilities during Sprint 0", () => {
    expect(scaffoldMetadata).toEqual({
      phase: "Sprint 0",
      runtimeCapabilities: "none",
    });
  });
});

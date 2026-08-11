import { describe, expect, it } from "vitest";

import { assertNever } from "../src/index.js";

describe("shared scaffold", () => {
  it("fails explicitly for an unreachable value", () => {
    expect(() => assertNever("unexpected" as never)).toThrow(
      "Unexpected value: unexpected",
    );
  });
});

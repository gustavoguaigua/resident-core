import { describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

describe("AppModule scaffold", () => {
  it("exports the empty Sprint 0 application module", () => {
    expect(AppModule).toBeDefined();
  });
});

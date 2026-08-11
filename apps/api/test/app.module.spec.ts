import { describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

describe("AppModule", () => {
  it("exports the Sprint 1 platform application module", () => {
    expect(AppModule).toBeDefined();
  });
});

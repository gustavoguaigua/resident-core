import { afterAll, describe, expect, it, vi } from "vitest";

const previousDatabaseUrl = vi.hoisted(() => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL =
    "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core";
  return previous;
});

import { AppModule } from "../src/app.module.js";

describe("AppModule", () => {
  afterAll(() => {
    restoreDatabaseUrl(previousDatabaseUrl);
  });

  it("exports the Sprint 1 platform application module", () => {
    expect(AppModule).toBeDefined();
  });
});

function restoreDatabaseUrl(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = value;
  }
}

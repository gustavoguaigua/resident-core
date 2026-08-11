import type { LoggerService } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { SanitizedLogger } from "../src/platform/logging/sanitized-logger.service.js";

describe("SanitizedLogger", () => {
  it("redacts sensitive keys, bearer tokens and connection credentials", () => {
    const entries: unknown[] = [];
    const delegate: LoggerService = {
      error: (message: unknown) => entries.push(message),
      log: (message: unknown) => entries.push(message),
      warn: (message: unknown) => entries.push(message),
    };
    const logger = new SanitizedLogger(delegate);

    logger.error(
      {
        authorization: "Bearer resident-token-value",
        databaseUrl:
          "postgresql://resident:resident-password@database.internal/resident",
        nested: {
          safe: "visible",
          secretKey: "resident-secret-value",
        },
      },
      "password=resident-inline-password",
    );

    const serializedEntries = JSON.stringify(entries);

    expect(serializedEntries).toContain("visible");
    expect(serializedEntries).toContain("[REDACTED]");
    expect(serializedEntries).not.toContain("resident-token-value");
    expect(serializedEntries).not.toContain("resident-password");
    expect(serializedEntries).not.toContain("resident-secret-value");
    expect(serializedEntries).not.toContain("resident-inline-password");
  });

  it("removes credentials embedded in URLs inside error messages", () => {
    const entries: unknown[] = [];
    const delegate: LoggerService = {
      error: (message: unknown) => entries.push(message),
      log: (message: unknown) => entries.push(message),
      warn: (message: unknown) => entries.push(message),
    };
    const logger = new SanitizedLogger(delegate);

    logger.error(
      new Error(
        "Connection failed at postgresql://resident:resident-password@database.internal/resident",
      ),
    );

    const serializedEntries = JSON.stringify(entries);

    expect(serializedEntries).toContain("postgresql://[REDACTED]@");
    expect(serializedEntries).not.toContain("resident-password");
  });
});

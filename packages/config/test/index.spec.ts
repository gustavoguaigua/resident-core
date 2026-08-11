import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCAL_CORS_ORIGINS,
  isApplicationEnvironmentName,
  isRuntimeEnvironment,
  parseApplicationEnvironment,
} from "../src/index.js";

const SYNTHETIC_DATABASE_URL =
  "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core";

describe("application environment", () => {
  it("recognizes only the declared runtime environments", () => {
    expect(isRuntimeEnvironment("development")).toBe(true);
    expect(isRuntimeEnvironment("local-secret")).toBe(false);
  });

  it("recognizes the independent application environment axis", () => {
    expect(isApplicationEnvironmentName("local")).toBe(true);
    expect(isApplicationEnvironmentName("test")).toBe(false);
  });

  it("uses safe local defaults when required connectivity is configured", () => {
    expect(
      parseApplicationEnvironment({ DATABASE_URL: SYNTHETIC_DATABASE_URL }),
    ).toEqual({
      NODE_ENV: "development",
      APP_ENV: "local",
      API_PORT: 3000,
      DATABASE_URL: SYNTHETIC_DATABASE_URL,
      CORS_ALLOWED_ORIGINS: [...DEFAULT_LOCAL_CORS_ORIGINS],
      RATE_LIMIT_TTL_MS: 60_000,
      RATE_LIMIT_LIMIT: 100,
    });
  });

  it("parses, normalizes and deduplicates explicit origins", () => {
    const environment = parseApplicationEnvironment({
      NODE_ENV: "production",
      APP_ENV: "staging",
      API_PORT: "3100",
      CORS_ALLOWED_ORIGINS:
        "https://admin.example.test, https://admin.example.test",
      DATABASE_URL: SYNTHETIC_DATABASE_URL,
      RATE_LIMIT_TTL_MS: "10000",
      RATE_LIMIT_LIMIT: "25",
    });

    expect(environment).toEqual({
      NODE_ENV: "production",
      APP_ENV: "staging",
      API_PORT: 3100,
      DATABASE_URL: SYNTHETIC_DATABASE_URL,
      CORS_ALLOWED_ORIGINS: ["https://admin.example.test"],
      RATE_LIMIT_TTL_MS: 10_000,
      RATE_LIMIT_LIMIT: 25,
    });
  });

  it("requires an explicit CORS allowlist outside local", () => {
    expect(() =>
      parseApplicationEnvironment({
        APP_ENV: "production",
        DATABASE_URL: SYNTHETIC_DATABASE_URL,
      }),
    ).toThrow(
      "Invalid configuration for CORS_ALLOWED_ORIGINS: at least one explicit origin is required outside local",
    );
  });

  it("rejects origins containing credentials or paths", () => {
    expect(() =>
      parseApplicationEnvironment({
        CORS_ALLOWED_ORIGINS: "https://user:password@example.test/private",
        DATABASE_URL: SYNTHETIC_DATABASE_URL,
      }),
    ).toThrow(
      "Invalid configuration for CORS_ALLOWED_ORIGINS: every entry must be an absolute HTTP(S) origin without credentials or paths",
    );
  });

  it("does not include rejected configuration values in errors", () => {
    const invalidValue = "resident-secret-value";

    expect(() =>
      parseApplicationEnvironment({
        API_PORT: invalidValue,
        DATABASE_URL: SYNTHETIC_DATABASE_URL,
      }),
    ).toThrow("Invalid configuration for API_PORT");

    try {
      parseApplicationEnvironment({
        API_PORT: invalidValue,
        DATABASE_URL: SYNTHETIC_DATABASE_URL,
      });
    } catch (error) {
      expect(String(error)).not.toContain(invalidValue);
    }
  });

  it("requires a PostgreSQL URL without exposing rejected values", () => {
    expect(() => parseApplicationEnvironment({})).toThrow(
      "Invalid configuration for DATABASE_URL: a non-empty value is required",
    );

    const invalidValue = "mysql://resident:secret@example.test/resident";

    try {
      parseApplicationEnvironment({ DATABASE_URL: invalidValue });
    } catch (error) {
      expect(String(error)).toContain("Invalid configuration for DATABASE_URL");
      expect(String(error)).not.toContain(invalidValue);
      expect(String(error)).not.toContain("secret");
    }
  });
});

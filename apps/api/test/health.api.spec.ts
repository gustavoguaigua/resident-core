import "reflect-metadata";

import { type INestApplication, type LoggerService } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { ApplicationEnvironment } from "@resident/config";

import { AppModule } from "../src/app.module.js";
import { applicationConfig } from "../src/platform/config/application-config.js";
import { PrismaService } from "../src/platform/database/prisma.service.js";
import { configureApplication } from "../src/platform/http/application-bootstrap.js";
import { SanitizedLogger } from "../src/platform/logging/sanitized-logger.service.js";

const previousEnvironment = vi.hoisted(() => {
  const previous = {
    appEnvironment: process.env.APP_ENV,
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS,
    databaseUrl: process.env.DATABASE_URL,
  };

  process.env.APP_ENV = "local";
  process.env.CORS_ALLOWED_ORIGINS =
    "http://localhost:3001,http://localhost:3002";
  process.env.DATABASE_URL =
    "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core";

  return previous;
});

const availability = vi.fn<() => Promise<boolean>>();

const silentLogger = new SanitizedLogger({
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
} satisfies LoggerService);

describe("health API contract", () => {
  let localApplication: INestApplication | undefined;
  let protectedApplication: INestApplication | undefined;
  let localBaseUrl: string;
  let protectedBaseUrl: string;

  beforeAll(async () => {
    availability.mockResolvedValue(true);

    const localModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ isAvailable: availability })
      .compile();

    localApplication = localModule.createNestApplication({
      logger: silentLogger,
    });
    configureApplication(localApplication, silentLogger);
    await localApplication.listen(0, "127.0.0.1");
    localBaseUrl = await localApplication.getUrl();

    const nonLocalEnvironment: ApplicationEnvironment = {
      NODE_ENV: "production",
      APP_ENV: "production",
      API_PORT: 3000,
      DATABASE_URL:
        "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core",
      CORS_ALLOWED_ORIGINS: ["https://admin.example.test"],
      RATE_LIMIT_TTL_MS: 60_000,
      RATE_LIMIT_LIMIT: 100,
    };
    const protectedModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(applicationConfig.KEY)
      .useValue(nonLocalEnvironment)
      .overrideProvider(PrismaService)
      .useValue({ isAvailable: availability })
      .compile();

    protectedApplication = protectedModule.createNestApplication({
      logger: silentLogger,
    });
    configureApplication(protectedApplication, silentLogger);
    await protectedApplication.listen(0, "127.0.0.1");
    protectedBaseUrl = await protectedApplication.getUrl();
  });

  afterAll(async () => {
    await Promise.all([
      localApplication?.close(),
      protectedApplication?.close(),
    ]);

    restoreEnvironment("APP_ENV", previousEnvironment.appEnvironment);
    restoreEnvironment(
      "CORS_ALLOWED_ORIGINS",
      previousEnvironment.corsAllowedOrigins,
    );
    restoreEnvironment("DATABASE_URL", previousEnvironment.databaseUrl);
  });

  it("returns public liveness without consulting PostgreSQL", async () => {
    availability.mockClear();

    const response = await fetch(`${localBaseUrl}/api/v1/health`);
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "ok",
      service: "resident-api",
      timestamp: expect.any(String),
    });
    expect(Object.keys(body).sort()).toEqual([
      "service",
      "status",
      "timestamp",
    ]);
    expect(availability).not.toHaveBeenCalled();
  });

  it("returns local readiness as a flat 200 health payload", async () => {
    availability.mockResolvedValueOnce(true);

    const response = await fetch(`${localBaseUrl}/api/v1/health/details`);
    const body = (await response.json()) as {
      status: string;
      checks: Record<string, { status: string }>;
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks).toEqual({
      postgres: { status: "ok" },
      redis: { status: "notConfigured" },
      storage: { status: "notConfigured" },
      keycloak: { status: "notConfigured" },
    });
    expect("data" in body).toBe(false);
  });

  it("returns a flat 503 payload when PostgreSQL is unavailable", async () => {
    availability.mockResolvedValueOnce(false);

    const response = await fetch(`${localBaseUrl}/api/v1/health/details`);
    const body = (await response.json()) as {
      status: string;
      checks: Record<string, { status: string }>;
    };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.postgres).toEqual({ status: "unavailable" });
    expect(JSON.stringify(body)).not.toContain("synthetic-test-only");
  });

  it("fails closed outside local before querying PostgreSQL", async () => {
    availability.mockClear();

    const response = await fetch(`${protectedBaseUrl}/api/v1/health/details`);
    const body = (await response.json()) as {
      error: { code: string; traceId: string };
    };

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.traceId).toBe(response.headers.get("x-trace-id"));
    expect(availability).not.toHaveBeenCalled();
  });
});

function restoreEnvironment(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

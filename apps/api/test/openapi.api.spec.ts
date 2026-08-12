import "reflect-metadata";

import { type INestApplication, type LoggerService } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { ApplicationEnvironment } from "@resident/config";

import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/platform/database/prisma.service.js";
import { configureApplication } from "../src/platform/http/application-bootstrap.js";
import { SanitizedLogger } from "../src/platform/logging/sanitized-logger.service.js";
import {
  configureOpenApi,
  shouldExposeOpenApi,
} from "../src/platform/openapi/openapi-document.js";

const previousEnvironment = vi.hoisted(() => {
  const previous = {
    appEnvironment: process.env.APP_ENV,
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS,
    databaseUrl: process.env.DATABASE_URL,
  };

  process.env.APP_ENV = "local";
  process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3001";
  process.env.DATABASE_URL =
    "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core";

  return previous;
});

const localEnvironment: ApplicationEnvironment = {
  NODE_ENV: "test",
  APP_ENV: "local",
  API_PORT: 3000,
  DATABASE_URL:
    "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core",
  CORS_ALLOWED_ORIGINS: ["http://localhost:3001"],
  RATE_LIMIT_TTL_MS: 60_000,
  RATE_LIMIT_LIMIT: 100,
};

const productionEnvironment: ApplicationEnvironment = {
  ...localEnvironment,
  NODE_ENV: "production",
  APP_ENV: "production",
  CORS_ALLOWED_ORIGINS: ["https://admin.example.test"],
};

const silentLogger = new SanitizedLogger({
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
} satisfies LoggerService);

describe("OpenAPI runtime contract", () => {
  let localApplication: INestApplication | undefined;
  let productionApplication: INestApplication | undefined;
  let localBaseUrl: string;
  let productionBaseUrl: string;

  beforeAll(async () => {
    localApplication = await createApplication();
    configureOpenApi(localApplication, localEnvironment);
    await localApplication.listen(0, "127.0.0.1");
    localBaseUrl = await localApplication.getUrl();

    productionApplication = await createApplication();
    configureOpenApi(productionApplication, productionEnvironment);
    await productionApplication.listen(0, "127.0.0.1");
    productionBaseUrl = await productionApplication.getUrl();
  });

  afterAll(async () => {
    await Promise.all([
      localApplication?.close(),
      productionApplication?.close(),
    ]);

    restoreEnvironment("APP_ENV", previousEnvironment.appEnvironment);
    restoreEnvironment(
      "CORS_ALLOWED_ORIGINS",
      previousEnvironment.corsAllowedOrigins,
    );
    restoreEnvironment("DATABASE_URL", previousEnvironment.databaseUrl);
  });

  it("publishes the UI and JSON document under the API prefix in local", async () => {
    const [uiResponse, documentResponse] = await Promise.all([
      fetch(`${localBaseUrl}/api/v1/docs`),
      fetch(`${localBaseUrl}/api/v1/docs-json`),
    ]);
    const document = (await documentResponse.json()) as {
      components: { securitySchemes: Record<string, unknown> };
      paths: Record<string, Record<string, unknown>>;
    };

    expect(uiResponse.status).toBe(200);
    expect(uiResponse.headers.get("content-type")).toContain("text/html");
    expect(documentResponse.status).toBe(200);
    expect(document.components.securitySchemes).toHaveProperty("bearerAuth");
    expect(document.paths).toHaveProperty("/api/v1/health");
    expect(document.paths).toHaveProperty("/api/v1/health/details");
    expect(document.paths).not.toHaveProperty("/api/v1/docs");
    expect(document.paths).not.toHaveProperty("/api/v1/docs-json");
  });

  it("includes the required Health extensions and security metadata", async () => {
    const response = await fetch(`${localBaseUrl}/api/v1/docs-json`);
    const document = (await response.json()) as {
      paths: Record<string, { get: Record<string, unknown> }>;
    };
    const liveness = document.paths["/api/v1/health"]?.get;
    const readiness = document.paths["/api/v1/health/details"]?.get;

    expect(liveness).toMatchObject({
      "x-auth-required": false,
      "x-health-endpoint": true,
      "x-platform-only": false,
      "x-public": true,
      "x-response-envelope": false,
      "x-tenant-context-required": false,
    });
    expect(readiness).toMatchObject({
      security: [{ bearerAuth: [] }],
      "x-auth-required": true,
      "x-health-endpoint": true,
      "x-platform-only": true,
      "x-public": false,
      "x-required-permission": "platform.health.read",
      "x-response-envelope": false,
      "x-tenant-context-required": false,
    });
  });

  it("does not mount OpenAPI routes in production", async () => {
    const [uiResponse, documentResponse] = await Promise.all([
      fetch(`${productionBaseUrl}/api/v1/docs`),
      fetch(`${productionBaseUrl}/api/v1/docs-json`),
    ]);

    expect(uiResponse.status).toBe(404);
    expect(documentResponse.status).toBe(404);
  });

  it("enables documentation only in local and development", () => {
    expect(shouldExposeOpenApi({ APP_ENV: "local" })).toBe(true);
    expect(shouldExposeOpenApi({ APP_ENV: "development" })).toBe(true);
    expect(shouldExposeOpenApi({ APP_ENV: "staging" })).toBe(false);
    expect(shouldExposeOpenApi({ APP_ENV: "production" })).toBe(false);
  });
});

async function createApplication(): Promise<INestApplication> {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ isAvailable: vi.fn().mockResolvedValue(true) })
    .compile();
  const application = module.createNestApplication({ logger: silentLogger });
  configureApplication(application, silentLogger);
  return application;
}

function restoreEnvironment(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

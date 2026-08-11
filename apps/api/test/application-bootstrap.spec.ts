import "reflect-metadata";

import {
  Controller,
  Get,
  type INestApplication,
  type LoggerService,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SkipThrottle } from "@nestjs/throttler";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { AppModule } from "../src/app.module.js";
import { configureApplication } from "../src/platform/http/application-bootstrap.js";
import { SanitizedLogger } from "../src/platform/logging/sanitized-logger.service.js";

const previousEnvironment = vi.hoisted(() => {
  const previous = {
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS,
    rateLimit: process.env.RATE_LIMIT_LIMIT,
  };

  process.env.CORS_ALLOWED_ORIGINS =
    "http://localhost:3001,http://localhost:3002";
  process.env.RATE_LIMIT_LIMIT = "1";

  return previous;
});

@Controller("platform-test")
class PlatformTestController {
  @Get("failure")
  @SkipThrottle()
  public failure(): never {
    throw new Error(
      "DATABASE_URL=postgresql://resident:resident-password@database.internal/resident",
    );
  }

  @Get("cors")
  @SkipThrottle()
  public cors(): object {
    return { data: { status: "ok" }, meta: null };
  }

  @Get("limited")
  public limited(): object {
    return { data: { status: "ok" }, meta: null };
  }
}

describe("secure application bootstrap", () => {
  let application: INestApplication | undefined;
  let baseUrl: string;
  const logEntries: unknown[] = [];

  beforeAll(async () => {
    const delegate: LoggerService = {
      error: (message: unknown) => logEntries.push(message),
      log: (message: unknown) => logEntries.push(message),
      warn: (message: unknown) => logEntries.push(message),
    };
    const logger = new SanitizedLogger(delegate);
    const moduleReference = await Test.createTestingModule({
      controllers: [PlatformTestController],
      imports: [AppModule],
    }).compile();

    application = moduleReference.createNestApplication({ logger });
    configureApplication(application, logger);
    await application.listen(0, "127.0.0.1");
    baseUrl = await application.getUrl();
  });

  afterAll(async () => {
    await application?.close();

    if (previousEnvironment.rateLimit === undefined) {
      delete process.env.RATE_LIMIT_LIMIT;
    } else {
      process.env.RATE_LIMIT_LIMIT = previousEnvironment.rateLimit;
    }

    if (previousEnvironment.corsAllowedOrigins === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
    } else {
      process.env.CORS_ALLOWED_ORIGINS = previousEnvironment.corsAllowedOrigins;
    }
  });

  it("returns the secure error envelope with a server-generated traceId", async () => {
    const response = await fetch(`${baseUrl}/api/v1/platform-test/failure`, {
      headers: { "x-trace-id": "client-controlled-trace" },
    });
    const body = (await response.json()) as {
      error: { code: string; message: string; details: null; traceId: string };
    };

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: null,
        message: "An internal error occurred",
        traceId: expect.any(String),
      },
    });
    expect(body.error.traceId).toBe(response.headers.get("x-trace-id"));
    expect(body.error.traceId).not.toBe("client-controlled-trace");
    expect(JSON.stringify(body)).not.toContain("resident-password");
    expect(JSON.stringify(logEntries)).not.toContain("resident-password");
  });

  it("normalizes framework 404 responses into the secure envelope", async () => {
    const response = await fetch(`${baseUrl}/api/v1/missing-resource`);
    const body = (await response.json()) as {
      error: { code: string; message: string; traceId: string };
    };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("Resource not found");
    expect(body.error.traceId).toBe(response.headers.get("x-trace-id"));
  });

  it("allows only configured CORS origins and applies security headers", async () => {
    const allowedResponse = await fetch(
      `${baseUrl}/api/v1/platform-test/cors`,
      {
        headers: { origin: "http://localhost:3001" },
      },
    );
    const deniedResponse = await fetch(`${baseUrl}/api/v1/platform-test/cors`, {
      headers: { origin: "https://untrusted.example.test" },
    });

    expect(allowedResponse.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3001",
    );
    expect(allowedResponse.headers.get("x-content-type-options")).toBe(
      "nosniff",
    );
    expect(
      deniedResponse.headers.get("access-control-allow-origin"),
    ).toBeNull();
  });

  it("enforces the configured rate limit and preserves the error envelope", async () => {
    const firstResponse = await fetch(
      `${baseUrl}/api/v1/platform-test/limited`,
    );
    const secondResponse = await fetch(
      `${baseUrl}/api/v1/platform-test/limited`,
    );
    const secondBody = (await secondResponse.json()) as {
      error: { code: string; message: string; traceId: string };
    };

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(429);
    expect(secondBody.error.code).toBe("TOO_MANY_REQUESTS");
    expect(secondBody.error.message).toBe("Too many requests");
    expect(secondBody.error.traceId).toBe(
      secondResponse.headers.get("x-trace-id"),
    );
  });
});

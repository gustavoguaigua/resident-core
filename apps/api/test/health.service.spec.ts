import { describe, expect, it, vi } from "vitest";

import { HealthService } from "../src/modules/platform/health/health.service.js";
import type { PrismaService } from "../src/platform/database/prisma.service.js";

describe("HealthService", () => {
  it("reports liveness without querying a dependency", () => {
    const isAvailable = vi.fn();
    const service = new HealthService({
      isAvailable,
    } as unknown as PrismaService);

    const result = service.getLiveness();

    expect(result).toEqual({
      status: "ok",
      service: "resident-api",
      timestamp: expect.any(String),
    });
    expect(isAvailable).not.toHaveBeenCalled();
  });

  it("reports required and inactive dependencies without internal details", async () => {
    const service = new HealthService({
      isAvailable: vi.fn().mockResolvedValue(true),
    } as unknown as PrismaService);

    await expect(service.getReadiness()).resolves.toEqual({
      status: "ok",
      service: "resident-api",
      checks: {
        postgres: { status: "ok" },
        redis: { status: "notConfigured" },
        storage: { status: "notConfigured" },
        keycloak: { status: "notConfigured" },
      },
      timestamp: expect.any(String),
    });
  });

  it("degrades readiness when PostgreSQL is unavailable", async () => {
    const service = new HealthService({
      isAvailable: vi.fn().mockResolvedValue(false),
    } as unknown as PrismaService);

    const result = await service.getReadiness();

    expect(result.status).toBe("degraded");
    expect(result.checks.postgres).toEqual({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("postgresql://");
  });
});

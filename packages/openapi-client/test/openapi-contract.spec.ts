import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

interface OpenApiOperation {
  readonly responses: Record<string, unknown>;
  readonly security?: readonly Record<string, readonly string[]>[];
  readonly [extension: `x-${string}`]: unknown;
}

interface OpenApiContract {
  readonly openapi: string;
  readonly components: {
    readonly securitySchemes: Record<string, unknown>;
  };
  readonly paths: Record<string, { readonly get?: OpenApiOperation }>;
}

const contract = JSON.parse(
  readFileSync(
    new URL("../openapi/resident-core.v1.json", import.meta.url),
    "utf8",
  ),
) as OpenApiContract;

describe("canonical OpenAPI contract", () => {
  it("defines bearer authentication and only the current Health operations", () => {
    expect(contract.openapi).toMatch(/^3\./u);
    expect(contract.components.securitySchemes).toHaveProperty("bearerAuth");
    expect(Object.keys(contract.paths).sort()).toEqual([
      "/api/v1/health",
      "/api/v1/health/details",
    ]);
  });

  it("documents the flat public liveness contract", () => {
    expect(contract.paths["/api/v1/health"]?.get).toMatchObject({
      responses: { "200": expect.any(Object) },
      security: [],
      "x-auth-required": false,
      "x-health-endpoint": true,
      "x-platform-only": false,
      "x-public": true,
      "x-response-envelope": false,
      "x-tenant-context-required": false,
    });
  });

  it("documents protected readiness with both 200 and 503 flat payloads", () => {
    expect(contract.paths["/api/v1/health/details"]?.get).toMatchObject({
      responses: {
        "200": expect.any(Object),
        "403": expect.any(Object),
        "500": expect.any(Object),
        "503": expect.any(Object),
      },
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

  it("does not expose internal storage identifiers", () => {
    expect(JSON.stringify(contract)).not.toContain("storageKey");
  });
});

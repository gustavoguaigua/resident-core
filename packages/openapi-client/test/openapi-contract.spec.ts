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
  readonly paths: Record<
    string,
    {
      readonly delete?: OpenApiOperation;
      readonly get?: OpenApiOperation;
      readonly patch?: OpenApiOperation;
      readonly post?: OpenApiOperation;
    }
  >;
}

const contract = JSON.parse(
  readFileSync(
    new URL("../openapi/resident-core.v1.json", import.meta.url),
    "utf8",
  ),
) as OpenApiContract;

describe("canonical OpenAPI contract", () => {
  it("defines bearer authentication and only the operations active through Phase 8", () => {
    expect(contract.openapi).toMatch(/^3\./u);
    expect(contract.components.securitySchemes).toHaveProperty("bearerAuth");
    expect(Object.keys(contract.paths).sort()).toEqual([
      "/api/v1/health",
      "/api/v1/health/details",
      "/api/v1/invitations/{token}",
      "/api/v1/invitations/{token}/accept",
      "/api/v1/platform/setting-definitions",
      "/api/v1/platform/setting-definitions/{definitionId}",
      "/api/v1/platform/tenants",
      "/api/v1/platform/tenants/{tenantId}/activate",
      "/api/v1/platform/tenants/{tenantId}/archive",
      "/api/v1/platform/tenants/{tenantId}/reactivate",
      "/api/v1/platform/tenants/{tenantId}/suspend",
      "/api/v1/tenant/invitations",
      "/api/v1/tenant/invitations/{invitationId}/revoke",
      "/api/v1/tenant/memberships/{membershipId}/revoke",
      "/api/v1/tenant/memberships/{membershipId}/roles",
      "/api/v1/tenant/memberships/{membershipId}/roles/{roleId}",
      "/api/v1/tenant/settings",
      "/api/v1/tenant/settings/{key}",
    ]);
  });

  it.each([
    ["get", "/api/v1/tenant/settings", "tenantSettings.read", undefined],
    [
      "get",
      "/api/v1/tenant/settings/{key}",
      "tenantSettings.read",
      undefined,
    ],
    [
      "patch",
      "/api/v1/tenant/settings/{key}",
      "tenantSettings.update",
      "tenantSetting.updated",
    ],
  ] as const)(
    "documents the Phase 8 tenant setting operation %s %s",
    (method, path, permission, auditEvent) => {
      expect(contract.paths[path]?.[method]).toMatchObject({
        security: [{ bearerAuth: [] }],
        ...(auditEvent === undefined ? {} : { "x-audit-event": auditEvent }),
        "x-auth-required": true,
        "x-platform-only": false,
        "x-public": false,
        "x-required-permission": permission,
        "x-response-envelope": true,
        "x-tenant-context-required": true,
      });
    },
  );

  it.each([
    ["/api/v1/platform/tenants", "platform.tenants.create", "tenant.created"],
    [
      "/api/v1/platform/tenants/{tenantId}/activate",
      "platform.tenants.activate",
      "tenant.activated",
    ],
    [
      "/api/v1/platform/tenants/{tenantId}/archive",
      "platform.tenants.archive",
      "tenant.archived",
    ],
    [
      "/api/v1/platform/tenants/{tenantId}/reactivate",
      "platform.tenants.reactivate",
      "tenant.reactivated",
    ],
    [
      "/api/v1/platform/tenants/{tenantId}/suspend",
      "platform.tenants.suspend",
      "tenant.suspended",
    ],
  ] as const)(
    "documents the protected tenant operation %s",
    (path, permission, auditEvent) => {
      expect(contract.paths[path]?.post).toMatchObject({
        security: [{ bearerAuth: [] }],
        "x-audit-event": auditEvent,
        "x-auth-required": true,
        "x-platform-only": true,
        "x-public": false,
        "x-required-permission": permission,
        "x-response-envelope": true,
        "x-tenant-context-required": false,
      });
    },
  );

  it.each([
    [
      "post",
      "/api/v1/tenant/invitations",
      "users.invite",
      "invitation.created",
    ],
    [
      "post",
      "/api/v1/tenant/invitations/{invitationId}/revoke",
      "users.invite",
      "invitation.revoked",
    ],
    [
      "post",
      "/api/v1/tenant/memberships/{membershipId}/roles",
      "users.roles.assign",
      "membership.roleAssigned",
    ],
    [
      "delete",
      "/api/v1/tenant/memberships/{membershipId}/roles/{roleId}",
      "users.roles.remove",
      "membership.roleRemoved",
    ],
    [
      "post",
      "/api/v1/tenant/memberships/{membershipId}/revoke",
      "users.membership.revoke",
      "membership.revoked",
    ],
  ] as const)(
    "documents tenant-scoped access for %s %s",
    (method, path, permission, auditEvent) => {
      expect(contract.paths[path]?.[method]).toMatchObject({
        security: [{ bearerAuth: [] }],
        "x-audit-event": auditEvent,
        "x-auth-required": true,
        "x-platform-only": false,
        "x-public": false,
        "x-required-permission": permission,
        "x-response-envelope": true,
        "x-tenant-context-required": true,
      });
    },
  );

  it("documents invitation lookup as token-public and acceptance as authenticated", () => {
    expect(contract.paths["/api/v1/invitations/{token}"]?.get).toMatchObject({
      "x-auth-required": false,
      "x-platform-only": false,
      "x-public": true,
      "x-public-token-endpoint": true,
      "x-response-envelope": true,
      "x-tenant-context-required": false,
    });
    expect(
      contract.paths["/api/v1/invitations/{token}/accept"]?.post,
    ).toMatchObject({
      security: [{ bearerAuth: [] }],
      "x-audit-event": "invitation.accepted",
      "x-auth-required": true,
      "x-platform-only": false,
      "x-public": false,
      "x-public-token-endpoint": true,
      "x-response-envelope": true,
      "x-tenant-context-required": false,
    });
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

import "reflect-metadata";

import { type INestApplication, type LoggerService } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

  it("publishes exactly the 102 approved Sprint 3 operations", async () => {
    const response = await fetch(`${localBaseUrl}/api/v1/docs-json`);
    const document = (await response.json()) as {
      paths: Record<string, Record<string, Record<string, unknown>>>;
    };
    const expected = sprint3Operations();
    const operationIds: string[] = [];

    expect(expected).toHaveLength(102);
    for (const expectedOperation of expected) {
      const [method, path] = expectedOperation.split(" ", 2) as [
        string,
        string,
      ];
      const operation = document.paths[path]?.[method.toLowerCase()];
      expect(operation, expectedOperation).toBeDefined();
      expect(operation?.security).toEqual([{ bearerAuth: [] }]);
      expect(operation?.["x-auth-required"]).toBe(true);
      expect(operation?.["x-tenant-context-required"]).toBe(true);
      expect(operation?.["x-required-permission"]).toMatch(
        /^[a-zA-Z]+\.[a-zA-Z.]+$/u,
      );
      expect(operation?.tags).toEqual([expect.any(String)]);
      expect(operation?.operationId).toEqual(expect.any(String));
      operationIds.push(operation?.operationId as string);

      const parameters = (operation?.parameters ?? []) as Array<{
        name: string;
        required: boolean;
      }>;
      expect(parameters).toContainEqual(
        expect.objectContaining({ name: "X-Tenant-Id", required: true }),
      );
      if (method === "GET") {
        expect(parameters.some(({ name }) => name === "Idempotency-Key")).toBe(
          false,
        );
        expect(operation?.["x-idempotency-required"]).toBe(false);
      } else {
        expect(parameters).toContainEqual(
          expect.objectContaining({ name: "Idempotency-Key", required: true }),
        );
        expect(operation?.["x-idempotency-required"]).toBe(true);
      }
    }
    expect(new Set(operationIds).size).toBe(operationIds.length);
  });

  it("publishes the authenticated discovery contract with explicit success schemas", async () => {
    const response = await fetch(`${localBaseUrl}/api/v1/docs-json`);
    const document = (await response.json()) as {
      paths: Record<string, { get: Record<string, unknown> }>;
    };
    const profile = document.paths["/api/v1/me"]?.get;
    const tenants = document.paths["/api/v1/me/tenants"]?.get;
    const permissions = document.paths["/api/v1/me/permissions"]?.get;

    for (const operation of [profile, tenants]) {
      expect(operation).toMatchObject({
        security: [{ bearerAuth: [] }],
        "x-auth-required": true,
        "x-idempotency-required": false,
        "x-own-resource": true,
        "x-platform-only": false,
        "x-public": false,
        "x-response-envelope": true,
        "x-tenant-context-required": false,
      });
      expect(operation).not.toHaveProperty("x-required-permission");
      expect(operation).not.toHaveProperty("x-tenant-scope");
      expect(operation?.responses).toHaveProperty(
        "200.content.application/json.schema.$ref",
      );
    }
    expect(permissions).toMatchObject({
      security: [{ bearerAuth: [] }],
      "x-auth-required": true,
      "x-idempotency-required": false,
      "x-own-resource": true,
      "x-platform-only": false,
      "x-public": false,
      "x-response-envelope": true,
      "x-tenant-context-required": true,
      "x-tenant-scope": "tenant",
    });
    expect(permissions).not.toHaveProperty("x-required-permission");
    expect(permissions?.parameters).toContainEqual(
      expect.objectContaining({ name: "X-Tenant-Id", required: true }),
    );
    expect(permissions?.responses).toHaveProperty(
      "200.content.application/json.schema.$ref",
    );
  });

  it("keeps the 76 Sprint 4 client operations aligned with runtime DTOs and envelopes", async () => {
    const response = await fetch(`${localBaseUrl}/api/v1/docs-json`);
    const document = (await response.json()) as {
      components: { schemas: Record<string, Record<string, unknown>> };
      paths: Record<string, Record<string, Record<string, unknown>>>;
    };
    const jsonReads = sprint4JsonReadParity();
    const mutations = sprint4MutationParity();

    for (const [path, resource, meta] of jsonReads) {
      expectJsonEnvelope(document.paths[path]?.get, "200", resource, meta);
    }

    for (const [method, path, status, resource, request] of mutations) {
      const operation = document.paths[path]?.[method];
      expectJsonEnvelope(operation, status, resource, metaForRuntime(path));
      expect(operation?.responses).not.toHaveProperty("204");
      if (request === null) {
        expect(operation).not.toHaveProperty("requestBody");
      } else {
        expect(operation).toHaveProperty(
          "requestBody.content.application/json.schema.$ref",
          `#/components/schemas/${request}`,
        );
      }
    }

    const receiptDownload =
      document.paths["/api/v1/tenant/payment-receipts/{receiptId}/download"]
        ?.get;
    expect(receiptDownload?.responses).toHaveProperty("200.content", {
      "application/pdf": {
        schema: { format: "binary", type: "string" },
      },
      "image/jpeg": { schema: { format: "binary", type: "string" } },
      "image/png": { schema: { format: "binary", type: "string" } },
    });

    expect(document.components.schemas.ChargeBatch).toMatchObject({
      properties: {
        errorSummary: {
          properties: {
            codes: {
              items: {
                properties: {
                  code: { type: "string" },
                  count: { minimum: 1, type: "integer" },
                },
                required: ["code", "count"],
              },
              type: "array",
            },
          },
          required: ["codes"],
          type: "object",
        },
      },
    });
    for (const [schema, required] of [
      ["TypedTraceMeta", ["traceId"]],
      ["TypedRequestMeta", ["requestId"]],
      [
        "TypedResidentPageMeta",
        ["page", "pageSize", "total", "totalPages", "traceId"],
      ],
      ["TypedTracePageMeta", ["page", "pageSize", "total", "traceId"]],
      ["TypedRequestPageMeta", ["page", "pageSize", "total", "requestId"]],
    ] as const) {
      expect(document.components.schemas[schema]?.required).toEqual(required);
    }

    for (const [schema, required] of Object.entries(
      sprint4RequestRequiredFields(),
    )) {
      expect(document.components.schemas[schema]).toMatchObject({
        additionalProperties: false,
        required,
        type: "object",
      });
    }

    for (const [schema, fields] of Object.entries({
      Charge: ["originalAmount", "effectiveAmount"],
      ChargeConcept: ["defaultAmount"],
      FeeSchedule: ["amount"],
      FinancialMovement: ["debit", "credit", "balance"],
      Payment: ["amount", "allocatedAmount", "unallocatedAmount"],
      PaymentAllocation: ["amount"],
      UnitBalance: [
        "outstandingBalance",
        "overdueBalance",
        "notDueBalance",
        "creditBalance",
        "unallocatedPaymentBalance",
      ],
    })) {
      for (const field of fields) {
        expect(document.components.schemas[schema]).toHaveProperty(
          `properties.${field}.type`,
          "string",
        );
      }
    }

    expect(jsonReads.length + mutations.length + 3 + 1).toBe(76);
  });

  it("keeps forbidden document and future-domain surfaces out of OpenAPI", async () => {
    const response = await fetch(`${localBaseUrl}/api/v1/docs-json`);
    const document = await response.json();
    const serialized = JSON.stringify(document);

    for (const forbidden of [
      "/api/v1/tenant/documents",
      "/api/v1/tenant/vehicles",
      "/api/v1/tenant/pets",
      "/api/v1/tenant/emergency-contacts",
      "storageKey",
      "bucket",
      "providerCredential",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
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

function sprint3Operations(): string[] {
  const boundary = readFileSync(
    resolve(
      import.meta.dirname,
      "../../../docs/changes/GAP-S3-006-API-IDEMPOTENCY-BOUNDARY-2026-08-29.md",
    ),
    "utf8",
  );
  const section = boundary.match(
    /## 4\. Allowlist por fase(?<body>[\s\S]*?)## 5\./u,
  )?.groups?.body;
  return [
    ...(section ?? "").matchAll(/^(GET|POST|PATCH)\s+(\/api\/v1\/\S+)$/gmu),
  ].map(([, method, path]) => `${method} ${path}`);
}

type JsonOperation = Record<string, unknown> | undefined;
type JsonReadParity = readonly [path: string, resource: string, meta: string];
type MutationParity = readonly [
  method: "patch" | "post",
  path: string,
  status: "200" | "201",
  resource: string,
  request: string | null,
];

function expectJsonEnvelope(
  operation: JsonOperation,
  status: string,
  resource: string,
  meta: string,
) {
  if (resource.endsWith("[]")) {
    expect(operation).toHaveProperty(
      `responses.${status}.content.application/json.schema.properties.data.items.$ref`,
      `#/components/schemas/${resource.slice(0, -2)}`,
    );
  } else {
    expect(operation).toHaveProperty(
      `responses.${status}.content.application/json.schema.properties.data.$ref`,
      `#/components/schemas/${resource}`,
    );
  }
  expect(operation).toHaveProperty(
    `responses.${status}.content.application/json.schema.properties.meta.$ref`,
    `#/components/schemas/${meta}`,
  );
}

function sprint4JsonReadParity(): JsonReadParity[] {
  const residents = [
    ["property-units", "propertyUnitId", "PropertyUnit"],
    ["persons", "personId", "Person"],
    ["legal-entities", "legalEntityId", "LegalEntity"],
    ["property-ownerships", "ownershipId", "PropertyOwnership"],
    ["residencies", "residencyId", "Residency"],
    ["leases", "leaseId", "Lease"],
  ] as const;
  const dues = [
    ["charge-concepts", "chargeConceptId", "ChargeConcept"],
    ["fee-schedules", "feeScheduleId", "FeeSchedule"],
    ["unit-fees", "unitFeeAssignmentId", "UnitFeeAssignment"],
    ["billing-periods", "billingPeriodId", "BillingPeriod"],
    ["charge-batches", "chargeBatchId", "ChargeBatch"],
    ["charges", "chargeId", "Charge"],
  ] as const;
  return [
    ...residents.flatMap(
      ([path, id, resource]) =>
        [
          [`/api/v1/tenant/${path}`, `${resource}[]`, "TypedResidentPageMeta"],
          [`/api/v1/tenant/${path}/{${id}}`, resource, "TypedTraceMeta"],
        ] as JsonReadParity[],
    ),
    ["/api/v1/me/person", "Person", "TypedTraceMeta"],
    ["/api/v1/me/property-units", "PropertyUnit[]", "TypedTraceMeta"],
    ["/api/v1/me/residencies", "Residency[]", "TypedTraceMeta"],
    ...dues.flatMap(
      ([path, id, resource]) =>
        [
          [`/api/v1/tenant/${path}`, `${resource}[]`, "TypedTracePageMeta"],
          [`/api/v1/tenant/${path}/{${id}}`, resource, "TypedTraceMeta"],
        ] as JsonReadParity[],
    ),
    ["/api/v1/tenant/payments", "Payment[]", "TypedRequestPageMeta"],
    ["/api/v1/tenant/payments/{paymentId}", "Payment", "TypedRequestMeta"],
    [
      "/api/v1/tenant/payments/{paymentId}/receipts",
      "PaymentReceipt[]",
      "TypedRequestMeta",
    ],
    [
      "/api/v1/tenant/payment-receipts/{receiptId}",
      "PaymentReceipt",
      "TypedRequestMeta",
    ],
    [
      "/api/v1/tenant/payments/{paymentId}/allocations",
      "PaymentAllocation[]",
      "TypedRequestMeta",
    ],
    [
      "/api/v1/tenant/payment-allocations/{allocationId}",
      "PaymentAllocation",
      "TypedRequestMeta",
    ],
    ["/api/v1/tenant/balances", "UnitBalance[]", "TypedRequestPageMeta"],
    [
      "/api/v1/tenant/property-units/{propertyUnitId}/balance",
      "UnitBalance",
      "TypedRequestMeta",
    ],
    [
      "/api/v1/tenant/property-units/{propertyUnitId}/financial-movements",
      "FinancialMovement[]",
      "TypedRequestMeta",
    ],
    [
      "/api/v1/tenant/account-statements",
      "AccountStatement[]",
      "TypedRequestPageMeta",
    ],
    [
      "/api/v1/tenant/account-statements/{statementId}",
      "AccountStatement",
      "TypedRequestMeta",
    ],
  ];
}

function sprint4MutationParity(): MutationParity[] {
  return [
    [
      "post",
      "/api/v1/tenant/property-units",
      "201",
      "PropertyUnit",
      "PropertyUnitCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/property-units/{propertyUnitId}",
      "200",
      "PropertyUnit",
      "PropertyUnitUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/property-units/{propertyUnitId}/archive",
      "200",
      "PropertyUnit",
      "ArchiveRequest",
    ],
    ["post", "/api/v1/tenant/persons", "201", "Person", "PersonCreateRequest"],
    [
      "patch",
      "/api/v1/tenant/persons/{personId}",
      "200",
      "Person",
      "PersonUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/persons/{personId}/archive",
      "200",
      "Person",
      "ArchiveRequest",
    ],
    [
      "post",
      "/api/v1/tenant/persons/{personId}/link-user",
      "200",
      "PersonIdentityLinkAcknowledgement",
      "LinkUserRequest",
    ],
    [
      "post",
      "/api/v1/tenant/legal-entities",
      "201",
      "LegalEntity",
      "LegalEntityCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/legal-entities/{legalEntityId}",
      "200",
      "LegalEntity",
      "LegalEntityUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/legal-entities/{legalEntityId}/archive",
      "200",
      "LegalEntity",
      "ArchiveRequest",
    ],
    [
      "post",
      "/api/v1/tenant/property-ownerships",
      "201",
      "PropertyOwnership",
      "OwnershipCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/property-ownerships/{ownershipId}",
      "200",
      "PropertyOwnership",
      "OwnershipUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/property-ownerships/{ownershipId}/end",
      "200",
      "PropertyOwnership",
      "EndRelationshipRequest",
    ],
    [
      "post",
      "/api/v1/tenant/residencies",
      "201",
      "Residency",
      "ResidencyCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/residencies/{residencyId}",
      "200",
      "Residency",
      "ResidencyUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/residencies/{residencyId}/end",
      "200",
      "Residency",
      "EndRelationshipRequest",
    ],
    ["post", "/api/v1/tenant/leases", "201", "Lease", "LeaseCreateRequest"],
    [
      "patch",
      "/api/v1/tenant/leases/{leaseId}",
      "200",
      "Lease",
      "LeaseUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/leases/{leaseId}/end",
      "200",
      "Lease",
      "EndRelationshipRequest",
    ],
    [
      "post",
      "/api/v1/tenant/charge-concepts",
      "201",
      "ChargeConcept",
      "ChargeConceptCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/charge-concepts/{chargeConceptId}",
      "200",
      "ChargeConcept",
      "ChargeConceptUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/charge-concepts/{chargeConceptId}/archive",
      "200",
      "ChargeConcept",
      "EmptyRequest",
    ],
    [
      "post",
      "/api/v1/tenant/fee-schedules",
      "201",
      "FeeSchedule",
      "FeeScheduleCreateRequest",
    ],
    [
      "patch",
      "/api/v1/tenant/fee-schedules/{feeScheduleId}",
      "200",
      "FeeSchedule",
      "FeeScheduleUpdateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/fee-schedules/{feeScheduleId}/archive",
      "200",
      "FeeSchedule",
      "EmptyRequest",
    ],
    [
      "post",
      "/api/v1/tenant/unit-fees",
      "201",
      "UnitFeeAssignment",
      "UnitFeeCreateRequest",
    ],
    [
      "post",
      "/api/v1/tenant/unit-fees/{unitFeeAssignmentId}/end",
      "200",
      "UnitFeeAssignment",
      "EndRelationshipRequest",
    ],
    [
      "post",
      "/api/v1/tenant/billing-periods",
      "201",
      "BillingPeriod",
      "BillingPeriodCreateRequest",
    ],
    ["post", "/api/v1/tenant/charges", "201", "Charge", "ChargeCreateRequest"],
    [
      "post",
      "/api/v1/tenant/charges/{chargeId}/cancel",
      "200",
      "Charge",
      "PaymentReviewRequest",
    ],
    [
      "post",
      "/api/v1/tenant/payments/{paymentId}/confirm",
      "200",
      "Payment",
      null,
    ],
    [
      "post",
      "/api/v1/tenant/payments/{paymentId}/reject",
      "200",
      "Payment",
      "PaymentReviewRequest",
    ],
    [
      "post",
      "/api/v1/tenant/payment-receipts/{receiptId}/accept",
      "200",
      "PaymentReceipt",
      null,
    ],
    [
      "post",
      "/api/v1/tenant/payment-receipts/{receiptId}/reject",
      "200",
      "PaymentReceipt",
      "PaymentReviewRequest",
    ],
  ];
}

function metaForRuntime(path: string) {
  return path.includes("/payments/") || path.includes("/payment-receipts/")
    ? "TypedRequestMeta"
    : "TypedTraceMeta";
}

function sprint4RequestRequiredFields(): Record<string, readonly string[]> {
  return {
    ArchiveRequest: ["reason"],
    EndRelationshipRequest: ["endDate", "reason"],
    LinkUserRequest: ["userProfileId"],
    PropertyUnitCreateRequest: ["code"],
    PropertyUnitUpdateRequest: [],
    PersonCreateRequest: ["displayName"],
    PersonUpdateRequest: [],
    LegalEntityCreateRequest: ["name"],
    LegalEntityUpdateRequest: [],
    OwnershipCreateRequest: ["propertyUnitId", "startDate"],
    OwnershipUpdateRequest: [],
    ResidencyCreateRequest: ["propertyUnitId", "personId", "startDate"],
    ResidencyUpdateRequest: [],
    LeaseCreateRequest: ["propertyUnitId", "tenantPersonId", "startDate"],
    LeaseUpdateRequest: [],
    ChargeConceptCreateRequest: ["code", "name"],
    ChargeConceptUpdateRequest: [],
    FeeScheduleCreateRequest: [
      "chargeConceptId",
      "name",
      "amount",
      "effectiveFrom",
    ],
    FeeScheduleUpdateRequest: [],
    UnitFeeCreateRequest: ["propertyUnitId", "feeScheduleId", "startDate"],
    BillingPeriodCreateRequest: ["periodCode", "startsAt", "endsAt", "dueDate"],
    ChargeCreateRequest: [
      "billingPeriodId",
      "propertyUnitId",
      "chargeConceptId",
      "type",
      "amount",
      "issuedDate",
      "dueDate",
    ],
    PaymentReviewRequest: ["reason"],
    EmptyRequest: [],
  };
}

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

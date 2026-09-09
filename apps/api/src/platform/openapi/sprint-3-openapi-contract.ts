import type { OpenAPIObject } from "@nestjs/swagger";

type Operation = Record<string, unknown> & {
  operationId?: string;
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses?: Record<string, unknown>;
};

const METHODS = new Set(["get", "patch", "post"]);
const MUTATIONS = new Set(["patch", "post"]);
const ERROR_CODES: Record<string, readonly string[]> = {
  "400": ["TENANT_CONTEXT_REQUIRED", "IDEMPOTENCY_KEY_REQUIRED"],
  "401": ["AUTHENTICATION_REQUIRED"],
  "403": ["TENANT_CONTEXT_INVALID", "PERMISSION_DENIED"],
  "404": ["RESOURCE_NOT_FOUND", "CROSS_TENANT_REFERENCE"],
  "409": [
    "RESOURCE_STATE_CONFLICT",
    "IDEMPOTENCY_KEY_CONFLICT",
    "IDEMPOTENCY_OPERATION_IN_PROGRESS",
    "CONCURRENT_MODIFICATION",
    "FINANCIAL_CURRENCY_MISMATCH",
  ],
  "422": ["VALIDATION_ERROR", "UNSUPPORTED_TENANT_CURRENCY"],
  "503": ["DEPENDENCY_UNAVAILABLE"],
};

export function applySprint3OpenApiContract(document: OpenAPIObject): void {
  const components = (document.components ??= {});
  components.schemas ??= {};
  components.schemas.SecureErrorEnvelope = {
    type: "object",
    required: ["error"],
    additionalProperties: false,
    properties: {
      error: {
        type: "object",
        required: ["code", "message", "details", "traceId"],
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          details: { type: "object", nullable: true },
          traceId: { type: "string" },
        },
      },
    },
  };
  for (const [path, item] of Object.entries(document.paths)) {
    if (!isSprint3Path(path)) {
      continue;
    }
    for (const [method, value] of Object.entries(item ?? {})) {
      if (!METHODS.has(method) || !value) continue;
      enrichOperation(path, method, value as Operation);
    }
  }
}

function isSprint3Path(path: string): boolean {
  if (path.startsWith("/api/v1/me/")) return true;
  if (!path.startsWith("/api/v1/tenant/")) return false;
  return ![
    "/api/v1/tenant/invitations",
    "/api/v1/tenant/memberships",
    "/api/v1/tenant/settings",
  ].some((baseline) => path.startsWith(baseline));
}

function enrichOperation(path: string, method: string, operation: Operation) {
  const own = path.startsWith("/api/v1/me/");
  const idempotent = MUTATIONS.has(method);
  operation.security = [{ bearerAuth: [] }];
  operation["x-auth-required"] = true;
  operation["x-platform-only"] = false;
  operation["x-public"] = false;
  operation["x-tenant-scope"] = "tenant";
  operation["x-tenant-context-required"] = true;
  operation["x-own-resource"] = own;
  operation["x-idempotency-required"] = idempotent;
  operation["x-response-envelope"] = !path.endsWith("/download");
  operation["x-required-permission"] = permissionFor(path, method);
  operation.summary ??= summaryFor(operation.operationId, method, path);
  operation.parameters = addPathParameters(
    path,
    addHeaders(operation.parameters ?? [], idempotent),
  );
  operation.responses = addResponses(operation.responses ?? {});
  if (idempotent && !operation.requestBody) {
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", additionalProperties: false },
        },
      },
    };
  }
}

function summaryFor(
  operationId: string | undefined,
  method: string,
  path: string,
) {
  const action = operationId?.split("_").at(-1) ?? method;
  const resource =
    path.split("/").filter(Boolean).at(-1)?.replace(/[{}]/gu, "resource") ??
    "resource";
  return `${action.replace(/([a-z])([A-Z])/gu, "$1 $2")} ${resource}`;
}

function addPathParameters(
  path: string,
  parameters: Array<Record<string, unknown>>,
) {
  const result = [...parameters];
  for (const match of path.matchAll(/\{([^}]+)\}/gu)) {
    const name = match[1];
    if (!result.some((entry) => entry.in === "path" && entry.name === name)) {
      result.unshift({
        in: "path",
        name,
        required: true,
        schema: { type: "string", format: "uuid" },
      });
    }
  }
  return result;
}

function addHeaders(
  parameters: Array<Record<string, unknown>>,
  idempotent: boolean,
) {
  const result = [...parameters];
  if (!result.some((entry) => entry.name === "X-Tenant-Id")) {
    result.push({
      in: "header",
      name: "X-Tenant-Id",
      required: true,
      schema: { type: "string", format: "uuid" },
      description: "Validated active tenant context.",
    });
  }
  if (idempotent && !result.some((entry) => entry.name === "Idempotency-Key")) {
    result.push({
      in: "header",
      name: "Idempotency-Key",
      required: true,
      schema: { type: "string", minLength: 8, maxLength: 128 },
      description: "Opaque client key scoped by tenant and operation.",
    });
  }
  return result;
}

function addResponses(responses: Record<string, unknown>) {
  const result = { ...responses };
  for (const [status, codes] of Object.entries(ERROR_CODES)) {
    result[status] ??= {
      description: codes.join(", "),
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/SecureErrorEnvelope" },
        },
      },
    };
  }
  return result;
}

function permissionFor(path: string, method: string): string {
  const own = path.startsWith("/api/v1/me/");
  const suffix = own ? ".own" : "";
  if (path.includes("financial-movements"))
    return `financialMovements.read${suffix}`;
  if (path.includes("/balance"))
    return method === "get" ? `balances.read${suffix}` : "balances.recalculate";
  if (path.includes("account-statements")) {
    if (method === "get") return `accountStatements.read${suffix}`;
    if (path.endsWith("/publish")) return "accountStatements.publish";
    if (path.endsWith("/close")) return "accountStatements.close";
    if (path.endsWith("/lock")) return "accountStatements.lock";
    if (path.endsWith("/regenerate")) return "accountStatements.regenerate";
    return "accountStatements.generate";
  }
  if (path.includes("payment-receipts")) {
    if (path.endsWith("/download")) return `paymentReceipts.download${suffix}`;
    if (method === "get") return "paymentReceipts.read";
    return path.endsWith("/accept") || path.endsWith("/reject")
      ? "paymentReceipts.review"
      : `paymentReceipts.create${suffix}`;
  }
  if (path.includes("payment-allocations"))
    return method === "get" ? "payments.read" : "payments.allocations.reverse";
  if (path.includes("/payments")) {
    if (path.endsWith("/receipts") && method === "get")
      return "paymentReceipts.read";
    if (method === "get") return `payments.read${suffix}`;
    if (path.endsWith("/confirm")) return "payments.confirm";
    if (path.endsWith("/reject")) return "payments.reject";
    if (path.endsWith("/allocate") || path.endsWith("/auto-allocate"))
      return "payments.allocate";
    if (path.endsWith("/reverse")) return "payments.reverse";
    if (path.endsWith("/receipts")) return `paymentReceipts.create${suffix}`;
    return `payments.create${suffix}`;
  }
  if (path.includes("charge-batches")) return "fees.readBatches";
  if (path.includes("/charges")) {
    if (path.endsWith("generate-monthly")) return "fees.generate";
    if (method === "get") return `charges.read${suffix}`;
    if (path.endsWith("/cancel")) return "charges.cancel";
    if (path.endsWith("/adjustments")) return "charges.adjust";
    if (path.endsWith("/reverse")) return "charges.reverse";
    return "charges.create";
  }
  if (path.includes("billing-periods")) {
    if (path.endsWith("/close")) return "billingPeriods.close";
    if (path.endsWith("/lock")) return "billingPeriods.lock";
    return method === "get" ? "billingPeriods.read" : "billingPeriods.create";
  }
  return resourcePermission(path, method, own);
}

function resourcePermission(
  path: string,
  method: string,
  own: boolean,
): string {
  if (path === "/api/v1/me/person") return "persons.read.own";
  const definitions: Array<[string, string, string]> = [
    ["property-units", "propertyUnits", "archive"],
    ["persons", "persons", "archive"],
    ["legal-entities", "legalEntities", "archive"],
    ["property-ownerships", "propertyOwnerships", "end"],
    ["residencies", "residencies", "end"],
    ["leases", "leases", "end"],
    ["charge-concepts", "chargeConcepts", "archive"],
    ["fee-schedules", "feeSchedules", "archive"],
    ["unit-fees", "unitFees", "end"],
    ["payments", "payments", "reverse"],
  ];
  const [, resource, terminal] = definitions.find(([segment]) =>
    path.includes(`/${segment}`),
  ) ?? ["", "unknown", "update"];
  if (own) return `${resource}.read.own`;
  if (method === "get") return `${resource}.read`;
  if (path.endsWith("/link-user")) return "persons.linkIdentity";
  if (path.endsWith(`/${terminal}`)) return `${resource}.${terminal}`;
  if (method === "patch") return `${resource}.update`;
  if (resource === "unitFees") return "unitFees.assign";
  return `${resource}.create`;
}

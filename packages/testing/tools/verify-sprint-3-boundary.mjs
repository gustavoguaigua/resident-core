import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const resolveInput = (path) =>
  isAbsolute(path) ? path : resolve(repositoryRoot, path);
const readUtf8 = (path) => readFileSync(resolveInput(path), "utf8");

const manifest = JSON.parse(
  readUtf8(
    process.env.SPRINT3_MANIFEST_PATH ??
      "packages/testing/config/sprint-3-gates.json",
  ),
);
const rootPackage = JSON.parse(readUtf8("package.json"));
const schema = readUtf8(
  process.env.SPRINT3_SCHEMA_PATH ?? "prisma/schema.prisma",
);
const openApi = JSON.parse(
  readUtf8(
    process.env.SPRINT3_OPENAPI_PATH ??
      "packages/openapi-client/openapi/resident-core.v1.json",
  ),
);
const readiness = readUtf8("docs/changes/READINESS-SPRINT-3-2026-08-28.md");

const failures = [];
const expectedPhases = [
  { name: "readiness", commands: [] },
  {
    name: "residents-properties-persistence",
    commands: ["test:residents:persistence"],
  },
  {
    name: "residents-properties-api",
    commands: ["test:residents", "test:residents:authorization"],
  },
  { name: "secure-document-storage", commands: ["test:documents"] },
  { name: "dues-fees-foundation", commands: ["test:dues"] },
  { name: "charge-lifecycle", commands: ["test:charges"] },
  { name: "payments-receipts", commands: ["test:payments"] },
  { name: "allocations-reversals", commands: ["test:allocations"] },
  {
    name: "balances-statements",
    commands: ["test:statements", "test:financial"],
  },
  {
    name: "openapi-cross-slice-closure",
    commands: [
      "test:api",
      "test:integration",
      "test:stack:smoke",
      "openapi:check",
      "openapi:validate",
    ],
  },
];

if (manifest.schemaVersion !== 1) {
  failures.push("Sprint 3 gate manifest schemaVersion must be 1.");
}
if (!Array.isArray(manifest.phases) || manifest.phases.length !== 10) {
  failures.push("Sprint 3 must define exactly phases 0 through 9.");
}
if (
  !Number.isInteger(manifest.currentPhase) ||
  manifest.currentPhase < 0 ||
  manifest.currentPhase >= expectedPhases.length
) {
  failures.push("Sprint 3 currentPhase is outside the supported sequence.");
}

for (const [index, expectedPhase] of expectedPhases.entries()) {
  const phase = manifest.phases?.[index];
  if (phase?.id !== index || phase?.name !== expectedPhase.name) {
    failures.push(`Sprint 3 phase ${index} must be ${expectedPhase.name}.`);
  }
  if (!Array.isArray(phase?.commands)) {
    failures.push(`Sprint 3 phase ${index} commands must be an array.`);
  } else if (
    JSON.stringify(phase.commands) !== JSON.stringify(expectedPhase.commands)
  ) {
    failures.push(
      `Sprint 3 phase ${index} commands do not match the gate contract.`,
    );
  }
}

const readinessDecision = readiness.match(/Decision:\s*(NO_GO|GO)/u)?.[1];
if (!readinessDecision) {
  failures.push("Sprint 3 readiness decision could not be determined.");
} else if (manifest.readinessDecision !== readinessDecision) {
  failures.push(
    `Gate manifest decision ${manifest.readinessDecision} does not match readiness ${readinessDecision}.`,
  );
}
if (manifest.readinessDecision === "NO_GO" && manifest.currentPhase !== 0) {
  failures.push("NO_GO requires Sprint 3 currentPhase to remain 0.");
}

for (const phase of manifest.phases ?? []) {
  if (phase.id > manifest.currentPhase) {
    continue;
  }
  for (const script of phase.commands ?? []) {
    const command = rootPackage.scripts?.[script];
    if (!command) {
      failures.push(`Active Sprint 3 gate script is missing: ${script}.`);
      continue;
    }
    if (
      /(?:--if-present|\|\|\s*true|^\s*echo\b|^\s*exit\s+0\b)/u.test(command)
    ) {
      failures.push(
        `Active Sprint 3 gate script is not fail-closed: ${script}.`,
      );
    }
  }
}

const applicableSpecDirectories = [
  "003-residents-properties",
  "004-dues-fees",
  "005-payments",
  "006-account-statements",
  "016-secure-document-storage",
];
const expectedDocuments = new Set([
  "api-contract.md",
  "data-model.md",
  "plan.md",
  "security-notes.md",
  "spec.md",
  "tasks.md",
  "test-plan.md",
]);
let applicableDocumentCount = 0;
let needsReviewCount = 0;

for (const directory of applicableSpecDirectories) {
  const specRoot = resolve(repositoryRoot, "docs/specs", directory);
  const documents = readdirSync(specRoot).filter((name) =>
    name.endsWith(".md"),
  );
  for (const expectedDocument of expectedDocuments) {
    if (!documents.includes(expectedDocument)) {
      failures.push(
        `Sprint 3 applicable document is missing: ${directory}/${expectedDocument}.`,
      );
    }
  }
  for (const document of documents.filter((name) =>
    expectedDocuments.has(name),
  )) {
    applicableDocumentCount += 1;
    const content = readFileSync(resolve(specRoot, document), "utf8");
    if (/\|\s*Estado\s*\|\s*needs-review\s*\|/u.test(content)) {
      needsReviewCount += 1;
    } else if (!/\|\s*Estado\s*\|\s*accepted\s*\|/u.test(content)) {
      failures.push(
        `Sprint 3 document has no recognized status: ${directory}/${document}.`,
      );
    }
  }
}

if (applicableDocumentCount !== 35) {
  failures.push(
    `Sprint 3 must have exactly 35 applicable documents; found ${applicableDocumentCount}.`,
  );
}
if (manifest.readinessDecision === "GO" && needsReviewCount > 0) {
  failures.push(
    `GO forbids needs-review documents; found ${needsReviewCount}.`,
  );
}

const declaredModels = [...schema.matchAll(/^\s*model\s+(\w+)/gmu)].map(
  (match) => match[1],
);
const declaredEnums = [...schema.matchAll(/^\s*enum\s+(\w+)/gmu)].map(
  (match) => match[1],
);
const sprint2Models = new Set([
  "AuditLog",
  "Invitation",
  "MembershipRole",
  "Permission",
  "Role",
  "RolePermission",
  "SettingDefinition",
  "Tenant",
  "TenantBranding",
  "TenantProfile",
  "TenantSettingValue",
  "TenantWordPressMapping",
  "UserGlobalRole",
  "UserProfile",
  "UserTenantMembership",
]);
const sprint2Enums = new Set([
  "AuditActorType",
  "AuditCategory",
  "AuditOutcome",
  "AuthProvider",
  "DefinitionStatus",
  "InvitationStatus",
  "MembershipStatus",
  "RoleScope",
  "TenantSettingCategory",
  "TenantSettingSensitivity",
  "TenantSettingSource",
  "TenantSettingValueStatus",
  "TenantSettingValueType",
  "TenantStatus",
  "UserStatus",
  "UserType",
]);
const phase1Models = new Set([
  "Lease",
  "LegalEntity",
  "Person",
  "PropertyOwnership",
  "PropertyUnit",
  "Residency",
]);
const phase1Enums = new Set([
  "IdentificationType",
  "LeaseStatus",
  "LegalEntityStatus",
  "OwnershipStatus",
  "OwnershipType",
  "PersonStatus",
  "PropertyUnitStatus",
  "PropertyUnitType",
  "ResidencyStatus",
  "ResidencyType",
]);
const phase2Models = new Set(["IdempotencyOperation"]);
const phase2Enums = new Set(["IdempotencyOperationStatus"]);
const operationsAtSprint2Closure = new Set([
  "GET /api/v1/health",
  "GET /api/v1/health/details",
  "GET /api/v1/invitations/{token}",
  "POST /api/v1/invitations/{token}/accept",
  "GET /api/v1/me",
  "GET /api/v1/me/permissions",
  "GET /api/v1/me/tenants",
  "GET /api/v1/platform/permissions",
  "GET /api/v1/platform/roles",
  "GET /api/v1/platform/setting-definitions",
  "GET /api/v1/platform/setting-definitions/{definitionId}",
  "GET /api/v1/platform/tenants",
  "POST /api/v1/platform/tenants",
  "GET /api/v1/platform/tenants/{tenantId}",
  "PATCH /api/v1/platform/tenants/{tenantId}",
  "POST /api/v1/platform/tenants/{tenantId}/activate",
  "POST /api/v1/platform/tenants/{tenantId}/archive",
  "POST /api/v1/platform/tenants/{tenantId}/reactivate",
  "POST /api/v1/platform/tenants/{tenantId}/suspend",
  "GET /api/v1/platform/users",
  "POST /api/v1/platform/users",
  "GET /api/v1/platform/users/{userId}",
  "PATCH /api/v1/platform/users/{userId}",
  "POST /api/v1/platform/users/{userId}/disable",
  "POST /api/v1/platform/users/{userId}/enable",
  "POST /api/v1/platform/users/{userId}/global-roles",
  "DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}",
  "GET /api/v1/public/tenants/{slug}",
  "GET /api/v1/tenant/branding",
  "PATCH /api/v1/tenant/branding",
  "GET /api/v1/tenant/invitations",
  "POST /api/v1/tenant/invitations",
  "POST /api/v1/tenant/invitations/{invitationId}/revoke",
  "POST /api/v1/tenant/memberships/{membershipId}/revoke",
  "POST /api/v1/tenant/memberships/{membershipId}/roles",
  "DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}",
  "GET /api/v1/tenant/profile",
  "PATCH /api/v1/tenant/profile",
  "GET /api/v1/tenant/settings",
  "GET /api/v1/tenant/settings/{key}",
  "PATCH /api/v1/tenant/settings/{key}",
  "GET /api/v1/tenant/users",
  "PATCH /api/v1/tenant/wordpress-mapping",
]);
const httpMethods = new Set(["delete", "get", "patch", "post", "put"]);
const actualOperations = [];

for (const [path, pathItem] of Object.entries(openApi.paths ?? {})) {
  for (const method of Object.keys(pathItem)) {
    if (httpMethods.has(method)) {
      actualOperations.push(`${method.toUpperCase()} ${path}`);
    }
  }
}

if (manifest.currentPhase <= 2) {
  const allowedModels = new Set(sprint2Models);
  const allowedEnums = new Set(sprint2Enums);
  if (manifest.currentPhase === 1) {
    for (const model of phase1Models) {
      allowedModels.add(model);
    }
    for (const enumName of phase1Enums) {
      allowedEnums.add(enumName);
    }
  }
  if (manifest.currentPhase === 2) {
    for (const model of phase1Models) allowedModels.add(model);
    for (const enumName of phase1Enums) allowedEnums.add(enumName);
    for (const model of phase2Models) allowedModels.add(model);
    for (const enumName of phase2Enums) allowedEnums.add(enumName);
  }
  const prematureModels = declaredModels.filter(
    (model) => !allowedModels.has(model),
  );
  const prematureEnums = declaredEnums.filter(
    (enumName) => !allowedEnums.has(enumName),
  );
  const prematureOperations = actualOperations.filter(
    (operation) => !operationsAtSprint2Closure.has(operation),
  );
  if (prematureModels.length > 0) {
    failures.push(
      `Sprint 3 phase ${manifest.currentPhase} forbids domain models: ${prematureModels.join(", ")}.`,
    );
  }
  if (prematureEnums.length > 0) {
    failures.push(
      `Sprint 3 phase ${manifest.currentPhase} forbids domain enums: ${prematureEnums.join(", ")}.`,
    );
  }
  if (prematureOperations.length > 0) {
    failures.push(
      `Sprint 3 phase ${manifest.currentPhase} forbids functional API operations: ${prematureOperations.join(", ")}.`,
    );
  }
  const forbiddenModules = [
    "apps/api/src/modules/dues-fees",
    "apps/api/src/modules/payments",
    "apps/api/src/modules/account-statements",
    "apps/api/src/modules/secure-document-storage",
  ];
  if (manifest.currentPhase < 2) {
    forbiddenModules.unshift("apps/api/src/modules/residents-properties");
  }
  for (const modulePath of forbiddenModules) {
    if (existsSync(resolve(repositoryRoot, modulePath))) {
      failures.push(
        `Sprint 3 phase ${manifest.currentPhase} forbids runtime module: ${modulePath}.`,
      );
    }
  }

  if (manifest.currentPhase === 1) {
    const missingModels = [...phase1Models].filter(
      (model) => !declaredModels.includes(model),
    );
    const missingEnums = [...phase1Enums].filter(
      (enumName) => !declaredEnums.includes(enumName),
    );
    if (missingModels.length > 0) {
      failures.push(
        `Sprint 3 phase 1 requires domain models: ${missingModels.join(", ")}.`,
      );
    }
    if (missingEnums.length > 0) {
      failures.push(
        `Sprint 3 phase 1 requires domain enums: ${missingEnums.join(", ")}.`,
      );
    }
  }
  if (manifest.currentPhase === 2) {
    const missingModels = [...phase2Models].filter(
      (model) => !declaredModels.includes(model),
    );
    const missingEnums = [...phase2Enums].filter(
      (enumName) => !declaredEnums.includes(enumName),
    );
    if (missingModels.length > 0) {
      failures.push(
        `Sprint 3 phase 2 requires platform models: ${missingModels.join(", ")}.`,
      );
    }
    if (missingEnums.length > 0) {
      failures.push(
        `Sprint 3 phase 2 requires platform enums: ${missingEnums.join(", ")}.`,
      );
    }
    if (
      !existsSync(
        resolve(repositoryRoot, "apps/api/src/modules/residents-properties"),
      )
    ) {
      failures.push(
        "Sprint 3 phase 2 requires the residents-properties runtime module.",
      );
    }
  }
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

process.stdout.write(
  `Sprint 3 boundary is valid at phase ${manifest.currentPhase} (${manifest.readinessDecision}); applicable documents: ${applicableDocumentCount}, needs-review: ${needsReviewCount}.\n`,
);

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);

const readUtf8 = (path) =>
  readFileSync(isAbsolute(path) ? path : resolve(repositoryRoot, path), "utf8");
const exists = (relativePath) =>
  existsSync(resolve(repositoryRoot, relativePath));

const manifest = JSON.parse(
  readUtf8("packages/testing/config/sprint-2-gates.json"),
);
const rootPackage = JSON.parse(readUtf8("package.json"));
const schema = readUtf8(
  process.env.SPRINT2_SCHEMA_PATH ?? "prisma/schema.prisma",
);
const openApi = JSON.parse(
  readUtf8(
    process.env.SPRINT2_OPENAPI_PATH ??
      "packages/openapi-client/openapi/resident-core.v1.json",
  ),
);
const readiness = readUtf8("docs/changes/READINESS-SPRINT-2-2026-08-11.md");

const failures = [];

const expectedPhases = [
  { name: "readiness", commands: [] },
  {
    name: "keycloak-contract",
    commands: ["keycloak:verify", "test:keycloak"],
  },
  {
    name: "tenant-identity-persistence",
    commands: ["prisma:migrate:check"],
  },
  { name: "audit-base", commands: ["test:audit"] },
  { name: "platform-admin-bootstrap", commands: ["test:bootstrap"] },
  {
    name: "identity-membership-authorization",
    commands: ["test:authorization", "test:multitenancy"],
  },
  { name: "tenant-onboarding-lifecycle", commands: ["test:tenants"] },
  { name: "invitations-memberships", commands: ["test:invitations"] },
  { name: "tenant-settings", commands: ["test:settings"] },
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
  failures.push("Sprint 2 gate manifest schemaVersion must be 1.");
}

if (
  !Number.isInteger(manifest.currentPhase) ||
  manifest.currentPhase < 0 ||
  manifest.currentPhase >= expectedPhases.length
) {
  failures.push("Sprint 2 currentPhase is outside the supported sequence.");
}

for (const [index, expectedPhase] of expectedPhases.entries()) {
  const phase = manifest.phases?.[index];
  if (phase?.id !== index || phase?.name !== expectedPhase.name) {
    failures.push(`Sprint 2 phase ${index} must be ${expectedPhase.name}.`);
  }
  if (!Array.isArray(phase?.commands)) {
    failures.push(`Sprint 2 phase ${index} commands must be an array.`);
  } else if (
    JSON.stringify(phase.commands) !== JSON.stringify(expectedPhase.commands)
  ) {
    failures.push(
      `Sprint 2 phase ${index} commands do not match the gate contract.`,
    );
  }
}

const readinessDecision = readiness.match(/Decision:\s*(NO_GO|GO)/u)?.[1];
if (!readinessDecision) {
  failures.push("Sprint 2 readiness decision could not be determined.");
} else if (manifest.readinessDecision !== readinessDecision) {
  failures.push(
    `Gate manifest decision ${manifest.readinessDecision} does not match readiness ${readinessDecision}.`,
  );
}

if (manifest.readinessDecision === "NO_GO" && manifest.currentPhase !== 0) {
  failures.push("NO_GO requires Sprint 2 currentPhase to remain 0.");
}

for (const phase of manifest.phases ?? []) {
  if (phase.id > manifest.currentPhase) {
    continue;
  }
  for (const script of phase.commands ?? []) {
    const command = rootPackage.scripts?.[script];
    if (!command) {
      failures.push(`Active Sprint 2 gate script is missing: ${script}.`);
      continue;
    }
    if (
      /(?:--if-present|\|\|\s*true|^\s*echo\b|^\s*exit\s+0\b)/u.test(command)
    ) {
      failures.push(
        `Active Sprint 2 gate script is not fail-closed: ${script}.`,
      );
    }
  }
}

const allowedModels = new Set([
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
const tenantIdentityModels = new Set([
  "Invitation",
  "MembershipRole",
  "Permission",
  "Role",
  "RolePermission",
  "Tenant",
  "TenantBranding",
  "TenantProfile",
  "TenantWordPressMapping",
  "UserGlobalRole",
  "UserProfile",
  "UserTenantMembership",
]);
const allowedEnums = new Set([
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

const declaredModels = [...schema.matchAll(/^\s*model\s+(\w+)/gmu)].map(
  (match) => match[1],
);
const declaredEnums = [...schema.matchAll(/^\s*enum\s+(\w+)/gmu)].map(
  (match) => match[1],
);

if (manifest.currentPhase < 9) {
  for (const model of declaredModels) {
    if (!allowedModels.has(model)) {
      failures.push(`Prisma model outside Sprint 2 boundary: ${model}.`);
    }
  }
  for (const enumName of declaredEnums) {
    if (!allowedEnums.has(enumName)) {
      failures.push(`Prisma enum outside Sprint 2 boundary: ${enumName}.`);
    }
  }
}
if (declaredModels.includes("TenantConfiguration")) {
  failures.push("TenantConfiguration is explicitly excluded from Sprint 2.");
}

const allowedOperations = new Set([
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

if (manifest.currentPhase < 9) {
  for (const operation of actualOperations) {
    if (!allowedOperations.has(operation)) {
      failures.push(
        `OpenAPI operation outside Sprint 2 boundary: ${operation}.`,
      );
    }
  }
}

const migrationRoot = resolve(repositoryRoot, "prisma/migrations");
const migrationFiles = existsSync(migrationRoot)
  ? readdirSync(migrationRoot)
      .map((entry) => resolve(migrationRoot, entry, "migration.sql"))
      .filter((entry) => existsSync(entry) && statSync(entry).isFile())
      .sort()
  : [];
const migrations = migrationFiles.map((file) =>
  readFileSync(file, "utf8").toLowerCase(),
);
const firstMigrationContaining = (needle) =>
  migrations.findIndex((migration) => migration.includes(needle));

const tenantMigration = firstMigrationContaining("tenants");
const identityMigration = firstMigrationContaining("user_profiles");
const auditMigration = firstMigrationContaining("audit_logs");
const settingsMigration = firstMigrationContaining("setting_definitions");

if (
  auditMigration >= 0 &&
  (tenantMigration < 0 ||
    identityMigration < 0 ||
    auditMigration <= tenantMigration ||
    auditMigration <= identityMigration)
) {
  failures.push("Audit migration must follow tenant and identity migrations.");
}
if (
  settingsMigration >= 0 &&
  (auditMigration < 0 || settingsMigration <= auditMigration)
) {
  failures.push("Settings migration must follow the audit base migration.");
}

const phaseSignals = [
  {
    phase: 1,
    active: exists("infra/keycloak/realm/resident-realm.json"),
    label: "Keycloak realm",
  },
  {
    phase: 2,
    active:
      migrationFiles.length > 0 ||
      declaredModels.some((model) => tenantIdentityModels.has(model)),
    label: "tenant/identity persistence",
  },
  {
    phase: 3,
    active: declaredModels.includes("AuditLog"),
    label: "AuditLog persistence",
  },
  {
    phase: 4,
    active: Boolean(rootPackage.scripts?.["bootstrap:platform-admin"]),
    label: "PlatformAdmin bootstrap",
  },
  {
    phase: 5,
    active:
      exists(
        "apps/api/src/modules/identity-integration/prisma-identity-resolver.ts",
      ) ||
      exists("apps/api/src/modules/access-control/prisma-access-control.ts"),
    label: "identity/membership authorization",
  },
  {
    phase: 6,
    active: actualOperations.includes("POST /api/v1/platform/tenants"),
    label: "tenant onboarding API",
  },
  {
    phase: 7,
    active: actualOperations.includes("POST /api/v1/tenant/invitations"),
    label: "invitation API",
  },
  {
    phase: 8,
    active:
      declaredModels.includes("SettingDefinition") ||
      actualOperations.includes("GET /api/v1/tenant/settings"),
    label: "tenant settings",
  },
];

for (const signal of phaseSignals) {
  if (signal.active && manifest.currentPhase < signal.phase) {
    failures.push(
      `${signal.label} exists before Sprint 2 phase ${signal.phase} is activated.`,
    );
  }
}

if (manifest.currentPhase >= 1) {
  for (const requiredPath of [
    "infra/keycloak/realm/resident-realm.json",
    "infra/keycloak/fixtures/local-identities.json",
    "tools/keycloak/bootstrap-local.mjs",
    "tools/keycloak/verify-realm.mjs",
  ]) {
    if (!exists(requiredPath)) {
      failures.push(`Active Keycloak phase requires ${requiredPath}.`);
    }
  }
}
if (manifest.currentPhase >= 2) {
  const missingPersistenceModels = [...tenantIdentityModels].filter(
    (model) => !declaredModels.includes(model),
  );
  if (migrationFiles.length === 0 || missingPersistenceModels.length > 0) {
    failures.push(
      `Active persistence phase requires migrations and all tenant/identity models; missing: ${missingPersistenceModels.join(", ") || "none"}.`,
    );
  }
}
if (
  manifest.currentPhase >= 3 &&
  (!declaredModels.includes("AuditLog") || auditMigration < 0)
) {
  failures.push("Active audit phase requires AuditLog and its migration.");
}
if (
  manifest.currentPhase >= 4 &&
  !rootPackage.scripts?.["bootstrap:platform-admin"]
) {
  failures.push("Active bootstrap phase requires bootstrap:platform-admin.");
}
if (
  manifest.currentPhase >= 5 &&
  (!exists(
    "apps/api/src/modules/identity-integration/prisma-identity-resolver.ts",
  ) ||
    !exists("apps/api/src/modules/access-control/prisma-access-control.ts") ||
    !rootPackage.scripts?.["test:authorization"] ||
    !rootPackage.scripts?.["test:multitenancy"])
) {
  failures.push(
    "Active authorization phase requires identity, access-control and both Phase 5 gates.",
  );
}
if (
  manifest.currentPhase >= 6 &&
  !actualOperations.includes("POST /api/v1/platform/tenants")
) {
  failures.push(
    "Active tenant lifecycle phase requires the tenant onboarding API.",
  );
}
if (
  manifest.currentPhase >= 7 &&
  !actualOperations.includes("POST /api/v1/tenant/invitations")
) {
  failures.push("Active invitations phase requires the tenant invitation API.");
}
if (
  manifest.currentPhase >= 8 &&
  (!declaredModels.includes("SettingDefinition") ||
    !declaredModels.includes("TenantSettingValue") ||
    settingsMigration < 0 ||
    !actualOperations.includes("GET /api/v1/tenant/settings") ||
    !actualOperations.includes("PATCH /api/v1/tenant/settings/{key}"))
) {
  failures.push(
    "Active settings phase requires its models, migration and tenant API.",
  );
}

if (manifest.readinessDecision === "NO_GO") {
  if (
    declaredModels.length > 0 ||
    declaredEnums.length > 0 ||
    migrationFiles.length > 0
  ) {
    failures.push("NO_GO forbids Sprint 2 Prisma domain artifacts.");
  }
  const nonHealthOperations = actualOperations.filter(
    (operation) => !operation.startsWith("GET /api/v1/health"),
  );
  if (nonHealthOperations.length > 0) {
    failures.push("NO_GO forbids Sprint 2 functional API operations.");
  }
  if (exists("infra/keycloak/realm/resident-realm.json")) {
    failures.push("NO_GO forbids the Sprint 2 Keycloak realm implementation.");
  }
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

process.stdout.write(
  `Sprint 2 boundary is valid at phase ${manifest.currentPhase} (${manifest.readinessDecision}).\n`,
);

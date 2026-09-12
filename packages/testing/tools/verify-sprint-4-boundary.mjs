import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const paths = {
  manifest:
    process.env.SPRINT4_MANIFEST_PATH ??
    resolve(repositoryRoot, "packages/testing/config/sprint-4-gates.json"),
  readiness:
    process.env.SPRINT4_READINESS_PATH ??
    resolve(repositoryRoot, "docs/changes/READINESS-SPRINT-4-2026-09-12.md"),
  runbook:
    process.env.SPRINT4_RUNBOOK_PATH ??
    resolve(
      repositoryRoot,
      "docs/implementation/sprint-4-admin-web-app-mvp.md",
    ),
  openapi:
    process.env.SPRINT4_OPENAPI_PATH ??
    resolve(
      repositoryRoot,
      "packages/openapi-client/openapi/resident-core.v1.json",
    ),
  client:
    process.env.SPRINT4_CLIENT_STATUS_PATH ??
    resolve(repositoryRoot, "packages/openapi-client/src/index.ts"),
};

const specDocuments = [
  "spec.md",
  "plan.md",
  "data-model.md",
  "api-contract.md",
  "test-plan.md",
  "tasks.md",
  "security-notes.md",
];
const expectedPhases = [
  [0, "readiness"],
  [1, "authenticated-discovery-contract"],
  [2, "typed-openapi-client-contract"],
  [3, "admin-web-foundation"],
  [4, "auth-tenant-permissions"],
  [5, "api-client-layout"],
  [6, "residents-properties-ui"],
  [7, "finance-ui"],
  [8, "hardening-closure"],
];
const failures = [];
const read = (path) => readFileSync(path, "utf8");

for (const path of Object.values(paths)) {
  if (!existsSync(path))
    failures.push(`Missing Sprint 4 boundary artifact: ${path}.`);
}

if (failures.length === 0) {
  const manifest = JSON.parse(read(paths.manifest));
  const readiness = read(paths.readiness);
  const runbook = read(paths.runbook);
  const openapi = JSON.parse(read(paths.openapi));
  const client = read(paths.client);

  if (manifest.schemaVersion !== 1)
    failures.push("Sprint 4 manifest schemaVersion must be 1.");
  if (manifest.readinessDecision !== "NO_GO")
    failures.push(
      "Sprint 4 readiness must remain NO_GO while blocking gaps are open.",
    );
  if (manifest.currentPhase !== 0)
    failures.push("Sprint 4 NO_GO requires currentPhase = 0.");
  if (manifest.phases?.length !== expectedPhases.length) {
    failures.push("Sprint 4 must define exactly phases 0 through 8.");
  } else {
    for (const [index, [id, name]] of expectedPhases.entries()) {
      const phase = manifest.phases[index];
      if (
        phase.id !== id ||
        phase.name !== name ||
        !Array.isArray(phase.commands)
      ) {
        failures.push(
          `Sprint 4 phase ${id} must be named ${name} and define commands.`,
        );
      }
    }
  }

  if (!/\| Decision\s+\| `NO_GO`\s+\|/u.test(readiness))
    failures.push("Readiness must record Decision: `NO_GO`.");
  if (!/GAP-S4-001/u.test(readiness) || !/GAP-S4-002/u.test(readiness))
    failures.push("Readiness must identify both blocking Sprint 4 gaps.");
  for (const phrase of [
    "receipts/comprobantes",
    "dashboard",
    "Users/Roles",
    "PKCE S256",
    "FinancialManager",
    "Treasurer",
  ]) {
    if (!runbook.includes(phrase))
      failures.push(
        `Runbook must record the normalized decision for ${phrase}.`,
      );
  }

  const gapPaths = [
    resolve(
      repositoryRoot,
      "docs/changes/GAP-S4-001-AUTHENTICATED-DISCOVERY-CONTRACT-2026-09-12.md",
    ),
    resolve(
      repositoryRoot,
      "docs/changes/GAP-S4-002-TYPED-OPENAPI-CLIENT-CONTRACT-2026-09-12.md",
    ),
  ];
  for (const gapPath of gapPaths) {
    if (!existsSync(gapPath)) {
      failures.push(`Missing blocking gap: ${gapPath}.`);
      continue;
    }
    const gap = read(gapPath);
    if (
      !/\| Estado\s+\| `OPEN`\s+\|/u.test(gap) ||
      !/\| Severidad\s+\| Alta\s+\|/u.test(gap)
    )
      failures.push(`${gapPath} must remain OPEN with Alta severity.`);
  }

  let needsReviewCount = 0;
  for (const document of specDocuments) {
    const path = resolve(
      repositoryRoot,
      "docs/specs/029-admin-web-app-basic",
      document,
    );
    if (!existsSync(path)) {
      failures.push(`Missing Spec 029 document: ${document}.`);
      continue;
    }
    const contents = read(path);
    if (/\| Estado\s+\| needs-review/u.test(contents)) needsReviewCount += 1;
    if (!contents.includes("Normalización de readiness de Sprint 4"))
      failures.push(`${document} lacks the Sprint 4 readiness normalization.`);
  }
  if (needsReviewCount !== 7)
    failures.push(
      `All seven Spec 029 documents must remain needs-review; found ${needsReviewCount}.`,
    );

  const missingDiscoveryPaths = [
    "/api/v1/me",
    "/api/v1/me/tenants",
    "/api/v1/me/permissions",
    "/api/v1/me/tenants/{tenantSlug}/permissions",
  ].filter((path) => Object.hasOwn(openapi.paths ?? {}, path));
  if (missingDiscoveryPaths.length > 0)
    failures.push(
      `GAP-S4-001 cannot remain OPEN after discovery paths appear: ${missingDiscoveryPaths.join(", ")}.`,
    );
  if (!client.includes('OPENAPI_CLIENT_STATUS = "contract-only"'))
    failures.push(
      "GAP-S4-002 assumes the client remains contract-only at readiness.",
    );
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Sprint 4 boundary is valid at phase 0 (NO_GO); Spec 029 needs-review: 7; blocking gaps: 2.\n",
  );
}

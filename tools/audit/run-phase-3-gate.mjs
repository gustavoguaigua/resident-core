import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const composeFile = resolve(
  repositoryRoot,
  "infra/audit/docker-compose.test.yml",
);
const composeBase = [
  "compose",
  "--project-name",
  "resident-core-audit-phase3",
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const databaseUrl = `postgresql://resident_audit:${password}@127.0.0.1:55435/resident_audit?schema=public`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schemaPath = resolve(repositoryRoot, "prisma/schema.prisma");
const gateEnvironment = {
  ...process.env,
  AUDIT_PHASE3_DB_PASSWORD: password,
  DATABASE_URL: databaseUrl,
};

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: gateEnvironment,
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
  }
};

const runPrisma = (...args) => run(process.execPath, [prismaCli, ...args]);
const cleanup = () => {
  spawnSync(
    dockerExecutable,
    [...composeBase, "down", "--volumes", "--remove-orphans"],
    {
      cwd: repositoryRoot,
      env: gateEnvironment,
      stdio: "inherit",
    },
  );
};

let stackStarted = false;
try {
  run(dockerExecutable, ["version", "--format", "{{.Server.Version}}"]);
  cleanup();
  stackStarted = true;
  run(dockerExecutable, [
    ...composeBase,
    "up",
    "--detach",
    "--wait",
    "--wait-timeout",
    "120",
  ]);

  runPrisma("migrate", "deploy", "--schema", schemaPath);
  runPrisma("migrate", "status", "--schema", schemaPath);
  runPrisma(
    "migrate",
    "diff",
    "--exit-code",
    "--from-url",
    databaseUrl,
    "--to-schema-datamodel",
    schemaPath,
  );
  runPrisma("generate", "--schema", schemaPath);
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/audit-base.spec.ts",
    "apps/api/test/integration/audit-base.integration.spec.ts",
  ]);
  runPrisma("migrate", "deploy", "--schema", schemaPath);

  process.stdout.write(
    `${JSON.stringify({
      gate: "test:audit",
      postgres: "17.10-bookworm",
      migrationSource: "empty",
      drift: "none",
      atomicity: "passed",
      appendOnly: "passed",
      tenantIsolation: "passed",
      sanitization: "passed",
      status: "PASS",
    })}\n`,
  );
} finally {
  if (stackStarted) {
    cleanup();
  }
}

import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const composeFile = resolve(
  repositoryRoot,
  "infra/prisma/docker-compose.test.yml",
);
const composeBase = [
  "compose",
  "--project-name",
  "resident-core-sprint3-phase1",
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const databaseUrl = `postgresql://resident_phase2:${password}@127.0.0.1:55434/resident_phase2?schema=public`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const schemaPath = resolve(repositoryRoot, "prisma/schema.prisma");
const gateEnvironment = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  PRISMA_PHASE2_DB_PASSWORD: password,
};

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: gateEnvironment,
    stdio: "inherit",
    ...options,
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
    resolve(repositoryRoot, "tools/residents/test-phase-1-constraints.mjs"),
  ]);
  runPrisma("migrate", "deploy", "--schema", schemaPath);

  process.stdout.write(
    `${JSON.stringify({
      gate: "test:residents:persistence",
      postgres: "17.10-bookworm",
      migrationSource: "empty",
      drift: "none",
      constraints: "passed",
      tenantIsolation: "passed",
      status: "PASS",
    })}\n`,
  );
} finally {
  if (stackStarted) {
    cleanup();
  }
}

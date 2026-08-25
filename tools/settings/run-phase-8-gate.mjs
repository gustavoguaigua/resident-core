import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const containerName = "resident-core-settings-phase8-postgres";
const synthetic = () => `synthetic-${randomBytes(24).toString("base64url")}`;
const databasePassword = synthetic();
const databaseUrl = `postgresql://resident_bootstrap:${databasePassword}@127.0.0.1:55437/resident_bootstrap?schema=public`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schemaPath = resolve(repositoryRoot, "prisma/schema.prisma");
const gateEnvironment = {
  ...process.env,
  BOOTSTRAP_PHASE4_DB_PASSWORD: databasePassword,
  DATABASE_URL: databaseUrl,
  KEYCLOAK_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_ADMIN_USER: "phase8-admin",
  KEYCLOAK_PHASE4_DB_PASSWORD: synthetic(),
  SETTINGS_PHASE8_TEST: "1",
};

const execute = (command, args) =>
  spawnSync(command, args, {
    cwd: repositoryRoot,
    env: gateEnvironment,
    stdio: "inherit",
  });
const run = (command, args) => {
  const result = execute(command, args);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
  }
};
const runPrisma = (...args) => run(process.execPath, [prismaCli, ...args]);
const cleanup = () =>
  execute(dockerExecutable, ["rm", "--force", containerName]);
const canConnectToPostgres = () =>
  new Promise((resolveConnection) => {
    const socket = createConnection({ host: "127.0.0.1", port: 55437 });
    socket.setTimeout(1_000);
    socket.once("connect", () => {
      socket.destroy();
      resolveConnection(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolveConnection(false);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolveConnection(false);
    });
  });

const isPostgresReady = () => {
  const result = spawnSync(
    dockerExecutable,
    [
      "exec",
      containerName,
      "pg_isready",
      "--username",
      "resident_bootstrap",
      "--dbname",
      "resident_bootstrap",
    ],
    {
      cwd: repositoryRoot,
      env: gateEnvironment,
      stdio: "ignore",
    },
  );

  return !result.error && result.status === 0;
};

const waitForPostgres = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (isPostgresReady() && (await canConnectToPostgres())) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_000));
  }
  throw new Error("Phase 8 PostgreSQL did not become ready.");
};

let stackStarted = false;
try {
  run(dockerExecutable, ["version", "--format", "{{.Server.Version}}"]);
  cleanup();
  stackStarted = true;
  run(dockerExecutable, [
    "run",
    "--detach",
    "--name",
    containerName,
    "--publish",
    "127.0.0.1:55437:5432",
    "--tmpfs",
    "/var/lib/postgresql/data",
    "--env",
    "POSTGRES_DB=resident_bootstrap",
    "--env",
    "POSTGRES_USER=resident_bootstrap",
    "--env",
    `POSTGRES_PASSWORD=${databasePassword}`,
    "postgres:17.10-bookworm",
  ]);
  await waitForPostgres();
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
  run(process.execPath, ["tools/settings/seed-settings.mjs"]);
  run(process.execPath, ["tools/settings/seed-settings.mjs"]);
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/integration/tenant-settings.integration.spec.ts",
  ]);
  process.stdout.write(
    `${JSON.stringify({
      atomicAudit: "passed",
      catalog: ["general.locale"],
      gate: "test:settings",
      idempotency: "passed",
      migrationSource: "empty",
      multitenancy: "passed",
      postgres: "17.10-bookworm",
      status: "PASS",
      tenantConfiguration: "absent",
      typedValidation: "passed",
    })}\n`,
  );
} finally {
  if (stackStarted) cleanup();
}

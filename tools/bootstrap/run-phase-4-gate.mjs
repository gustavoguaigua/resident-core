import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const composeFile = resolve(
  repositoryRoot,
  "infra/bootstrap/docker-compose.test.yml",
);
const composeBase = [
  "compose",
  "--project-name",
  "resident-core-bootstrap-phase4",
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const synthetic = () => `synthetic-${randomBytes(24).toString("base64url")}`;
const corePassword = synthetic();
const baseDatabaseUrl = `postgresql://resident_bootstrap:${corePassword}@127.0.0.1:55437/resident_bootstrap`;
const databaseUrl = `${baseDatabaseUrl}?schema=public`;
const cliDatabaseUrl = `${baseDatabaseUrl}?schema=bootstrap_cli`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const tsxCli = resolve(repositoryRoot, "node_modules/tsx/dist/cli.mjs");
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schemaPath = resolve(repositoryRoot, "prisma/schema.prisma");
const bootstrapCommand = resolve(
  repositoryRoot,
  "apps/api/tools/bootstrap-platform-admin.ts",
);
const apiTsconfig = resolve(repositoryRoot, "apps/api/tsconfig.json");
const gateEnvironment = {
  ...process.env,
  BOOTSTRAP_PHASE4_DB_PASSWORD: corePassword,
  BOOTSTRAP_PHASE4_TEST: "1",
  BOOTSTRAP_CLI_DATABASE_URL: cliDatabaseUrl,
  DATABASE_URL: databaseUrl,
  KEYCLOAK_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_ADMIN_USER: "phase4-admin",
  KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET: synthetic(),
  KEYCLOAK_ISSUER: "http://localhost:18084/realms/resident",
  KEYCLOAK_PHASE4_DB_PASSWORD: synthetic(),
  KEYCLOAK_PLATFORM_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_REALM: "resident",
  KEYCLOAK_RESIDENT_USER_PASSWORD: synthetic(),
  KEYCLOAK_TENANT_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_URL: "http://localhost:18084",
};

const execute = (command, args, environment = gateEnvironment) =>
  spawnSync(command, args, {
    cwd: repositoryRoot,
    env: environment,
    stdio: "inherit",
  });

const run = (command, args, environment = gateEnvironment) => {
  const result = execute(command, args, environment);
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
  }
};

const runPrisma = (database, ...args) =>
  run(process.execPath, [prismaCli, ...args], {
    ...gateEnvironment,
    DATABASE_URL: database,
  });

const runBootstrapCommand = (email, database) =>
  run(
    process.execPath,
    [tsxCli, "--tsconfig", apiTsconfig, bootstrapCommand, "--email", email],
    {
      ...gateEnvironment,
      DATABASE_URL: database,
    },
  );

const expectBootstrapFailure = (email, expectedCode, database) => {
  const result = spawnSync(
    process.execPath,
    [tsxCli, "--tsconfig", apiTsconfig, bootstrapCommand, "--email", email],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...gateEnvironment, DATABASE_URL: database },
    },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status === 0 || result.stderr.trim() !== expectedCode) {
    throw new Error(`Expected bootstrap failure ${expectedCode}.`);
  }
};

const cleanup = () => {
  execute(dockerExecutable, [
    ...composeBase,
    "down",
    "--volumes",
    "--remove-orphans",
  ]);
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
    "180",
  ]);

  run(process.execPath, ["tools/keycloak/bootstrap-local.mjs"]);
  runPrisma(databaseUrl, "migrate", "deploy", "--schema", schemaPath);
  runPrisma(cliDatabaseUrl, "migrate", "deploy", "--schema", schemaPath);
  runPrisma(databaseUrl, "migrate", "status", "--schema", schemaPath);
  runPrisma(
    databaseUrl,
    "migrate",
    "diff",
    "--exit-code",
    "--from-url",
    databaseUrl,
    "--to-schema-datamodel",
    schemaPath,
  );
  runPrisma(databaseUrl, "generate", "--schema", schemaPath);

  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/bootstrap-platform-admin.spec.ts",
    "apps/api/test/integration/bootstrap-platform-admin.integration.spec.ts",
  ]);

  runBootstrapCommand("platform.admin@example.com", cliDatabaseUrl);
  runBootstrapCommand("platform.admin@example.com", cliDatabaseUrl);
  expectBootstrapFailure(
    "tenant.admin@example.com",
    "BOOTSTRAP_ALREADY_COMPLETED",
    cliDatabaseUrl,
  );
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/integration/bootstrap-platform-admin-cli.integration.spec.ts",
  ]);

  process.stdout.write(
    `${JSON.stringify({
      auditAtomicity: "passed",
      commandSurface: "one-shot-email-only",
      concurrency: "passed",
      gate: "test:bootstrap",
      idempotency: "passed",
      identityProvider: "keycloak-26.7.0",
      postgres: "17.10-bookworm",
      privilegeScope: "PlatformAdmin-global-only",
      status: "PASS",
    })}\n`,
  );
} finally {
  if (stackStarted) {
    cleanup();
  }
}

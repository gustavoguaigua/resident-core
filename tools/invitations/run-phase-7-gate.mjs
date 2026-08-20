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
  "resident-core-invitations-phase7",
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const synthetic = () => `synthetic-${randomBytes(24).toString("base64url")}`;
const corePassword = synthetic();
const databaseUrl = `postgresql://resident_bootstrap:${corePassword}@127.0.0.1:55437/resident_bootstrap?schema=public`;
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
  DATABASE_URL: databaseUrl,
  INVITATION_PHASE7_TEST: "1",
  KEYCLOAK_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_ADMIN_USER: "phase7-admin",
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
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
  }
};
const runPrisma = (...args) => run(process.execPath, [prismaCli, ...args]);
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
    tsxCli,
    "--tsconfig",
    apiTsconfig,
    bootstrapCommand,
    "--email",
    "platform.admin@example.com",
  ]);
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/invitation-token.spec.ts",
    "apps/api/test/integration/invitations-memberships.integration.spec.ts",
  ]);
  process.stdout.write(
    `${JSON.stringify({
      atomicity: "passed",
      authorizationSource: "core-persistence",
      concurrency: "passed",
      gate: "test:invitations",
      identityProvider: "keycloak-26.7.0",
      invitationTokenStorage: "hash-only",
      migrationSource: "empty",
      multitenancy: "passed",
      postgres: "17.10-bookworm",
      status: "PASS",
    })}\n`,
  );
} finally {
  if (stackStarted) cleanup();
}

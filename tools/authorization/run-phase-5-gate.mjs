import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
const modes = {
  authorization: {
    port: 55438,
    project: "resident-core-authorization-phase5",
    tests: [
      "apps/api/test/keycloak-access-token-verifier.spec.ts",
      "apps/api/test/integration/identity-authorization.integration.spec.ts",
    ],
  },
  multitenancy: {
    port: 55439,
    project: "resident-core-multitenancy-phase5",
    tests: [
      "apps/api/test/integration/multitenancy-authorization.integration.spec.ts",
    ],
  },
};
const selected = modes[mode];
if (selected === undefined) {
  throw new Error("Phase 5 gate mode must be authorization or multitenancy.");
}

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const composeFile = resolve(
  repositoryRoot,
  "infra/authorization/docker-compose.test.yml",
);
const composeBase = [
  "compose",
  "--project-name",
  selected.project,
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const databaseUrl = `postgresql://resident_authorization:${password}@127.0.0.1:${selected.port}/resident_authorization?schema=public`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const typescriptCli = resolve(
  repositoryRoot,
  "node_modules/typescript/bin/tsc",
);
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schemaPath = resolve(repositoryRoot, "prisma/schema.prisma");
const gateEnvironment = {
  ...process.env,
  AUTHORIZATION_PHASE5_DB_PASSWORD: password,
  AUTHORIZATION_PHASE5_DB_PORT: String(selected.port),
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
  runPrisma("generate", "--schema", schemaPath);
  run(process.execPath, [
    typescriptCli,
    "--project",
    resolve(repositoryRoot, "packages/auth/tsconfig.build.json"),
  ]);
  run(process.execPath, [vitestCli, "run", ...selected.tests]);

  process.stdout.write(
    `${JSON.stringify({
      gate: `test:${mode}`,
      postgres: "17.10-bookworm",
      migrationSource: "empty",
      authorizationSource: "core-persistence",
      failClosed: "passed",
      status: "PASS",
    })}\n`,
  );
} finally {
  if (stackStarted) {
    cleanup();
  }
}

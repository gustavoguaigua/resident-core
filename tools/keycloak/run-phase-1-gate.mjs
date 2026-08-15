import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { invariant } from "./lib.mjs";

const mode = process.argv[2];
invariant(
  mode === "verify" || mode === "test",
  "Usage: node tools/keycloak/run-phase-1-gate.mjs <verify|test>",
);

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const composeFile = resolve(
  repositoryRoot,
  "infra/keycloak/docker-compose.test.yml",
);
const composeBase = [
  "compose",
  "--project-name",
  "resident-core-keycloak-phase1",
  "--file",
  composeFile,
];
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const synthetic = () => "synthetic-" + randomBytes(24).toString("base64url");
const gateEnvironment = {
  ...process.env,
  KEYCLOAK_URL: "http://localhost:8080",
  KEYCLOAK_ISSUER: "http://localhost:8080/realms/resident",
  KEYCLOAK_REALM: "resident",
  KEYCLOAK_ADMIN_USER: "phase1-admin",
  KEYCLOAK_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_PHASE1_DB_PASSWORD: synthetic(),
  KEYCLOAK_IDENTITY_ADMIN_CLIENT_SECRET: synthetic(),
  KEYCLOAK_PLATFORM_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_TENANT_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_RESIDENT_USER_PASSWORD: synthetic(),
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
  invariant(
    result.status === 0,
    command + " " + args.join(" ") + " failed with " + result.status + ".",
  );
};

const runNode = (script) =>
  run(process.execPath, [resolve(repositoryRoot, script)]);
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
    "180",
  ]);
  runNode("tools/keycloak/bootstrap-local.mjs");
  runNode("tools/keycloak/verify-realm.mjs");

  if (mode === "verify") {
    run(dockerExecutable, [...composeBase, "restart", "keycloak-test"]);
    run(dockerExecutable, [
      ...composeBase,
      "up",
      "--detach",
      "--wait",
      "--wait-timeout",
      "180",
    ]);
    runNode("tools/keycloak/bootstrap-local.mjs");
    runNode("tools/keycloak/verify-realm.mjs");
  } else {
    runNode("tools/keycloak/test-oidc.mjs");
  }

  process.stdout.write(
    JSON.stringify({
      gate: mode === "verify" ? "keycloak:verify" : "test:keycloak",
      keycloak: "26.7.0",
      realm: "resident",
      status: "PASS",
    }) + "\n",
  );
} finally {
  if (stackStarted) {
    cleanup();
  }
}

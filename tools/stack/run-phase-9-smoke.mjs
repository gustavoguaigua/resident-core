import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const dockerExecutable = process.platform === "win32" ? "docker.exe" : "docker";
const projectName = "resident-core-sprint2-phase9";
const apiPort = "33009";
const compose = ["compose", "--project-name", projectName];
const synthetic = () => `synthetic-${randomBytes(24).toString("base64url")}`;
const environment = {
  ...process.env,
  API_PORT: apiPort,
  KEYCLOAK_ADMIN_PASSWORD: synthetic(),
  KEYCLOAK_DB_PASSWORD: synthetic(),
  KEYCLOAK_DB_PORT: "55440",
  MINIO_CONSOLE_PORT: "59001",
  MINIO_ROOT_PASSWORD: synthetic(),
  POSTGRES_PASSWORD: synthetic(),
  POSTGRES_PORT: "55439",
  REDIS_PORT: "56379",
  SMTP_PORT: "51025",
  MAILHOG_UI_PORT: "58025",
};

const execute = (args, stdio = "inherit") =>
  spawnSync(dockerExecutable, args, {
    cwd: repositoryRoot,
    env: environment,
    stdio,
  });
const run = (args) => {
  const result = execute(args);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`docker ${args.join(" ")} failed with ${result.status}.`);
  }
};
const cleanup = () =>
  execute([...compose, "down", "--volumes", "--remove-orphans"]);

let stackStarted = false;
try {
  run(["version", "--format", "{{.Server.Version}}"]);
  cleanup();
  stackStarted = true;
  run([
    ...compose,
    "up",
    "--build",
    "--detach",
    "--wait",
    "--wait-timeout",
    "240",
  ]);

  const response = await fetch(`http://127.0.0.1:${apiPort}/api/v1/health`);
  if (!response.ok) {
    throw new Error(`resident-api health returned HTTP ${response.status}.`);
  }

  const services = execute(
    [...compose, "ps", "--services", "--status", "running"],
    "pipe",
  );
  if (services.error) throw services.error;
  if (services.status !== 0) {
    throw new Error("Unable to inspect the Sprint 2 stack.");
  }
  const running = services.stdout
    .toString()
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  if (running.length !== 7) {
    throw new Error(`Expected 7 running services, found ${running.length}.`);
  }

  process.stdout.write(
    `${JSON.stringify({ gate: "test:stack:smoke", services: running.sort(), status: "PASS" })}\n`,
  );
} finally {
  if (stackStarted) cleanup();
}

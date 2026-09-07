import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const suffix = randomBytes(5).toString("hex");
const postgresContainer = `resident-phase7-postgres-${suffix}`;
const postgresPort = 56628;
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const databaseUrl = `postgresql://phase7:${password}@127.0.0.1:${postgresPort}/phase7?schema=public`;
const environment = {
  ...process.env,
  ALLOCATIONS_PHASE7_TEST: "1",
  APP_ENV: "test",
  DATABASE_URL: databaseUrl,
};
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schema = resolve(repositoryRoot, "prisma/schema.prisma");
const execute = (command, args, stdio = "inherit") =>
  spawnSync(command, args, { cwd: repositoryRoot, env: environment, stdio });
const run = (command, args) => {
  const result = execute(command, args);
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
};
const prisma = (...args) => run(process.execPath, [prismaCli, ...args]);
const remove = () =>
  execute(docker, ["rm", "--force", postgresContainer], "ignore");
const connectable = () =>
  new Promise((resolveConnection) => {
    const socket = createConnection({ host: "127.0.0.1", port: postgresPort });
    socket.setTimeout(1_000);
    const finish = (value) => {
      socket.destroy();
      resolveConnection(value);
    };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });

let started = false;
try {
  run(docker, ["version", "--format", "{{.Server.Version}}"]);
  const services = execute(docker, ["compose", "config", "--services"], "pipe");
  if (
    services.status !== 0 ||
    services.stdout.toString().trim().split(/\r?\n/u).length !== 7
  )
    throw new Error("Sprint 3 requires exactly seven Compose services.");
  started = true;
  run(docker, [
    "run",
    "--detach",
    "--name",
    postgresContainer,
    "--publish",
    `127.0.0.1:${postgresPort}:5432`,
    "--tmpfs",
    "/var/lib/postgresql/data",
    "--env",
    "POSTGRES_DB=phase7",
    "--env",
    "POSTGRES_USER=phase7",
    "--env",
    `POSTGRES_PASSWORD=${password}`,
    "postgres:17.10-bookworm",
  ]);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await connectable()) break;
    if (attempt === 59)
      throw new Error("Phase 7 PostgreSQL did not become ready.");
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_000));
  }
  prisma("migrate", "deploy", "--schema", schema);
  prisma("migrate", "status", "--schema", schema);
  prisma(
    "migrate",
    "diff",
    "--exit-code",
    "--from-url",
    databaseUrl,
    "--to-schema-datamodel",
    schema,
  );
  prisma("migrate", "deploy", "--schema", schema);
  prisma("generate", "--schema", schema);
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/integration/payment-allocations.integration.spec.ts",
  ]);
  process.stdout.write(
    `${JSON.stringify({ gate: "test:allocations", postgres: "17.10-bookworm", status: "PASS" })}\n`,
  );
} finally {
  if (started) remove();
}

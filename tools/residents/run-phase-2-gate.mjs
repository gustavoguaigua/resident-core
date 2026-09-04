import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const suite = process.argv[2];
if (!new Set(["functional", "authorization"]).has(suite)) {
  throw new Error("Expected functional or authorization Phase 2 suite.");
}
const repositoryRoot = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const port = suite === "functional" ? 55438 : 55439;
const container = `resident-core-sprint3-phase2-${suite}`;
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const databaseUrl = `postgresql://resident_phase2:${password}@127.0.0.1:${port}/resident_phase2?schema=public`;
const prismaCli = resolve(repositoryRoot, "node_modules/prisma/build/index.js");
const vitestCli = resolve(repositoryRoot, "node_modules/vitest/vitest.mjs");
const schema = resolve(repositoryRoot, "prisma/schema.prisma");
const environment = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  RESIDENTS_PHASE2_SUITE: suite,
};

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
const cleanup = () => execute(docker, ["rm", "--force", container], "ignore");
const ready = () =>
  execute(
    docker,
    [
      "exec",
      container,
      "pg_isready",
      "--username",
      "resident_phase2",
      "--dbname",
      "resident_phase2",
    ],
    "ignore",
  ).status === 0;
const connectable = () =>
  new Promise((resolveConnection) => {
    const socket = createConnection({ host: "127.0.0.1", port });
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
  cleanup();
  started = true;
  run(docker, [
    "run",
    "--detach",
    "--name",
    container,
    "--publish",
    `127.0.0.1:${port}:5432`,
    "--tmpfs",
    "/var/lib/postgresql/data",
    "--env",
    "POSTGRES_DB=resident_phase2",
    "--env",
    "POSTGRES_USER=resident_phase2",
    "--env",
    `POSTGRES_PASSWORD=${password}`,
    "postgres:17.10-bookworm",
  ]);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (ready() && (await connectable())) break;
    if (attempt === 59)
      throw new Error("Phase 2 PostgreSQL did not become ready.");
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
  prisma("generate", "--schema", schema);
  run(process.execPath, [
    vitestCli,
    "run",
    "apps/api/test/integration/residents-properties.integration.spec.ts",
  ]);
  process.stdout.write(
    `${JSON.stringify({ gate: suite === "functional" ? "test:residents" : "test:residents:authorization", postgres: "17.10-bookworm", status: "PASS" })}\n`,
  );
} finally {
  if (started) cleanup();
}

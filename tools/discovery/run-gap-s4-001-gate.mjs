import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const suffix = randomBytes(5).toString("hex");
const container = `resident-sprint4-discovery-${suffix}`;
const port = 56631;
const password = `synthetic-${randomBytes(24).toString("base64url")}`;
const url = `postgresql://discovery:${password}@127.0.0.1:${port}/discovery?schema=public`;
const env = {
  ...process.env,
  APP_ENV: "test",
  AUTHENTICATED_DISCOVERY_TEST: "1",
  DATABASE_URL: url,
};
const prisma = resolve(root, "node_modules/prisma/build/index.js");
const vitest = resolve(root, "node_modules/vitest/vitest.mjs");
const schema = resolve(root, "prisma/schema.prisma");
const exec = (command, args, stdio = "inherit") =>
  spawnSync(command, args, { cwd: root, env, stdio });
const run = (command, args) => {
  const result = exec(command, args);
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed with ${result.status}.`,
    );
};
const prismaRun = (...args) => run(process.execPath, [prisma, ...args]);
const remove = () => exec(docker, ["rm", "--force", container], "ignore");
const ready = () =>
  new Promise((resolveReady) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(1000);
    const done = (value) => {
      socket.destroy();
      resolveReady(value);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    socket.once("timeout", () => done(false));
  });

let started = false;
try {
  run(docker, ["version", "--format", "{{.Server.Version}}"]);
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
    "POSTGRES_DB=discovery",
    "--env",
    "POSTGRES_USER=discovery",
    "--env",
    `POSTGRES_PASSWORD=${password}`,
    "postgres:17.10-bookworm",
  ]);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await ready()) break;
    if (attempt === 59)
      throw new Error(
        "Authenticated discovery PostgreSQL did not become ready.",
      );
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  prismaRun("migrate", "deploy", "--schema", schema);
  prismaRun("migrate", "status", "--schema", schema);
  prismaRun(
    "migrate",
    "diff",
    "--exit-code",
    "--from-url",
    url,
    "--to-schema-datamodel",
    schema,
  );
  prismaRun("generate", "--schema", schema);
  run(process.execPath, [
    vitest,
    "run",
    "apps/api/test/integration/authenticated-discovery.integration.spec.ts",
  ]);
  process.stdout.write(
    `${JSON.stringify({ gate: "test:admin-discovery", postgres: "17.10-bookworm", status: "PASS" })}\n`,
  );
} finally {
  if (started) remove();
}

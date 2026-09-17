import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "../..");
const packageRoot = resolve(root, "packages/openapi-client");

for (const [script, args, cwd] of [
  [resolve(packageRoot, "tools/check-generated.mjs"), [], packageRoot],
  [
    resolve(packageRoot, "node_modules/@redocly/cli/bin/cli.js"),
    ["lint", "--config", "redocly.yaml", "openapi/resident-core.v1.json"],
    packageRoot,
  ],
  [resolve(root, "node_modules/vitest/vitest.mjs"), ["run"], packageRoot],
  [
    resolve(root, "node_modules/typescript/bin/tsc"),
    ["-p", "tsconfig.json", "--noEmit"],
    packageRoot,
  ],
]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

process.stdout.write("GAP-S4-002 typed OpenAPI client gate: PASS.\n");

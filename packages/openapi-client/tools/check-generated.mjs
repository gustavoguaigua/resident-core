import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";

import { generateClient } from "./generate-client.mjs";

const packageRoot = resolve(import.meta.dirname, "..");
const committed = process.env.OPENAPI_CLIENT_OUTPUT_PATH
  ? resolve(process.env.OPENAPI_CLIENT_OUTPUT_PATH)
  : resolve(packageRoot, "src/generated/resident-core.ts");
const source = process.env.OPENAPI_CLIENT_SOURCE_PATH
  ? resolve(process.env.OPENAPI_CLIENT_SOURCE_PATH)
  : resolve(packageRoot, "openapi/resident-core.v1.json");
const temporary = mkdtempSync(join(tmpdir(), "resident-openapi-client-"));
const first = resolve(temporary, "first.ts");
const second = resolve(temporary, "second.ts");
const generator = process.env.OPENAPI_CLIENT_GENERATOR_PATH
  ? resolve(process.env.OPENAPI_CLIENT_GENERATOR_PATH)
  : resolve(packageRoot, "node_modules/openapi-typescript/bin/cli.js");

try {
  let expected;
  try {
    expected = readFileSync(committed, "utf8");
  } catch {
    throw new Error(
      "Generated client is missing. Run `pnpm --filter @resident/openapi-client generate`.",
    );
  }
  generate(first);
  generate(second);
  const firstResult = readFileSync(first, "utf8");
  const secondResult = readFileSync(second, "utf8");
  if (firstResult !== secondResult) {
    throw new Error("OpenAPI client generation is not reproducible.");
  }
  if (expected !== firstResult) {
    throw new Error(
      "Generated client is missing or stale. Run `pnpm --filter @resident/openapi-client generate`.",
    );
  }
  process.stdout.write(
    "Generated OpenAPI client is reproducible and current.\n",
  );
} finally {
  rmSync(temporary, { force: true, recursive: true });
}

function generate(output) {
  generateClient({ generator, output, source });
}

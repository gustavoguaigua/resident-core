import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const packageRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(packageRoot, "../..");
const canonicalOutput = resolve(packageRoot, "src/generated/resident-core.ts");
const defaultSource = resolve(packageRoot, "openapi/resident-core.v1.json");
const defaultGenerator = resolve(
  packageRoot,
  "node_modules/openapi-typescript/bin/cli.js",
);
const prettier = resolve(
  repositoryRoot,
  "node_modules/prettier/bin/prettier.cjs",
);
const prettierConfig = resolve(repositoryRoot, ".prettierrc.json");

export function generateClient({
  generator = defaultGenerator,
  output = canonicalOutput,
  source = defaultSource,
} = {}) {
  const temporary = mkdtempSync(join(tmpdir(), "resident-openapi-client-raw-"));
  const rawOutput = resolve(temporary, "resident-core.ts");

  try {
    run(
      generator,
      [source, "-o", rawOutput],
      "OpenAPI TypeScript generation failed.",
    );
    const formatted = run(
      prettier,
      ["--config", prettierConfig, "--stdin-filepath", canonicalOutput],
      "Generated client formatting failed.",
      readFileSync(rawOutput, "utf8"),
    );
    writeFileSync(output, formatted, "utf8");
  } finally {
    rmSync(temporary, { force: true, recursive: true });
  }
}

function run(script, args, fallback, input) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: packageRoot,
    encoding: "utf8",
    ...(input === undefined ? {} : { input }),
  });
  if (result.status !== 0)
    throw new Error(result.stderr || result.stdout || fallback);
  return result.stdout;
}

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateClient();
  process.stdout.write(`Generated ${canonicalOutput}\n`);
}

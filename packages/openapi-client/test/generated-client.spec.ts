import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const packageRoot = resolve(import.meta.dirname, "..");
const checker = resolve(packageRoot, "tools/check-generated.mjs");
const source = resolve(packageRoot, "openapi/resident-core.v1.json");
const output = resolve(packageRoot, "src/generated/resident-core.ts");
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0))
    rmSync(directory, { force: true, recursive: true });
});

describe("generated client drift gate", () => {
  it("rejects a missing generated output", () => {
    const directory = temporaryDirectory();
    const result = check({ output: resolve(directory, "missing.ts") });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Generated client is missing");
  });

  it("rejects manual changes to generated output", () => {
    const directory = temporaryDirectory();
    const changed = resolve(directory, "changed.ts");
    writeFileSync(changed, `${readFileSync(output, "utf8")}\n// manual\n`);
    const result = check({ output: changed });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Generated client is missing or stale");
  }, 15_000);

  it("rejects an OpenAPI change without regeneration", () => {
    const directory = temporaryDirectory();
    const changedSource = resolve(directory, "openapi.json");
    const contract = JSON.parse(readFileSync(source, "utf8")) as {
      components: { schemas: Record<string, unknown> };
    };
    contract.components.schemas.DriftProbe = { type: "string" };
    writeFileSync(changedSource, JSON.stringify(contract));
    const result = check({ source: changedSource });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Generated client is missing or stale");
  }, 15_000);

  it("rejects non-reproducible generation", () => {
    const directory = temporaryDirectory();
    const generator = resolve(directory, "generator.mjs");
    writeFileSync(
      generator,
      'import { writeFileSync } from "node:fs"; const i=process.argv.indexOf("-o"); writeFileSync(process.argv[i+1], String(Math.random()));',
    );
    const result = check({ generator });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("generation is not reproducible");
  });
});

function temporaryDirectory() {
  const directory = mkdtempSync(resolve(tmpdir(), "resident-client-gate-"));
  temporaryDirectories.push(directory);
  return directory;
}

function check(overrides: {
  generator?: string;
  output?: string;
  source?: string;
}) {
  return spawnSync(process.execPath, [checker], {
    cwd: packageRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ...(overrides.generator
        ? { OPENAPI_CLIENT_GENERATOR_PATH: overrides.generator }
        : {}),
      ...(overrides.output
        ? { OPENAPI_CLIENT_OUTPUT_PATH: overrides.output }
        : {}),
      ...(overrides.source
        ? { OPENAPI_CLIENT_SOURCE_PATH: overrides.source }
        : {}),
    },
  });
}

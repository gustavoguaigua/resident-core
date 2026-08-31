import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const verifier = resolve(
  repositoryRoot,
  "packages/testing/tools/verify-sprint-3-boundary.mjs",
);
const temporaryDirectories: string[] = [];

const createTemporaryDirectory = () => {
  const directory = mkdtempSync(
    resolve(tmpdir(), "resident-sprint3-boundary-"),
  );
  temporaryDirectories.push(directory);
  return directory;
};

const runVerifier = (environment: NodeJS.ProcessEnv = {}) =>
  spawnSync(process.execPath, [verifier], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, ...environment },
  });

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("Sprint 3 boundary verifier", () => {
  it("accepts the current documented NO_GO phase 0 boundary", () => {
    const result = runVerifier();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Sprint 3 boundary is valid at phase 0 (NO_GO); applicable documents: 35, needs-review: 0.",
    );
  });

  it("rejects a Sprint 3 Prisma model during phase 0", () => {
    const directory = createTemporaryDirectory();
    const schemaPath = resolve(directory, "schema.prisma");
    writeFileSync(
      schemaPath,
      `${readFileSync(resolve(repositoryRoot, "prisma/schema.prisma"), "utf8")}\nmodel Person {\n  id String @id\n}\n`,
      "utf8",
    );

    const result = runVerifier({ SPRINT3_SCHEMA_PATH: schemaPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 3 phase 0 forbids domain models: Person.",
    );
  });

  it("rejects a Sprint 3 OpenAPI path during phase 0", () => {
    const directory = createTemporaryDirectory();
    const openApiPath = resolve(directory, "openapi.json");
    const openApi = JSON.parse(
      readFileSync(
        resolve(
          repositoryRoot,
          "packages/openapi-client/openapi/resident-core.v1.json",
        ),
        "utf8",
      ),
    ) as { paths: Record<string, unknown> };
    openApi.paths["/api/v1/tenant/persons"] = { get: {} };
    writeFileSync(openApiPath, JSON.stringify(openApi), "utf8");

    const result = runVerifier({ SPRINT3_OPENAPI_PATH: openApiPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 3 phase 0 forbids functional API operations: GET /api/v1/tenant/persons.",
    );
  });

  it("rejects an added Sprint 3 phase 10", () => {
    const directory = createTemporaryDirectory();
    const manifestPath = resolve(directory, "sprint-3-gates.json");
    const manifest = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, "packages/testing/config/sprint-3-gates.json"),
        "utf8",
      ),
    ) as { phases: unknown[] };
    manifest.phases.push({ id: 10, name: "unexpected", commands: [] });
    writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");

    const result = runVerifier({ SPRINT3_MANIFEST_PATH: manifestPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 3 must define exactly phases 0 through 9.",
    );
  });
});

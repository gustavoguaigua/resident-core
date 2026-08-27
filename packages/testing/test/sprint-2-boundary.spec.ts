import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const verifier = resolve(
  repositoryRoot,
  "packages/testing/tools/verify-sprint-2-boundary.mjs",
);
const temporaryDirectories: string[] = [];

const createTemporaryDirectory = () => {
  const directory = mkdtempSync(
    resolve(tmpdir(), "resident-sprint2-boundary-"),
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

describe("Sprint 2 boundary verifier", () => {
  it("accepts the current GO repository boundary", () => {
    const result = runVerifier();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Sprint 2 boundary is valid at phase 9 (GO).",
    );
  });

  it("rejects a Prisma model outside the Sprint 2 allowlist", () => {
    const directory = createTemporaryDirectory();
    const schemaPath = resolve(directory, "schema.prisma");
    writeFileSync(
      schemaPath,
      `${readFileSync(resolve(repositoryRoot, "prisma/schema.prisma"), "utf8")}\nmodel Payment {\n  id String @id\n}\n`,
      "utf8",
    );

    const result = runVerifier({ SPRINT2_SCHEMA_PATH: schemaPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Prisma model outside Sprint 2 boundary: Payment.",
    );
  });

  it("rejects an OpenAPI operation outside the Sprint 2 allowlist", () => {
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
    openApi.paths["/api/v1/payments"] = { get: {} };
    writeFileSync(openApiPath, JSON.stringify(openApi), "utf8");

    const result = runVerifier({ SPRINT2_OPENAPI_PATH: openApiPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "OpenAPI operation outside Sprint 2 boundary: GET /api/v1/payments.",
    );
  });
});

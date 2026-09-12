import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const verifier = resolve(
  repositoryRoot,
  "packages/testing/tools/verify-sprint-4-boundary.mjs",
);
const temporaryDirectories: string[] = [];

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

describe("Sprint 4 readiness boundary", () => {
  it("accepts phase 0 NO_GO with two blocking gaps", () => {
    const result = runVerifier();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Sprint 4 boundary is valid at phase 0 (NO_GO); Spec 029 needs-review: 7; blocking gaps: 2.",
    );
  });

  it("rejects advancing currentPhase while readiness is NO_GO", () => {
    const directory = mkdtempSync(
      resolve(tmpdir(), "resident-sprint4-boundary-"),
    );
    temporaryDirectories.push(directory);
    const manifestPath = resolve(directory, "sprint-4-gates.json");
    const manifest = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, "packages/testing/config/sprint-4-gates.json"),
        "utf8",
      ),
    ) as { currentPhase: number };
    manifest.currentPhase = 1;
    writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");

    const result = runVerifier({ SPRINT4_MANIFEST_PATH: manifestPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 4 NO_GO requires currentPhase = 0.",
    );
  });
});

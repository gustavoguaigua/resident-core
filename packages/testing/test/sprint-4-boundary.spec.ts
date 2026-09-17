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
  it("accepts phase 2 GO with both readiness gaps closed", () => {
    const result = runVerifier();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Sprint 4 boundary is valid at phase 2 (GO); Spec 029 accepted: 7; blocking gaps: 0.",
    );
  });

  it("rejects advancing currentPhase before frontend foundation exists", () => {
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
    manifest.currentPhase = 3;
    writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");

    const result = runVerifier({ SPRINT4_MANIFEST_PATH: manifestPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 4 must remain at phase 2 until frontend foundation begins.",
    );
  });

  it("rejects a readiness regression after both blockers close", () => {
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
    ) as { readinessDecision: string };
    manifest.readinessDecision = "NO_GO";
    writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");

    const result = runVerifier({ SPRINT4_MANIFEST_PATH: manifestPath });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Sprint 4 readiness must be GO after both blocking gaps close.",
    );
  });
});

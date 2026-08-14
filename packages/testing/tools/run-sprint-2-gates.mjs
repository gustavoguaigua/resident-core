import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const manifest = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "packages/testing/config/sprint-2-gates.json"),
    "utf8",
  ),
);
const rootPackage = JSON.parse(
  readFileSync(resolve(repositoryRoot, "package.json"), "utf8"),
);
const evidencePath = resolve(
  repositoryRoot,
  process.env.SPRINT2_EVIDENCE_PATH ?? "artifacts/sprint-2-gates/evidence.json",
);
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  readinessDecision: manifest.readinessDecision,
  currentPhase: manifest.currentPhase,
  commit: process.env.GITHUB_SHA ?? null,
  runId: process.env.GITHUB_RUN_ID ?? null,
  results: [],
};

const writeEvidence = () => {
  mkdirSync(dirname(evidencePath), { recursive: true });
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
};

const pnpmExecutable = process.env.npm_execpath;
const runPnpmScript = (script) => {
  if (!rootPackage.scripts?.[script]) {
    evidence.results.push({ script, status: "missing" });
    writeEvidence();
    throw new Error(`Active Sprint 2 gate script is missing: ${script}.`);
  }

  const command = pnpmExecutable ? process.execPath : "pnpm";
  const args = pnpmExecutable
    ? [pnpmExecutable, "run", script]
    : ["run", script];
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
    shell: !pnpmExecutable && process.platform === "win32",
  });

  evidence.results.push({
    script,
    status: result.status === 0 ? "passed" : "failed",
    exitCode: result.status,
  });
  writeEvidence();

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

runPnpmScript("sprint2:boundary");

for (const phase of manifest.phases) {
  if (phase.id > manifest.currentPhase) {
    evidence.results.push({
      phase: phase.id,
      name: phase.name,
      status: "not-active",
    });
    continue;
  }
  for (const script of phase.commands) {
    runPnpmScript(script);
  }
}

writeEvidence();
process.stdout.write(`Sprint 2 gate evidence: ${evidencePath}\n`);

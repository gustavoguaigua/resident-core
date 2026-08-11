import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GITLEAKS_IMAGE =
  "ghcr.io/gitleaks/gitleaks:v8.27.2@sha256:ebfeb6fd4f2c37fa371d3731ebfa662fdf80f93cd37d3b4771bb82263edff8d0";
const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const repositoryMount = `${repositoryRoot}:/repo:ro`;

const scans = [
  ["git", "/repo", "--log-opts=--all"],
  ["dir", "/repo"],
];

for (const scanArguments of scans) {
  const result = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "--volume",
      repositoryMount,
      GITLEAKS_IMAGE,
      ...scanArguments,
      "--no-banner",
      "--no-color",
      "--redact=100",
    ],
    { stdio: "inherit" },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const schema = readFileSync(
  resolve(repositoryRoot, "prisma/schema.prisma"),
  "utf8",
);
const openApi = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      "packages/openapi-client/openapi/resident-core.v1.json",
    ),
    "utf8",
  ),
);

const failures = [];

if (/^\s*(model|enum)\s+/mu.test(schema)) {
  failures.push("Prisma contains a domain model or enum.");
}

for (const relativePath of [
  "prisma/migrations",
  "prisma/seed.ts",
  "prisma/seed.js",
]) {
  if (existsSync(resolve(repositoryRoot, relativePath))) {
    failures.push(`Forbidden Sprint 1 artifact exists: ${relativePath}`);
  }
}

const expectedPaths = ["/api/v1/health", "/api/v1/health/details"];
const actualPaths = Object.keys(openApi.paths).sort();

if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
  failures.push(
    `Unexpected runtime endpoints: ${actualPaths.join(", ") || "none"}`,
  );
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

process.stdout.write(
  "Sprint 1 boundary is intact: no domain schema, migrations, seeds, or endpoints.\n",
);

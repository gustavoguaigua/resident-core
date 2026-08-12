import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const artifactPath = resolve(
  import.meta.dirname,
  "../../../packages/openapi-client/openapi/resident-core.v1.json",
);

async function main(): Promise<void> {
  process.env.NODE_ENV ??= "test";
  process.env.APP_ENV ??= "local";
  process.env.DATABASE_URL ??=
    "postgresql://resident@127.0.0.1:5432/resident_core";

  const { generateOpenApiArtifact } =
    await import("../src/platform/openapi/openapi-artifact.js");
  const generatedArtifact = await generateOpenApiArtifact();

  if (process.argv.includes("--check")) {
    await assertArtifactIsCurrent(generatedArtifact);
    return;
  }

  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, generatedArtifact, "utf8");
  process.stdout.write(`Generated ${artifactPath}\n`);
}

async function assertArtifactIsCurrent(
  generatedArtifact: string,
): Promise<void> {
  let committedArtifact: string;

  try {
    committedArtifact = await readFile(artifactPath, "utf8");
  } catch {
    throw new Error(
      "The canonical OpenAPI artifact is missing. Run pnpm openapi:generate.",
    );
  }

  if (committedArtifact !== generatedArtifact) {
    throw new Error(
      "The canonical OpenAPI artifact is stale. Run pnpm openapi:generate and commit the result.",
    );
  }

  process.stdout.write("OpenAPI artifact is current.\n");
}

await main();

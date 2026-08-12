import { afterAll, describe, expect, it, vi } from "vitest";

const previousDatabaseUrl = vi.hoisted(() => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL =
    "postgresql://resident:synthetic-test-only@127.0.0.1:5432/resident_core";
  return previous;
});

import { serializeOpenApiDocument } from "../src/platform/openapi/openapi-artifact.js";

describe("OpenAPI artifact serialization", () => {
  afterAll(() => {
    restoreDatabaseUrl(previousDatabaseUrl);
  });

  it("sorts object keys recursively and preserves array order", () => {
    const document = {
      openapi: "3.0.0",
      info: { version: "1", title: "Example" },
      paths: {
        "/z": {
          get: {
            responses: { "200": { description: "OK" } },
            tags: ["z", "a"],
          },
        },
        "/a": { get: { responses: { "200": { description: "OK" } } } },
      },
    };

    const serialized = serializeOpenApiDocument(document);

    expect(serialized).toBe(
      `${JSON.stringify(
        {
          info: { title: "Example", version: "1" },
          openapi: "3.0.0",
          paths: {
            "/a": { get: { responses: { "200": { description: "OK" } } } },
            "/z": {
              get: {
                responses: { "200": { description: "OK" } },
                tags: ["z", "a"],
              },
            },
          },
        },
        null,
        2,
      )}\n`,
    );
  });
});

function restoreDatabaseUrl(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = value;
  }
}

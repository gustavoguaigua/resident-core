import type { OpenAPIObject } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "../../app.module.js";
import { API_GLOBAL_PREFIX } from "../http/application-bootstrap.js";
import { createOpenApiDocument } from "./openapi-document.js";

type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export async function generateOpenApiArtifact(): Promise<string> {
  const application = await NestFactory.create(AppModule, { logger: false });
  application.setGlobalPrefix(API_GLOBAL_PREFIX);

  try {
    return serializeOpenApiDocument(createOpenApiDocument(application));
  } finally {
    await application.close();
  }
}

export function serializeOpenApiDocument(document: OpenAPIObject): string {
  return `${JSON.stringify(
    sortJsonValue(document as unknown as JsonValue),
    null,
    2,
  )}\n`;
}

function sortJsonValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonValue(item));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, item]) => [key, sortJsonValue(item)]),
    );
  }

  return value;
}

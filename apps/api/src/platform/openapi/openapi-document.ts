import type { INestApplication } from "@nestjs/common";
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from "@nestjs/swagger";

import type { ApplicationEnvironment } from "@resident/config";

export const OPENAPI_DOCUMENT_PATH = "docs";
export const OPENAPI_JSON_PATH = "docs-json";

export function shouldExposeOpenApi(
  environment: Pick<ApplicationEnvironment, "APP_ENV">,
): boolean {
  return (
    environment.APP_ENV === "local" || environment.APP_ENV === "development"
  );
}

export function createOpenApiDocument(
  application: INestApplication,
): OpenAPIObject {
  const configuration = new DocumentBuilder()
    .setTitle("RESIDENT Core API")
    .setDescription("Technical runtime contract for RESIDENT Core.")
    .setVersion("0.1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Keycloak-issued access token.",
      },
      "bearerAuth",
    )
    .addTag("Health", "Operational liveness and readiness endpoints.")
    .build();

  return SwaggerModule.createDocument(application, configuration);
}

export function configureOpenApi(
  application: INestApplication,
  environment: Pick<ApplicationEnvironment, "APP_ENV">,
): OpenAPIObject | undefined {
  if (!shouldExposeOpenApi(environment)) {
    return undefined;
  }

  const document = createOpenApiDocument(application);

  SwaggerModule.setup(OPENAPI_DOCUMENT_PATH, application, document, {
    customSiteTitle: "RESIDENT Core API Docs",
    jsonDocumentUrl: OPENAPI_JSON_PATH,
    raw: ["json"],
    useGlobalPrefix: true,
  });

  return document;
}

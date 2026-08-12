import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import type { ApplicationEnvironment } from "@resident/config";

import { AppModule } from "./app.module.js";
import { APPLICATION_CONFIG_NAMESPACE } from "./platform/config/application-config.js";
import { configureApplication } from "./platform/http/application-bootstrap.js";
import { SanitizedLogger } from "./platform/logging/sanitized-logger.service.js";
import { configureOpenApi } from "./platform/openapi/openapi-document.js";

async function bootstrap(): Promise<void> {
  const logger = new SanitizedLogger();

  try {
    const app = await NestFactory.create(AppModule, { logger });
    const config = app.get(ConfigService);
    const environment = config.getOrThrow<ApplicationEnvironment>(
      APPLICATION_CONFIG_NAMESPACE,
    );

    configureApplication(app, logger);
    configureOpenApi(app, environment);
    await app.listen(environment.API_PORT, "0.0.0.0");

    logger.log({
      event: "api_started",
      applicationEnvironment: environment.APP_ENV,
      port: environment.API_PORT,
    });
  } catch (error) {
    logger.error({ event: "api_startup_failed", error });
    process.exitCode = 1;
  }
}

void bootstrap();

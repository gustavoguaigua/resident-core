import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost } from "@nestjs/core";
import helmet from "helmet";

import type { ApplicationEnvironment } from "@resident/config";

import { APPLICATION_CONFIG_NAMESPACE } from "../config/application-config.js";
import { SecureExceptionFilter } from "./secure-exception.filter.js";
import { traceContextMiddleware } from "./trace-context.js";
import type { SanitizedLogger } from "../logging/sanitized-logger.service.js";

export function createStrictValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  });
}

export function configureApplication(
  application: INestApplication,
  logger: SanitizedLogger,
): void {
  const config = application.get(ConfigService);
  const environment = config.getOrThrow<ApplicationEnvironment>(
    APPLICATION_CONFIG_NAMESPACE,
  );
  const allowedOrigins = new Set(environment.CORS_ALLOWED_ORIGINS);

  application.setGlobalPrefix("api/v1");
  application.use(traceContextMiddleware);
  application.use(helmet());
  application.enableCors({
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, origin === undefined || allowedOrigins.has(origin));
    },
  });
  application.useGlobalPipes(createStrictValidationPipe());
  application.useGlobalFilters(
    new SecureExceptionFilter(application.get(HttpAdapterHost), logger),
  );
  application.enableShutdownHooks();
}

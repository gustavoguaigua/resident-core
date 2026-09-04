import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
  type LoggerService,
} from "@nestjs/common";
import type { HttpAdapterHost } from "@nestjs/core";

import { getOrCreateTraceId } from "./trace-context.js";

interface ErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details: readonly string[] | null;
    readonly traceId: string;
  };
}

@Catch()
export class SecureExceptionFilter implements ExceptionFilter {
  public constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<unknown>();
    const response = httpContext.getResponse<unknown>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const traceId = getOrCreateTraceId(request);
    const code = getErrorCode(exception, status);
    const envelope: ErrorEnvelope = {
      error: {
        code,
        message: getSafeMessage(status),
        details: getSafeDetails(exception, status),
        traceId,
      },
    };

    const logEvent = {
      event: "http_request_failed",
      status,
      code,
      traceId,
      exceptionName:
        exception instanceof Error ? exception.name : "UnknownException",
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logEvent);
    } else {
      this.logger.warn(logEvent);
    }

    this.adapterHost.httpAdapter.reply(response, envelope, status);
  }
}

function getErrorCode(exception: unknown, status: number): string {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    if (
      typeof response === "object" &&
      response !== null &&
      "code" in response &&
      typeof response.code === "string" &&
      /^[A-Z][A-Z0-9_]{2,63}$/u.test(response.code)
    ) {
      return response.code;
    }
  }
  const enumName = HttpStatus[status];

  return typeof enumName === "string" ? enumName : "HTTP_ERROR";
}

function getSafeMessage(status: number): string {
  if (status === HttpStatus.BAD_REQUEST) {
    return "Request validation failed";
  }

  if (status === HttpStatus.UNAUTHORIZED) {
    return "Authentication is required";
  }

  if (status === HttpStatus.FORBIDDEN) {
    return "Access is forbidden";
  }

  if (status === HttpStatus.NOT_FOUND) {
    return "Resource not found";
  }

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    return "Too many requests";
  }

  if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return "An internal error occurred";
  }

  return "The request could not be completed";
}

function getSafeDetails(
  exception: unknown,
  status: number,
): readonly string[] | null {
  if (
    !(exception instanceof HttpException) ||
    status !== HttpStatus.BAD_REQUEST
  ) {
    return null;
  }

  const response = exception.getResponse();

  if (
    typeof response === "object" &&
    response !== null &&
    "message" in response &&
    Array.isArray(response.message) &&
    response.message.length > 0
  ) {
    return ["One or more request fields are invalid or unsupported"];
  }

  return null;
}

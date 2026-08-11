import { ConsoleLogger, Injectable } from "@nestjs/common";
import type { LoggerService } from "@nestjs/common";

import { sanitizeLogValue } from "./sanitize-log-value.js";

@Injectable()
export class SanitizedLogger implements LoggerService {
  public constructor(
    private readonly delegate: LoggerService = new ConsoleLogger(
      "resident-api",
    ),
  ) {}

  public log(message: unknown, ...optionalParameters: unknown[]): void {
    this.delegate.log(
      sanitizeLogValue(message),
      ...optionalParameters.map(sanitizeLogValue),
    );
  }

  public error(message: unknown, ...optionalParameters: unknown[]): void {
    this.delegate.error(
      sanitizeLogValue(message),
      ...optionalParameters.map(sanitizeLogValue),
    );
  }

  public warn(message: unknown, ...optionalParameters: unknown[]): void {
    this.delegate.warn(
      sanitizeLogValue(message),
      ...optionalParameters.map(sanitizeLogValue),
    );
  }

  public debug(message: unknown, ...optionalParameters: unknown[]): void {
    this.delegate.debug?.(
      sanitizeLogValue(message),
      ...optionalParameters.map(sanitizeLogValue),
    );
  }

  public verbose(message: unknown, ...optionalParameters: unknown[]): void {
    this.delegate.verbose?.(
      sanitizeLogValue(message),
      ...optionalParameters.map(sanitizeLogValue),
    );
  }
}

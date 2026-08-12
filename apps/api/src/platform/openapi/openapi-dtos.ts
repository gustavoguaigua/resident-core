import { ApiProperty } from "@nestjs/swagger";

export class HealthLivenessResponseDto {
  @ApiProperty({ enum: ["ok"] })
  public readonly status!: "ok";

  @ApiProperty({ enum: ["resident-api"] })
  public readonly service!: "resident-api";

  @ApiProperty({ format: "date-time", type: String })
  public readonly timestamp!: string;
}

export class PostgresHealthCheckResponseDto {
  @ApiProperty({ enum: ["ok", "unavailable"] })
  public readonly status!: "ok" | "unavailable";
}

export class InactiveHealthCheckResponseDto {
  @ApiProperty({ enum: ["notConfigured"] })
  public readonly status!: "notConfigured";
}

export class HealthReadinessChecksDto {
  @ApiProperty({ type: PostgresHealthCheckResponseDto })
  public readonly postgres!: PostgresHealthCheckResponseDto;

  @ApiProperty({ type: InactiveHealthCheckResponseDto })
  public readonly redis!: InactiveHealthCheckResponseDto;

  @ApiProperty({ type: InactiveHealthCheckResponseDto })
  public readonly storage!: InactiveHealthCheckResponseDto;

  @ApiProperty({ type: InactiveHealthCheckResponseDto })
  public readonly keycloak!: InactiveHealthCheckResponseDto;
}

export class HealthReadinessResponseDto {
  @ApiProperty({ enum: ["ok", "degraded"] })
  public readonly status!: "ok" | "degraded";

  @ApiProperty({ enum: ["resident-api"] })
  public readonly service!: "resident-api";

  @ApiProperty({ type: HealthReadinessChecksDto })
  public readonly checks!: HealthReadinessChecksDto;

  @ApiProperty({ format: "date-time", type: String })
  public readonly timestamp!: string;
}

export class ApiErrorDto {
  @ApiProperty({ example: "FORBIDDEN", type: String })
  public readonly code!: string;

  @ApiProperty({ example: "Access denied.", type: String })
  public readonly message!: string;

  @ApiProperty({ example: null, isArray: true, nullable: true, type: String })
  public readonly details!: readonly string[] | null;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: String,
  })
  public readonly traceId!: string;
}

export class ApiErrorEnvelopeDto {
  @ApiProperty({ type: ApiErrorDto })
  public readonly error!: ApiErrorDto;
}

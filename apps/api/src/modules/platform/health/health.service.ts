import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service.js";

export type HealthCheckStatus = "ok" | "unavailable" | "notConfigured";

export interface LivenessResponse {
  readonly status: "ok";
  readonly service: "resident-api";
  readonly timestamp: string;
}

export interface ReadinessResponse {
  readonly status: "ok" | "degraded";
  readonly service: "resident-api";
  readonly checks: {
    readonly postgres: { readonly status: HealthCheckStatus };
    readonly redis: { readonly status: "notConfigured" };
    readonly storage: { readonly status: "notConfigured" };
    readonly keycloak: { readonly status: "notConfigured" };
  };
  readonly timestamp: string;
}

@Injectable()
export class HealthService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public getLiveness(): LivenessResponse {
    return {
      status: "ok",
      service: "resident-api",
      timestamp: new Date().toISOString(),
    };
  }

  public async getReadiness(): Promise<ReadinessResponse> {
    const postgresAvailable = await this.prisma.isAvailable();

    return {
      status: postgresAvailable ? "ok" : "degraded",
      service: "resident-api",
      checks: {
        postgres: { status: postgresAvailable ? "ok" : "unavailable" },
        redis: { status: "notConfigured" },
        storage: { status: "notConfigured" },
        keycloak: { status: "notConfigured" },
      },
      timestamp: new Date().toISOString(),
    };
  }
}

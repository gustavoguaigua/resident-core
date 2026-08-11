import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Res,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

import { HealthDetailsAccessGuard } from "./health-details-access.guard.js";
import {
  HealthService,
  type LivenessResponse,
  type ReadinessResponse,
} from "./health.service.js";

interface StatusResponse {
  status(statusCode: number): void;
}

@Controller("health")
export class HealthController {
  public constructor(
    @Inject(HealthService) private readonly health: HealthService,
  ) {}

  @Get()
  @SkipThrottle()
  public getLiveness(): LivenessResponse {
    return this.health.getLiveness();
  }

  @Get("details")
  @SkipThrottle()
  @UseGuards(HealthDetailsAccessGuard)
  public async getReadiness(
    @Res({ passthrough: true }) response: StatusResponse,
  ): Promise<ReadinessResponse> {
    const readiness = await this.health.getReadiness();

    if (readiness.status === "degraded") {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return readiness;
  }
}

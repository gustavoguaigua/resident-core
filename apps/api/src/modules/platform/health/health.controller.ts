import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Res,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import {
  ApiBearerAuth,
  ApiExtension,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";

import {
  ApiErrorEnvelopeDto,
  HealthLivenessResponseDto,
  HealthReadinessResponseDto,
} from "../../../platform/openapi/openapi-dtos.js";

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
@ApiTags("Health")
export class HealthController {
  public constructor(
    @Inject(HealthService) private readonly health: HealthService,
  ) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({
    operationId: "healthLiveness",
    security: [],
    summary: "Report API process liveness",
  })
  @ApiOkResponse({
    description: "The API process is alive.",
    type: HealthLivenessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: "An uncontrolled platform failure occurred.",
    type: ApiErrorEnvelopeDto,
  })
  @ApiExtension("x-response-envelope", false)
  @ApiExtension("x-health-endpoint", true)
  @ApiExtension("x-auth-required", false)
  @ApiExtension("x-platform-only", false)
  @ApiExtension("x-tenant-context-required", false)
  @ApiExtension("x-public", true)
  public getLiveness(): LivenessResponse {
    return this.health.getLiveness();
  }

  @Get("details")
  @SkipThrottle()
  @UseGuards(HealthDetailsAccessGuard)
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    operationId: "healthReadiness",
    summary: "Report platform dependency readiness",
    description:
      "Local environments allow direct access. Other environments fail closed until the platform authorization adapter is introduced.",
  })
  @ApiOkResponse({
    description: "All configured platform dependencies are ready.",
    type: HealthReadinessResponseDto,
  })
  @ApiForbiddenResponse({
    description: "The caller is not authorized to inspect platform readiness.",
    type: ApiErrorEnvelopeDto,
  })
  @ApiServiceUnavailableResponse({
    description: "At least one configured platform dependency is unavailable.",
    type: HealthReadinessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: "An uncontrolled platform failure occurred.",
    type: ApiErrorEnvelopeDto,
  })
  @ApiExtension("x-response-envelope", false)
  @ApiExtension("x-health-endpoint", true)
  @ApiExtension("x-auth-required", true)
  @ApiExtension("x-platform-only", true)
  @ApiExtension("x-tenant-context-required", false)
  @ApiExtension("x-public", false)
  @ApiExtension("x-required-permission", "platform.health.read")
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

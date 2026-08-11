import { Module } from "@nestjs/common";

import { HealthController } from "./health.controller.js";
import { HealthDetailsAccessGuard } from "./health-details-access.guard.js";
import { HealthService } from "./health.service.js";

@Module({
  controllers: [HealthController],
  providers: [HealthDetailsAccessGuard, HealthService],
})
export class HealthModule {}

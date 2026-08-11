import {
  ForbiddenException,
  Inject,
  Injectable,
  type CanActivate,
} from "@nestjs/common";

import type { ApplicationEnvironment } from "@resident/config";

import { applicationConfig } from "../../../platform/config/application-config.js";

@Injectable()
export class HealthDetailsAccessGuard implements CanActivate {
  public constructor(
    @Inject(applicationConfig.KEY)
    private readonly environment: ApplicationEnvironment,
  ) {}

  public canActivate(): boolean {
    if (this.environment.APP_ENV !== "local") {
      throw new ForbiddenException();
    }

    return true;
  }
}

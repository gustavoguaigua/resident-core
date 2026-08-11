import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import {
  type ApplicationEnvironment,
  validateApplicationEnvironment,
} from "@resident/config";

import { applicationConfig } from "./platform/config/application-config.js";

const applicationConfigModule = ConfigModule.forRoot({
  cache: true,
  isGlobal: true,
  load: [applicationConfig],
  validate: validateApplicationEnvironment,
});

@Module({
  imports: [
    applicationConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [applicationConfig.KEY],
      imports: [applicationConfigModule],
      useFactory: (config: ApplicationEnvironment) => [
        {
          limit: config.RATE_LIMIT_LIMIT,
          ttl: config.RATE_LIMIT_TTL_MS,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

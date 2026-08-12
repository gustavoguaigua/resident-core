import { Module } from "@nestjs/common";

import { AUDIT_RECORDER_PORT } from "./audit-recorder.port.js";
import { TechnicalAuditInterceptor } from "./technical-audit.interceptor.js";
import { UnavailableAuditRecorder } from "./unavailable-audit-recorder.js";

@Module({
  exports: [AUDIT_RECORDER_PORT, TechnicalAuditInterceptor],
  providers: [
    TechnicalAuditInterceptor,
    {
      provide: AUDIT_RECORDER_PORT,
      useClass: UnavailableAuditRecorder,
    },
  ],
})
export class AuditModule {}

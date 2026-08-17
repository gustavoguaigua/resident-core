import { Module } from "@nestjs/common";

import { PrismaModule } from "../../platform/database/prisma.module.js";
import { AUDIT_RECORDER_PORT } from "./audit-recorder.port.js";
import { AUDIT_WRITER_PORT } from "./audit-writer.port.js";
import { PrismaAuditWriter } from "./prisma-audit-writer.js";
import { TechnicalAuditInterceptor } from "./technical-audit.interceptor.js";
import { UnavailableAuditRecorder } from "./unavailable-audit-recorder.js";

@Module({
  imports: [PrismaModule],
  exports: [AUDIT_RECORDER_PORT, AUDIT_WRITER_PORT, TechnicalAuditInterceptor],
  providers: [
    TechnicalAuditInterceptor,
    {
      provide: AUDIT_WRITER_PORT,
      useClass: PrismaAuditWriter,
    },
    {
      provide: AUDIT_RECORDER_PORT,
      useClass: UnavailableAuditRecorder,
    },
  ],
})
export class AuditModule {}

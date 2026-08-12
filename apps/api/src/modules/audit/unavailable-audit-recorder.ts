import { Injectable } from "@nestjs/common";

import type {
  AuditRecorderPort,
  AuditRecordResult,
  TechnicalAuditEvent,
} from "./audit-recorder.port.js";

@Injectable()
export class UnavailableAuditRecorder implements AuditRecorderPort {
  public async record(event: TechnicalAuditEvent): Promise<AuditRecordResult> {
    void event;
    return { status: "notConfigured" };
  }
}

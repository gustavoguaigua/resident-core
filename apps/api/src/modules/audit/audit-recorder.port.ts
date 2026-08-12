export interface TechnicalAuditEvent {
  readonly action: string;
  readonly occurredAt: string;
  readonly outcome: "succeeded";
  readonly traceId: string;
}

export interface AuditRecordResult {
  readonly status: "notConfigured";
}

export interface AuditRecorderPort {
  record(event: TechnicalAuditEvent): Promise<AuditRecordResult>;
}

export const AUDIT_RECORDER_PORT = Symbol("AUDIT_RECORDER_PORT");

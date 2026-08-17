import type { Prisma } from "@prisma/client";

import type {
  DomainAuditEvent,
  ValidatedAuditContext,
} from "./domain-audit-event.js";

export type AuditTransaction = Pick<
  Prisma.TransactionClient,
  "auditLog" | "userTenantMembership"
>;

export interface DeniedAuditWriteResult {
  readonly persisted: boolean;
}

export interface AuditWriterPort {
  recordConfirmed(
    transaction: AuditTransaction,
    context: ValidatedAuditContext,
    event: DomainAuditEvent,
  ): Promise<void>;

  recordDenied(
    context: ValidatedAuditContext,
    event: DomainAuditEvent,
  ): Promise<DeniedAuditWriteResult>;
}

export const AUDIT_WRITER_PORT = Symbol("AUDIT_WRITER_PORT");

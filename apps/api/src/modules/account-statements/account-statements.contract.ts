export interface StatementActorContext {
  readonly membershipId: string;
  readonly tenantId: string;
  readonly userProfileId: string;
}

export type StatementErrorCode =
  | "ACCESS_DENIED"
  | "FINANCIAL_CURRENCY_MISMATCH"
  | "FINANCIAL_DRIFT_DETECTED"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_STATE_CONFLICT"
  | "UNSUPPORTED_TENANT_CURRENCY"
  | "VALIDATION_ERROR";

export class StatementError extends Error {
  public constructor(public readonly code: StatementErrorCode) {
    super(code);
  }
}

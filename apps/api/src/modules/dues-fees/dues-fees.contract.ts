export interface DuesActorContext {
  readonly membershipId: string;
  readonly tenantId: string;
  readonly userProfileId: string;
}

export type DuesErrorCode =
  | "ACCESS_DENIED"
  | "CROSS_TENANT_REFERENCE"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_STATE_CONFLICT"
  | "UNSUPPORTED_TENANT_CURRENCY"
  | "VALIDATION_ERROR";

export class DuesFeesError extends Error {
  public constructor(public readonly code: DuesErrorCode) {
    super(code);
  }
}

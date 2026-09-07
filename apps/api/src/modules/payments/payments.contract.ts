export interface PaymentActorContext {
  readonly membershipId: string;
  readonly tenantId: string;
  readonly userProfileId: string;
}

export type PaymentErrorCode =
  | "ACCESS_DENIED"
  | "CROSS_TENANT_REFERENCE"
  | "DOCUMENT_NOT_AVAILABLE"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_STATE_CONFLICT"
  | "SEPARATION_OF_DUTIES_VIOLATION"
  | "UNSUPPORTED_TENANT_CURRENCY"
  | "VALIDATION_ERROR";

export class PaymentError extends Error {
  public constructor(public readonly code: PaymentErrorCode) {
    super(code);
  }
}

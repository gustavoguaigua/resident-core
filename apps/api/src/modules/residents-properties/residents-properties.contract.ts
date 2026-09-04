export interface ResidentsActorContext {
  readonly membershipId: string;
  readonly tenantId: string;
  readonly userProfileId: string;
}

export type ResidentsErrorCode =
  | "ACCESS_DENIED"
  | "CROSS_TENANT_REFERENCE"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_STATE_CONFLICT"
  | "VALIDATION_ERROR";

export class ResidentsPropertiesError extends Error {
  public constructor(public readonly code: ResidentsErrorCode) {
    super(code);
  }
}

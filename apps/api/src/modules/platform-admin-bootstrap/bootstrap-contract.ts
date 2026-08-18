export type BootstrapErrorCode =
  | "BOOTSTRAP_ALREADY_COMPLETED"
  | "BOOTSTRAP_INVALID_INPUT"
  | "BOOTSTRAP_ROLE_INVALID"
  | "BOOTSTRAP_STATE_INVALID"
  | "IDENTITY_LINK_CONFLICT"
  | "IDENTITY_NOT_ELIGIBLE"
  | "IDENTITY_NOT_PROVISIONED"
  | "IDENTITY_PROVIDER_UNAVAILABLE"
  | "IDENTITY_RESOLUTION_AMBIGUOUS"
  | "IDENTITY_SUBJECT_INVALID";

export class PlatformAdminBootstrapError extends Error {
  public constructor(public readonly code: BootstrapErrorCode) {
    super(code);
    this.name = "PlatformAdminBootstrapError";
  }
}

export interface VerifiedPlatformIdentity {
  readonly subject: string;
  readonly email: string;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly emailVerified: boolean;
}

export interface PlatformIdentityLookupPort {
  resolveByEmail(email: string): Promise<VerifiedPlatformIdentity>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function normalizeBootstrapEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    throw new PlatformAdminBootstrapError("BOOTSTRAP_INVALID_INPUT");
  }
  return email;
}

export function parseBootstrapArguments(arguments_: readonly string[]): {
  readonly email: string;
} {
  if (arguments_.length !== 2 || arguments_[0] !== "--email") {
    throw new PlatformAdminBootstrapError("BOOTSTRAP_INVALID_INPUT");
  }
  return { email: normalizeBootstrapEmail(arguments_[1] ?? "") };
}

import type { TenantStatus } from "@prisma/client";

export type TenantLifecycleErrorCode =
  | "IDENTITY_LINK_CONFLICT"
  | "IDENTITY_NOT_ELIGIBLE"
  | "IDENTITY_NOT_PROVISIONED"
  | "IDENTITY_PROVIDER_UNAVAILABLE"
  | "IDENTITY_RESOLUTION_AMBIGUOUS"
  | "IDENTITY_SUBJECT_INVALID"
  | "TENANT_CANNOT_BE_ACTIVATED"
  | "TENANT_INVALID_INPUT"
  | "TENANT_NOT_FOUND"
  | "TENANT_PERMISSION_DENIED"
  | "TENANT_SLUG_ALREADY_EXISTS"
  | "TENANT_STATUS_TRANSITION_INVALID";

export class TenantLifecycleError extends Error {
  public constructor(public readonly code: TenantLifecycleErrorCode) {
    super(code);
    this.name = "TenantLifecycleError";
  }
}

export interface TenantInitialAdminIdentity {
  readonly subject: string;
  readonly email: string;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly emailVerified: boolean;
}

export interface TenantInitialAdminIdentityPort {
  resolveByEmail(email: string): Promise<TenantInitialAdminIdentity>;
}

export const TENANT_INITIAL_ADMIN_IDENTITY_PORT = Symbol(
  "TENANT_INITIAL_ADMIN_IDENTITY_PORT",
);

export interface CreateTenantInput {
  readonly name: string;
  readonly legalName?: string;
  readonly slug?: string;
  readonly timezone?: string;
  readonly currency?: string;
  readonly initialAdmin: { readonly email: string };
  readonly profile?: {
    readonly displayName?: string;
    readonly slogan?: string;
    readonly description?: string;
    readonly contactEmail?: string;
    readonly contactPhone?: string;
    readonly whatsapp?: string;
    readonly address?: string;
    readonly city?: string;
    readonly province?: string;
    readonly country?: string;
  };
  readonly branding?: {
    readonly logoUrl?: string;
    readonly bannerUrl?: string;
    readonly primaryColor?: string;
    readonly secondaryColor?: string;
    readonly accentColor?: string;
  };
  readonly wordpressMapping?: {
    readonly wordpressSiteUrl?: string;
    readonly wordpressConjuntoSlug?: string;
    readonly wordpressConjuntoId?: string;
    readonly accessUrl?: string;
    readonly isActive?: boolean;
  };
}

export interface TenantLifecycleResult {
  readonly id: string;
  readonly slug: string;
  readonly status: TenantStatus;
  readonly updatedAt: Date;
  readonly suspendedAt: Date | null;
  readonly suspensionReason: string | null;
  readonly archivedAt: Date | null;
}

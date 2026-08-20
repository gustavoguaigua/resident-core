import type { InvitationStatus, MembershipStatus } from "@prisma/client";

export interface TenantActorContext {
  readonly userProfileId: string;
  readonly membershipId: string;
  readonly tenantId: string;
}

export interface CreateInvitationInput {
  readonly email: string;
  readonly roleId: string;
  readonly message?: string;
  readonly expiresInHours?: number;
}

export interface InvitationRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly role: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
  };
  readonly status: InvitationStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
}

export interface MembershipRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly userProfileId: string;
  readonly status: MembershipStatus;
  readonly joinedAt: Date | null;
  readonly revokedAt: Date | null;
}

export type InvitationsMembershipsErrorCode =
  | "ACCESS_DENIED"
  | "IDENTITY_EMAIL_MISMATCH"
  | "IDENTITY_NOT_PROVISIONED"
  | "INVITATION_ALREADY_EXISTS"
  | "INVITATION_ALREADY_USED"
  | "INVITATION_CANCELLED"
  | "INVITATION_EXPIRED"
  | "INVITATION_INVALID_INPUT"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_REVOKED"
  | "MEMBERSHIP_ALREADY_EXISTS"
  | "MEMBERSHIP_NOT_FOUND"
  | "MEMBERSHIP_ROLE_ALREADY_ASSIGNED"
  | "MEMBERSHIP_ROLE_NOT_FOUND"
  | "MEMBERSHIP_STATUS_INVALID"
  | "ROLE_NOT_ASSIGNABLE"
  | "TENANT_ADMIN_REQUIRED"
  | "TENANT_NOT_ACTIVE";

export class InvitationsMembershipsError extends Error {
  public constructor(public readonly code: InvitationsMembershipsErrorCode) {
    super(code);
  }
}

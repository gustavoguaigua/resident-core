import { Prisma } from "@prisma/client";

const tenantEvent = (
  resourceType: string,
  metadata: "none" | "changedFields" | "status",
) =>
  ({
    actor: "USER",
    category: "TENANT",
    metadata,
    outcome: "SUCCESS",
    resourceType,
    tenantRequired: true,
  }) as const;

export const AUDIT_CATALOG = {
  "platformAdmin.bootstrap.completed": {
    category: "PLATFORM",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "none",
    tenantRequired: false,
    actor: "SYSTEM",
  },
  "tenant.created": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "none",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.baseRoles.created": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Role",
    metadata: "none",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.updated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "changedFields",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.activated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.suspended": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.reactivated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.archived": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "Tenant",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.profile.updated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "TenantProfile",
    metadata: "changedFields",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.branding.updated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "TenantBranding",
    metadata: "changedFields",
    tenantRequired: true,
    actor: "USER",
  },
  "tenant.wordpressMapping.updated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "TenantWordPressMapping",
    metadata: "changedFields",
    tenantRequired: true,
    actor: "USER",
  },
  "tenantSetting.updated": {
    category: "TENANT",
    outcome: "SUCCESS",
    resourceType: "TenantSettingValue",
    metadata: "changedFields",
    tenantRequired: true,
    actor: "USER",
  },
  "propertyUnit.created": tenantEvent("PropertyUnit", "none"),
  "propertyUnit.updated": tenantEvent("PropertyUnit", "changedFields"),
  "propertyUnit.statusChanged": tenantEvent("PropertyUnit", "status"),
  "propertyUnit.archived": tenantEvent("PropertyUnit", "status"),
  "person.created": tenantEvent("Person", "none"),
  "person.updated": tenantEvent("Person", "changedFields"),
  "person.statusChanged": tenantEvent("Person", "status"),
  "person.archived": tenantEvent("Person", "status"),
  "person.identityLinked": tenantEvent("Person", "none"),
  "person.identityUnlinked": tenantEvent("Person", "none"),
  "legalEntity.created": tenantEvent("LegalEntity", "none"),
  "legalEntity.updated": tenantEvent("LegalEntity", "changedFields"),
  "legalEntity.statusChanged": tenantEvent("LegalEntity", "status"),
  "legalEntity.archived": tenantEvent("LegalEntity", "status"),
  "propertyOwnership.created": tenantEvent("PropertyOwnership", "none"),
  "propertyOwnership.updated": tenantEvent(
    "PropertyOwnership",
    "changedFields",
  ),
  "propertyOwnership.disputed": tenantEvent("PropertyOwnership", "status"),
  "propertyOwnership.resolved": tenantEvent("PropertyOwnership", "status"),
  "propertyOwnership.ended": tenantEvent("PropertyOwnership", "status"),
  "propertyOwnership.archived": tenantEvent("PropertyOwnership", "status"),
  "residency.created": tenantEvent("Residency", "none"),
  "residency.updated": tenantEvent("Residency", "changedFields"),
  "residency.suspended": tenantEvent("Residency", "status"),
  "residency.reactivated": tenantEvent("Residency", "status"),
  "residency.ended": tenantEvent("Residency", "status"),
  "residency.archived": tenantEvent("Residency", "status"),
  "lease.created": tenantEvent("Lease", "none"),
  "lease.updated": tenantEvent("Lease", "changedFields"),
  "lease.activated": tenantEvent("Lease", "status"),
  "lease.cancelled": tenantEvent("Lease", "status"),
  "lease.ended": tenantEvent("Lease", "status"),
  "lease.archived": tenantEvent("Lease", "status"),
  "chargeConcept.created": tenantEvent("ChargeConcept", "none"),
  "chargeConcept.updated": tenantEvent("ChargeConcept", "changedFields"),
  "chargeConcept.archived": tenantEvent("ChargeConcept", "status"),
  "feeSchedule.created": tenantEvent("FeeSchedule", "none"),
  "feeSchedule.updated": tenantEvent("FeeSchedule", "changedFields"),
  "feeSchedule.archived": tenantEvent("FeeSchedule", "status"),
  "unitFee.assigned": tenantEvent("UnitFee", "none"),
  "unitFee.ended": tenantEvent("UnitFee", "status"),
  "billingPeriod.created": tenantEvent("BillingPeriod", "none"),
  "document.uploadFinalized": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "USER",
  },
  "document.compensationFailed": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "SYSTEM",
  },
  "document.orphanDetected": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "SYSTEM",
  },
  "document.orphanReconciled": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "SYSTEM",
  },
  "document.quarantined": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "USER_OR_SYSTEM",
  },
  "document.rejected": {
    category: "SECURITY",
    outcome: "SUCCESS",
    resourceType: "SecureDocument",
    metadata: "document",
    tenantRequired: true,
    actor: "USER_OR_SYSTEM",
  },
  "user.created": {
    category: "IDENTITY",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "none",
    tenantRequired: false,
    actor: "USER",
  },
  "user.updated": {
    category: "IDENTITY",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "changedFields",
    tenantRequired: false,
    actor: "USER",
  },
  "user.disabled": {
    category: "IDENTITY",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "status",
    tenantRequired: false,
    actor: "USER",
  },
  "user.enabled": {
    category: "IDENTITY",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "status",
    tenantRequired: false,
    actor: "USER",
  },
  "user.keycloakLinked": {
    category: "IDENTITY",
    outcome: "SUCCESS",
    resourceType: "UserProfile",
    metadata: "none",
    tenantRequired: false,
    actor: "USER",
  },
  "globalRole.assigned": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "UserGlobalRole",
    metadata: "role",
    tenantRequired: false,
    actor: "USER",
  },
  "globalRole.removed": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "UserGlobalRole",
    metadata: "role",
    tenantRequired: false,
    actor: "USER",
  },
  "invitation.created": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "Invitation",
    metadata: "invitation",
    tenantRequired: true,
    actor: "USER",
  },
  "invitation.accepted": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "Invitation",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "invitation.revoked": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "Invitation",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "invitation.expired": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "Invitation",
    metadata: "status",
    tenantRequired: true,
    actor: "SYSTEM",
  },
  "membership.created": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "UserTenantMembership",
    metadata: "none",
    tenantRequired: true,
    actor: "USER",
  },
  "membership.suspended": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "UserTenantMembership",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "membership.revoked": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "UserTenantMembership",
    metadata: "status",
    tenantRequired: true,
    actor: "USER",
  },
  "membership.roleAssigned": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "MembershipRole",
    metadata: "role",
    tenantRequired: true,
    actor: "USER",
  },
  "membership.roleRemoved": {
    category: "ACCESS",
    outcome: "SUCCESS",
    resourceType: "MembershipRole",
    metadata: "role",
    tenantRequired: true,
    actor: "USER",
  },
  "authentication.denied": {
    category: "SECURITY",
    outcome: "DENIED",
    resourceType: "Authentication",
    metadata: "none",
    tenantRequired: false,
    actor: "DENIAL",
  },
  "authorization.denied": {
    category: "ACCESS",
    outcome: "DENIED",
    resourceType: "Authorization",
    metadata: "none",
    tenantRequired: false,
    actor: "DENIAL",
  },
  "tenantAccess.denied": {
    category: "ACCESS",
    outcome: "DENIED",
    resourceType: "TenantAccess",
    metadata: "none",
    tenantRequired: false,
    actor: "DENIAL",
  },
} as const;

export type AuditAction = keyof typeof AUDIT_CATALOG;

export type ValidatedAuditActor =
  | {
      readonly type: "USER";
      readonly userProfileId: string;
      readonly membershipId?: string;
    }
  | { readonly type: "SYSTEM" }
  | { readonly type: "ANONYMOUS" };

export interface ValidatedAuditContext {
  readonly tenantId?: string;
  readonly actor: ValidatedAuditActor;
  readonly traceId: string;
  readonly correlationId?: string;
}

export interface DomainAuditEvent {
  readonly action: AuditAction;
  readonly resourceId?: string;
  readonly reasonCode?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly occurredAt: Date;
}

export class AuditContractError extends Error {}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const STABLE_CODE = /^[A-Za-z][A-Za-z0-9._-]{0,127}$/u;
const TRACE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const FORBIDDEN_FIELD =
  /(?:password|token|secret|authorization|cookie|api.?key|private.?key|raw.?body|payload|file.?content|receipt.?content|bank)/iu;

const requireUuid = (value: string | undefined, field: string): string => {
  if (value === undefined || !UUID.test(value)) {
    throw new AuditContractError(`${field} must be a UUID.`);
  }
  return value;
};

const requireStableText = (
  value: string | undefined,
  field: string,
  maximumLength = 128,
): string => {
  if (
    value === undefined ||
    value.length === 0 ||
    value.length > maximumLength ||
    !STABLE_CODE.test(value)
  ) {
    throw new AuditContractError(`${field} must be a stable code.`);
  }
  return value;
};

const requireTraceIdentifier = (
  value: string | undefined,
  field: string,
): string => {
  if (value === undefined || !TRACE_IDENTIFIER.test(value)) {
    throw new AuditContractError(`${field} must be a safe identifier.`);
  }
  return value;
};

const metadataValidators = {
  none(metadata: DomainAuditEvent["metadata"]): null {
    if (metadata !== undefined && Object.keys(metadata).length > 0) {
      throw new AuditContractError("This action does not accept metadata.");
    }
    return null;
  },
  changedFields(metadata: DomainAuditEvent["metadata"]): Prisma.InputJsonValue {
    assertMetadataKeys(metadata, ["changedFields"]);
    const changedFields = metadata?.changedFields;
    if (
      !Array.isArray(changedFields) ||
      changedFields.length === 0 ||
      changedFields.some(
        (field) =>
          typeof field !== "string" ||
          !STABLE_CODE.test(field) ||
          FORBIDDEN_FIELD.test(field),
      )
    ) {
      throw new AuditContractError("changedFields is invalid or sensitive.");
    }
    return { changedFields: [...changedFields] };
  },
  status(metadata: DomainAuditEvent["metadata"]): Prisma.InputJsonValue {
    assertMetadataKeys(metadata, ["previousStatus", "newStatus"]);
    return {
      previousStatus: requireStableText(
        metadata?.previousStatus as string | undefined,
        "previousStatus",
      ),
      newStatus: requireStableText(
        metadata?.newStatus as string | undefined,
        "newStatus",
      ),
    };
  },
  role(metadata: DomainAuditEvent["metadata"]): Prisma.InputJsonValue {
    assertMetadataKeys(metadata, ["roleId"]);
    return { roleId: requireUuid(metadata?.roleId as string, "roleId") };
  },
  invitation(metadata: DomainAuditEvent["metadata"]): Prisma.InputJsonValue {
    assertMetadataKeys(metadata, ["roleId", "expiresAt"]);
    const expiresAt = metadata?.expiresAt;
    if (
      typeof expiresAt !== "string" ||
      !Number.isFinite(Date.parse(expiresAt))
    ) {
      throw new AuditContractError("expiresAt must be an ISO timestamp.");
    }
    return {
      roleId: requireUuid(metadata?.roleId as string, "roleId"),
      expiresAt,
    };
  },
  document(metadata: DomainAuditEvent["metadata"]): Prisma.InputJsonValue {
    const allowed = [
      "documentId",
      "versionId",
      "fileId",
      "category",
      "fileSize",
      "verifiedMimeType",
      "previousStatus",
      "newStatus",
    ];
    if (metadata === undefined) {
      throw new AuditContractError("Required document metadata is missing.");
    }
    const entries = Object.entries(metadata);
    if (
      entries.length === 0 ||
      entries.some(
        ([key]) => !allowed.includes(key) || FORBIDDEN_FIELD.test(key),
      )
    ) {
      throw new AuditContractError(
        "Document metadata contains non-allowlisted keys.",
      );
    }
    const result: Record<string, string | number> = {};
    for (const [key, value] of entries) {
      if (["documentId", "versionId", "fileId"].includes(key)) {
        result[key] = requireUuid(value as string, key);
      } else if (key === "fileSize") {
        if (
          !Number.isInteger(value) ||
          (value as number) < 1 ||
          (value as number) > 10_485_760
        ) {
          throw new AuditContractError("fileSize is invalid.");
        }
        result[key] = value as number;
      } else if (key === "verifiedMimeType") {
        if (
          value !== "application/pdf" &&
          value !== "image/jpeg" &&
          value !== "image/png"
        ) {
          throw new AuditContractError("verifiedMimeType is invalid.");
        }
        result[key] = value;
      } else {
        result[key] = requireStableText(value as string, key);
      }
    }
    return result;
  },
} as const;

const assertMetadataKeys = (
  metadata: DomainAuditEvent["metadata"],
  expected: readonly string[],
): void => {
  if (metadata === undefined) {
    throw new AuditContractError("Required metadata is missing.");
  }
  const keys = Object.keys(metadata);
  if (
    keys.length !== expected.length ||
    keys.some((key) => !expected.includes(key) || FORBIDDEN_FIELD.test(key))
  ) {
    throw new AuditContractError("Metadata contains non-allowlisted keys.");
  }
  if (JSON.stringify(metadata).length > 16_384) {
    throw new AuditContractError("Metadata exceeds the allowed size.");
  }
};

export function prepareAuditRecord(
  context: ValidatedAuditContext,
  event: DomainAuditEvent,
): Prisma.AuditLogUncheckedCreateInput {
  const contract = AUDIT_CATALOG[event.action];
  if (contract === undefined) {
    throw new AuditContractError(
      "Audit action is outside the canonical catalog.",
    );
  }

  const tenantId = context.tenantId;
  if (contract.tenantRequired) {
    requireUuid(tenantId, "tenantId");
  } else if (tenantId !== undefined) {
    requireUuid(tenantId, "tenantId");
  }

  const actor = context.actor;
  if (contract.actor === "SYSTEM" && actor.type !== "SYSTEM") {
    throw new AuditContractError("The action requires a SYSTEM actor.");
  }
  if (contract.actor === "USER" && actor.type !== "USER") {
    throw new AuditContractError("The action requires a USER actor.");
  }
  if (
    contract.actor === "USER_OR_SYSTEM" &&
    actor.type !== "USER" &&
    actor.type !== "SYSTEM"
  ) {
    throw new AuditContractError("The action requires a USER or SYSTEM actor.");
  }
  if (
    contract.actor === "DENIAL" &&
    actor.type !== "USER" &&
    actor.type !== "ANONYMOUS"
  ) {
    throw new AuditContractError("The denial actor is invalid.");
  }

  const actorUserProfileId =
    actor.type === "USER"
      ? requireUuid(actor.userProfileId, "actorUserProfileId")
      : null;
  const actorMembershipId =
    actor.type === "USER" && actor.membershipId !== undefined
      ? requireUuid(actor.membershipId, "actorMembershipId")
      : null;
  if (actorMembershipId !== null && tenantId === undefined) {
    throw new AuditContractError(
      "Membership actors require a validated tenant.",
    );
  }

  const resourceId =
    contract.outcome === "SUCCESS"
      ? requireUuid(event.resourceId, "resourceId")
      : null;
  if (contract.outcome === "DENIED" && event.resourceId !== undefined) {
    throw new AuditContractError("Denied events cannot expose a resource id.");
  }

  const traceId = requireTraceIdentifier(context.traceId, "traceId");
  const correlationId =
    context.correlationId === undefined
      ? null
      : requireTraceIdentifier(context.correlationId, "correlationId");
  const reasonCode =
    event.reasonCode === undefined
      ? null
      : requireStableText(event.reasonCode, "reasonCode");
  if (!Number.isFinite(event.occurredAt.getTime())) {
    throw new AuditContractError("occurredAt must be valid.");
  }

  const metadata = metadataValidators[contract.metadata](event.metadata);

  return {
    tenantId: tenantId ?? null,
    actorType: actor.type,
    actorUserProfileId,
    actorMembershipId,
    action: event.action,
    category: contract.category,
    outcome: contract.outcome,
    resourceType: contract.resourceType,
    resourceId,
    reasonCode,
    metadata: metadata === null ? Prisma.DbNull : metadata,
    traceId,
    correlationId,
    occurredAt: event.occurredAt,
  };
}

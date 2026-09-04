CREATE TYPE "idempotency_operation_status" AS ENUM ('inProgress', 'completed');

CREATE TABLE "idempotency_operations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "operation_type" VARCHAR(160) NOT NULL,
    "key_hash" CHAR(64) NOT NULL,
    "request_hash" CHAR(64) NOT NULL,
    "actor_user_profile_id" TEXT NOT NULL,
    "status" "idempotency_operation_status" NOT NULL DEFAULT 'inProgress',
    "http_status" INTEGER,
    "response_body" JSONB,
    "resource_type" VARCHAR(128),
    "resource_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "idempotency_operations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "idempotency_operations_hashes_check" CHECK (
        "key_hash" ~ '^[0-9a-f]{64}$' AND "request_hash" ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT "idempotency_operations_result_check" CHECK (
        ("status" = 'inProgress' AND "http_status" IS NULL AND "response_body" IS NULL AND "completed_at" IS NULL AND "expires_at" IS NULL)
        OR
        ("status" = 'completed' AND "http_status" IS NOT NULL AND "response_body" IS NOT NULL AND "completed_at" IS NOT NULL AND "expires_at" IS NOT NULL)
    )
);

-- Extend the durable Audit catalog with the Phase 2 allowlist.
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK (
    ("action", "category", "outcome", "resource_type") IN (
        ('platformAdmin.bootstrap.completed', 'platform', 'success', 'UserProfile'),
        ('tenant.created', 'tenant', 'success', 'Tenant'),
        ('tenant.baseRoles.created', 'tenant', 'success', 'Role'),
        ('tenant.updated', 'tenant', 'success', 'Tenant'),
        ('tenant.activated', 'tenant', 'success', 'Tenant'),
        ('tenant.suspended', 'tenant', 'success', 'Tenant'),
        ('tenant.reactivated', 'tenant', 'success', 'Tenant'),
        ('tenant.archived', 'tenant', 'success', 'Tenant'),
        ('tenant.profile.updated', 'tenant', 'success', 'TenantProfile'),
        ('tenant.branding.updated', 'tenant', 'success', 'TenantBranding'),
        ('tenant.wordpressMapping.updated', 'tenant', 'success', 'TenantWordPressMapping'),
        ('tenantSetting.updated', 'tenant', 'success', 'TenantSettingValue'),
        ('user.created', 'identity', 'success', 'UserProfile'),
        ('user.updated', 'identity', 'success', 'UserProfile'),
        ('user.disabled', 'identity', 'success', 'UserProfile'),
        ('user.enabled', 'identity', 'success', 'UserProfile'),
        ('user.keycloakLinked', 'identity', 'success', 'UserProfile'),
        ('globalRole.assigned', 'access', 'success', 'UserGlobalRole'),
        ('globalRole.removed', 'access', 'success', 'UserGlobalRole'),
        ('invitation.created', 'access', 'success', 'Invitation'),
        ('invitation.accepted', 'access', 'success', 'Invitation'),
        ('invitation.revoked', 'access', 'success', 'Invitation'),
        ('invitation.expired', 'access', 'success', 'Invitation'),
        ('membership.created', 'access', 'success', 'UserTenantMembership'),
        ('membership.suspended', 'access', 'success', 'UserTenantMembership'),
        ('membership.revoked', 'access', 'success', 'UserTenantMembership'),
        ('membership.roleAssigned', 'access', 'success', 'MembershipRole'),
        ('membership.roleRemoved', 'access', 'success', 'MembershipRole'),
        ('authentication.denied', 'security', 'denied', 'Authentication'),
        ('authorization.denied', 'access', 'denied', 'Authorization'),
        ('tenantAccess.denied', 'access', 'denied', 'TenantAccess'),
        ('propertyUnit.created', 'tenant', 'success', 'PropertyUnit'),
        ('propertyUnit.updated', 'tenant', 'success', 'PropertyUnit'),
        ('propertyUnit.statusChanged', 'tenant', 'success', 'PropertyUnit'),
        ('propertyUnit.archived', 'tenant', 'success', 'PropertyUnit'),
        ('person.created', 'tenant', 'success', 'Person'),
        ('person.updated', 'tenant', 'success', 'Person'),
        ('person.statusChanged', 'tenant', 'success', 'Person'),
        ('person.archived', 'tenant', 'success', 'Person'),
        ('person.identityLinked', 'tenant', 'success', 'Person'),
        ('person.identityUnlinked', 'tenant', 'success', 'Person'),
        ('legalEntity.created', 'tenant', 'success', 'LegalEntity'),
        ('legalEntity.updated', 'tenant', 'success', 'LegalEntity'),
        ('legalEntity.statusChanged', 'tenant', 'success', 'LegalEntity'),
        ('legalEntity.archived', 'tenant', 'success', 'LegalEntity'),
        ('propertyOwnership.created', 'tenant', 'success', 'PropertyOwnership'),
        ('propertyOwnership.updated', 'tenant', 'success', 'PropertyOwnership'),
        ('propertyOwnership.disputed', 'tenant', 'success', 'PropertyOwnership'),
        ('propertyOwnership.resolved', 'tenant', 'success', 'PropertyOwnership'),
        ('propertyOwnership.ended', 'tenant', 'success', 'PropertyOwnership'),
        ('propertyOwnership.archived', 'tenant', 'success', 'PropertyOwnership'),
        ('residency.created', 'tenant', 'success', 'Residency'),
        ('residency.updated', 'tenant', 'success', 'Residency'),
        ('residency.suspended', 'tenant', 'success', 'Residency'),
        ('residency.reactivated', 'tenant', 'success', 'Residency'),
        ('residency.ended', 'tenant', 'success', 'Residency'),
        ('residency.archived', 'tenant', 'success', 'Residency'),
        ('lease.created', 'tenant', 'success', 'Lease'),
        ('lease.updated', 'tenant', 'success', 'Lease'),
        ('lease.activated', 'tenant', 'success', 'Lease'),
        ('lease.cancelled', 'tenant', 'success', 'Lease'),
        ('lease.ended', 'tenant', 'success', 'Lease'),
        ('lease.archived', 'tenant', 'success', 'Lease')
    )
);

CREATE UNIQUE INDEX "idempotency_operations_tenant_id_operation_type_key_hash_key"
ON "idempotency_operations"("tenant_id", "operation_type", "key_hash");

CREATE INDEX "idempotency_operations_tenant_id_status_idx"
ON "idempotency_operations"("tenant_id", "status");

CREATE INDEX "idempotency_operations_expires_at_idx"
ON "idempotency_operations"("expires_at");

ALTER TABLE "idempotency_operations"
ADD CONSTRAINT "idempotency_operations_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "idempotency_operations"
ADD CONSTRAINT "idempotency_operations_actor_user_profile_id_fkey"
FOREIGN KEY ("actor_user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "permissions" ("id", "code", "module", "action", "description", "is_system", "created_at", "updated_at")
SELECT gen_random_uuid(), permission.code, permission.module, permission.action,
       'System permission ' || permission.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('propertyUnits.read', 'propertyUnits', 'read'),
    ('propertyUnits.create', 'propertyUnits', 'create'),
    ('propertyUnits.update', 'propertyUnits', 'update'),
    ('propertyUnits.archive', 'propertyUnits', 'archive'),
    ('propertyUnits.read.own', 'propertyUnits.read', 'own'),
    ('persons.read', 'persons', 'read'),
    ('persons.create', 'persons', 'create'),
    ('persons.update', 'persons', 'update'),
    ('persons.archive', 'persons', 'archive'),
    ('persons.linkIdentity', 'persons', 'linkIdentity'),
    ('persons.read.own', 'persons.read', 'own'),
    ('legalEntities.read', 'legalEntities', 'read'),
    ('legalEntities.create', 'legalEntities', 'create'),
    ('legalEntities.update', 'legalEntities', 'update'),
    ('legalEntities.archive', 'legalEntities', 'archive'),
    ('propertyOwnerships.read', 'propertyOwnerships', 'read'),
    ('propertyOwnerships.create', 'propertyOwnerships', 'create'),
    ('propertyOwnerships.update', 'propertyOwnerships', 'update'),
    ('propertyOwnerships.end', 'propertyOwnerships', 'end'),
    ('residencies.read', 'residencies', 'read'),
    ('residencies.create', 'residencies', 'create'),
    ('residencies.update', 'residencies', 'update'),
    ('residencies.end', 'residencies', 'end'),
    ('residencies.read.own', 'residencies.read', 'own'),
    ('leases.read', 'leases', 'read'),
    ('leases.create', 'leases', 'create'),
    ('leases.update', 'leases', 'update'),
    ('leases.end', 'leases', 'end')
) AS permission(code, module, action)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT gen_random_uuid(), role."id", permission."id", CURRENT_TIMESTAMP
FROM "roles" AS role
JOIN "permissions" AS permission ON permission."code" = ANY (
    CASE role."code"
        WHEN 'TenantAdmin' THEN ARRAY[
            'propertyUnits.read','propertyUnits.create','propertyUnits.update','propertyUnits.archive',
            'persons.read','persons.create','persons.update','persons.archive','persons.linkIdentity',
            'legalEntities.read','legalEntities.create','legalEntities.update','legalEntities.archive',
            'propertyOwnerships.read','propertyOwnerships.create','propertyOwnerships.update','propertyOwnerships.end',
            'residencies.read','residencies.create','residencies.update','residencies.end',
            'leases.read','leases.create','leases.update','leases.end'
        ]
        WHEN 'Treasurer' THEN ARRAY['propertyUnits.read']
        WHEN 'TenantStaff' THEN ARRAY['propertyUnits.read','persons.read','legalEntities.read','propertyOwnerships.read','residencies.read','leases.read']
        WHEN 'PropertyOwner' THEN ARRAY['propertyUnits.read.own','persons.read.own']
        WHEN 'Resident' THEN ARRAY['propertyUnits.read.own','persons.read.own','residencies.read.own']
        ELSE ARRAY[]::text[]
    END
)
WHERE role."scope" = 'tenant'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

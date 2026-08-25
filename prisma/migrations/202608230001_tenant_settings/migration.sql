-- CreateEnum
CREATE TYPE "tenant_setting_category" AS ENUM ('general', 'financial', 'billing', 'payments', 'accountStatements', 'reservations', 'fines', 'meetings', 'voting', 'communications', 'documents', 'accessControl', 'maintenance', 'inventory', 'suppliers', 'accounting', 'bankReconciliation', 'reports', 'privacy', 'security', 'modules');

-- CreateEnum
CREATE TYPE "tenant_setting_value_type" AS ENUM ('string', 'number', 'integer', 'boolean', 'decimalString', 'date', 'time', 'duration', 'enum', 'stringArray', 'object', 'json');

-- CreateEnum
CREATE TYPE "tenant_setting_sensitivity" AS ENUM ('publicSummary', 'internal', 'restricted', 'securitySensitive', 'privacySensitive', 'financialSensitive');

-- CreateEnum
CREATE TYPE "definition_status" AS ENUM ('active', 'deprecated', 'archived');

-- CreateEnum
CREATE TYPE "tenant_setting_value_status" AS ENUM ('draft', 'active', 'scheduled', 'expired', 'archived');

-- CreateEnum
CREATE TYPE "tenant_setting_source" AS ENUM ('platformDefault', 'tenantOverride', 'import', 'migration', 'system');

-- CreateTable
CREATE TABLE "setting_definitions" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(160) NOT NULL,
    "category" "tenant_setting_category" NOT NULL,
    "value_type" "tenant_setting_value_type" NOT NULL,
    "default_value" JSONB NOT NULL,
    "allowed_values" JSONB,
    "schema" JSONB,
    "description" TEXT,
    "sensitivity" "tenant_setting_sensitivity" NOT NULL DEFAULT 'internal',
    "is_tenant_overridable" BOOLEAN NOT NULL DEFAULT true,
    "is_runtime_critical" BOOLEAN NOT NULL DEFAULT false,
    "requires_restart" BOOLEAN NOT NULL DEFAULT false,
    "resident_visible" BOOLEAN NOT NULL DEFAULT false,
    "status" "definition_status" NOT NULL DEFAULT 'active',
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "archived_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "setting_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_setting_values" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "setting_definition_id" TEXT NOT NULL,
    "key" VARCHAR(160) NOT NULL,
    "value" JSONB NOT NULL,
    "value_type" "tenant_setting_value_type" NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_until" TIMESTAMP(3),
    "status" "tenant_setting_value_status" NOT NULL DEFAULT 'active',
    "source" "tenant_setting_source" NOT NULL DEFAULT 'tenantOverride',
    "reason" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "activated_by" UUID,
    "archived_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "activated_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "tenant_setting_values_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tenant_setting_values_effective_window_check" CHECK ("effective_until" IS NULL OR "effective_until" > "effective_from")
);

-- CreateIndex
CREATE UNIQUE INDEX "setting_definitions_key_key" ON "setting_definitions"("key");
CREATE INDEX "setting_definitions_category_status_idx" ON "setting_definitions"("category", "status");
CREATE INDEX "setting_definitions_sensitivity_idx" ON "setting_definitions"("sensitivity");
CREATE UNIQUE INDEX "tenant_setting_values_tenant_id_setting_definition_id_key" ON "tenant_setting_values"("tenant_id", "setting_definition_id");
CREATE INDEX "tenant_setting_values_tenant_id_key_status_idx" ON "tenant_setting_values"("tenant_id", "key", "status");
CREATE INDEX "tenant_setting_values_tenant_id_key_effective_from_effective_until_idx" ON "tenant_setting_values"("tenant_id", "key", "effective_from", "effective_until");
CREATE INDEX "tenant_setting_values_tenant_id_setting_definition_id_idx" ON "tenant_setting_values"("tenant_id", "setting_definition_id");

-- AddForeignKey
ALTER TABLE "tenant_setting_values" ADD CONSTRAINT "tenant_setting_values_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant_setting_values" ADD CONSTRAINT "tenant_setting_values_setting_definition_id_fkey" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Extend the durable audit catalog for Phase 8 tenant settings.
ALTER TABLE "audit_logs"
DROP CONSTRAINT "audit_logs_catalog_check";

ALTER TABLE "audit_logs"
ADD CONSTRAINT "audit_logs_catalog_check" CHECK (
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
        ('tenantSetting.updated', 'tenant', 'success', 'TenantSettingValue')
    )
);

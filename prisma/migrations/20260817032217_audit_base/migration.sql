-- CreateEnum
CREATE TYPE "audit_actor_type" AS ENUM ('user', 'system', 'anonymous');

-- CreateEnum
CREATE TYPE "audit_category" AS ENUM ('platform', 'tenant', 'identity', 'access', 'security');

-- CreateEnum
CREATE TYPE "audit_outcome" AS ENUM ('success', 'denied');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "actor_type" "audit_actor_type" NOT NULL,
    "actor_user_profile_id" TEXT,
    "actor_membership_id" TEXT,
    "action" TEXT NOT NULL,
    "category" "audit_category" NOT NULL,
    "outcome" "audit_outcome" NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "reason_code" TEXT,
    "metadata" JSONB,
    "trace_id" TEXT NOT NULL,
    "correlation_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_profile_id_idx" ON "audit_logs"("actor_user_profile_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_membership_id_idx" ON "audit_logs"("actor_membership_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");

-- CreateIndex
CREATE INDEX "audit_logs_outcome_idx" ON "audit_logs"("outcome");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_trace_id_idx" ON "audit_logs"("trace_id");

-- CreateIndex
CREATE INDEX "audit_logs_correlation_id_idx" ON "audit_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at_idx" ON "audit_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_occurred_at_idx" ON "audit_logs"("tenant_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_profile_id_fkey" FOREIGN KEY ("actor_user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "user_tenant_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enforce the canonical Sprint 2 catalog and fail-closed actor/target shapes.
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
        ('tenantAccess.denied', 'access', 'denied', 'TenantAccess')
    )
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_check" CHECK (
    ("actor_type" = 'user' AND "actor_user_profile_id" IS NOT NULL)
    OR ("actor_type" IN ('system', 'anonymous') AND "actor_user_profile_id" IS NULL AND "actor_membership_id" IS NULL)
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_check" CHECK (
    ("outcome" = 'success' AND "resource_id" IS NOT NULL)
    OR ("outcome" = 'denied' AND "resource_id" IS NULL)
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_check" CHECK (
    "tenant_id" IS NOT NULL
    OR "action" NOT LIKE 'tenant.%'
       AND "action" NOT LIKE 'invitation.%'
       AND "action" NOT LIKE 'membership.%'
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_action_check" CHECK (
    ("action" IN ('platformAdmin.bootstrap.completed', 'invitation.expired') AND "actor_type" = 'system')
    OR ("outcome" = 'success' AND "action" NOT IN ('platformAdmin.bootstrap.completed', 'invitation.expired') AND "actor_type" = 'user')
    OR ("outcome" = 'denied' AND "actor_type" IN ('user', 'anonymous'))
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_trace_check" CHECK (
    length("trace_id") BETWEEN 1 AND 128
    AND ("correlation_id" IS NULL OR length("correlation_id") BETWEEN 1 AND 128)
    AND ("reason_code" IS NULL OR length("reason_code") BETWEEN 1 AND 128)
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_membership_shape_check" CHECK (
    "actor_membership_id" IS NULL
    OR ("tenant_id" IS NOT NULL AND "actor_user_profile_id" IS NOT NULL)
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_metadata_shape_check" CHECK (
    "metadata" IS NULL OR jsonb_typeof("metadata") = 'object'
);

-- Membership evidence must match the already validated active tenant context.
CREATE FUNCTION reject_invalid_audit_membership() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.actor_membership_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM user_tenant_memberships AS membership
        WHERE membership.id = NEW.actor_membership_id
          AND membership.tenant_id = NEW.tenant_id
          AND membership.user_profile_id = NEW.actor_user_profile_id
          AND membership.status = 'active'
    ) THEN
        RAISE EXCEPTION 'audit actor membership is invalid for tenant context'
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "audit_logs_validate_membership"
BEFORE INSERT ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION reject_invalid_audit_membership();

-- Audit evidence is append-only in ordinary operation.
CREATE FUNCTION reject_audit_log_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only' USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "audit_logs_reject_update_delete"
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION reject_audit_log_mutation();

CREATE TRIGGER "audit_logs_reject_truncate"
BEFORE TRUNCATE ON "audit_logs"
FOR EACH STATEMENT EXECUTE FUNCTION reject_audit_log_mutation();

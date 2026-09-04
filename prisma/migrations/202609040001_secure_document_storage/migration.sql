-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('draft', 'uploaded', 'available', 'quarantined', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "document_version_status" AS ENUM ('draft', 'active', 'superseded', 'archived');

-- CreateEnum
CREATE TYPE "document_file_status" AS ENUM ('pending', 'stored', 'available', 'quarantined', 'rejected', 'archived', 'missing', 'failed');

-- CreateEnum
CREATE TYPE "document_visibility" AS ENUM ('private');

-- CreateEnum
CREATE TYPE "document_sensitivity" AS ENUM ('restricted');

-- CreateEnum
CREATE TYPE "document_category" AS ENUM ('paymentReceipt');

-- CreateEnum
CREATE TYPE "source_module" AS ENUM ('payments');

-- CreateEnum
CREATE TYPE "storage_provider" AS ENUM ('minio', 's3', 's3Compatible');

-- CreateEnum
CREATE TYPE "file_scan_status" AS ENUM ('notRequired', 'pending', 'clean', 'suspicious', 'infected', 'failed');

-- CreateEnum
CREATE TYPE "document_access_type" AS ENUM ('viewMetadata', 'download', 'archive');

-- CreateEnum
CREATE TYPE "document_access_outcome" AS ENUM ('allowed', 'denied', 'notFound', 'quarantined', 'rejected', 'archived', 'error');

-- CreateEnum
CREATE TYPE "document_policy_type" AS ENUM ('sourceDelegated', 'restricted');

-- CreateEnum
CREATE TYPE "document_owner_type" AS ENUM ('user', 'person', 'propertyUnit', 'none');

-- CreateEnum
CREATE TYPE "document_link_type" AS ENUM ('source', 'receiptOf');

-- CreateEnum
CREATE TYPE "mime_group" AS ENUM ('pdf', 'image');

-- CreateEnum
CREATE TYPE "hash_algorithm" AS ENUM ('SHA-256');

-- CreateTable
CREATE TABLE "secure_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "document_status" NOT NULL DEFAULT 'draft',
    "visibility" "document_visibility" NOT NULL DEFAULT 'private',
    "sensitivity" "document_sensitivity" NOT NULL DEFAULT 'restricted',
    "category" "document_category" NOT NULL DEFAULT 'paymentReceipt',
    "source_module" "source_module" NOT NULL DEFAULT 'payments',
    "source_resource_type" VARCHAR(64) NOT NULL DEFAULT 'PAYMENT_RECEIPT',
    "source_resource_id" TEXT NOT NULL,
    "owner_type" "document_owner_type" NOT NULL DEFAULT 'none',
    "owner_user_id" TEXT,
    "owner_person_id" TEXT,
    "owner_property_unit_id" TEXT,
    "current_version_id" TEXT,
    "active_file_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "archive_reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "secure_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_document_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "status" "document_version_status" NOT NULL DEFAULT 'draft',
    "change_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "secure_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_document_files" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "provider" "storage_provider" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "safe_file_name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(8) NOT NULL,
    "mime_type" VARCHAR(64) NOT NULL,
    "mime_group" "mime_group" NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_hash" CHAR(64) NOT NULL,
    "hash_algorithm" "hash_algorithm" NOT NULL DEFAULT 'SHA-256',
    "scan_status" "file_scan_status" NOT NULL DEFAULT 'notRequired',
    "status" "document_file_status" NOT NULL DEFAULT 'pending',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "secure_document_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_document_links" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "source_module" "source_module" NOT NULL DEFAULT 'payments',
    "resource_type" VARCHAR(64) NOT NULL DEFAULT 'PAYMENT_RECEIPT',
    "resource_id" TEXT NOT NULL,
    "link_type" "document_link_type" NOT NULL DEFAULT 'receiptOf',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "secure_document_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_document_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "policy_type" "document_policy_type" NOT NULL DEFAULT 'sourceDelegated',
    "visibility" "document_visibility" NOT NULL DEFAULT 'private',
    "sensitivity" "document_sensitivity" NOT NULL DEFAULT 'restricted',
    "source_module_delegated" BOOLEAN NOT NULL DEFAULT true,
    "allow_owner_read" BOOLEAN NOT NULL DEFAULT false,
    "allow_owner_download" BOOLEAN NOT NULL DEFAULT false,
    "allow_admin_download" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "secure_document_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_document_access_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT,
    "version_id" TEXT,
    "file_id" TEXT,
    "actor_user_id" TEXT,
    "access_type" "document_access_type" NOT NULL,
    "outcome" "document_access_outcome" NOT NULL,
    "source_module" "source_module",
    "source_resource_type" VARCHAR(64),
    "source_resource_id" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trace_id" VARCHAR(128),

    CONSTRAINT "secure_document_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "secure_documents_tenant_id_status_idx" ON "secure_documents"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "secure_documents_tenant_id_source_module_source_resource_ty_idx" ON "secure_documents"("tenant_id", "source_module", "source_resource_type", "source_resource_id");

-- CreateIndex
CREATE INDEX "secure_documents_tenant_id_owner_user_id_idx" ON "secure_documents"("tenant_id", "owner_user_id");

-- CreateIndex
CREATE INDEX "secure_documents_tenant_id_owner_person_id_idx" ON "secure_documents"("tenant_id", "owner_person_id");

-- CreateIndex
CREATE INDEX "secure_documents_tenant_id_owner_property_unit_id_idx" ON "secure_documents"("tenant_id", "owner_property_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "secure_documents_id_tenant_id_key" ON "secure_documents"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "secure_document_versions_tenant_id_status_idx" ON "secure_document_versions"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_versions_id_tenant_id_key" ON "secure_document_versions"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_versions_tenant_id_document_id_version_numb_key" ON "secure_document_versions"("tenant_id", "document_id", "version_number");

-- CreateIndex
CREATE INDEX "secure_document_files_tenant_id_document_id_idx" ON "secure_document_files"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "secure_document_files_tenant_id_version_id_idx" ON "secure_document_files"("tenant_id", "version_id");

-- CreateIndex
CREATE INDEX "secure_document_files_tenant_id_status_scan_status_idx" ON "secure_document_files"("tenant_id", "status", "scan_status");

-- CreateIndex
CREATE INDEX "secure_document_files_tenant_id_file_hash_idx" ON "secure_document_files"("tenant_id", "file_hash");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_files_id_tenant_id_key" ON "secure_document_files"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "secure_document_links_tenant_id_document_id_idx" ON "secure_document_links"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "secure_document_links_tenant_id_source_module_resource_type_idx" ON "secure_document_links"("tenant_id", "source_module", "resource_type", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_links_id_tenant_id_key" ON "secure_document_links"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "secure_document_policies_tenant_id_document_id_idx" ON "secure_document_policies"("tenant_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_policies_id_tenant_id_key" ON "secure_document_policies"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "secure_document_access_logs_tenant_id_document_id_idx" ON "secure_document_access_logs"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "secure_document_access_logs_tenant_id_actor_user_id_accesse_idx" ON "secure_document_access_logs"("tenant_id", "actor_user_id", "accessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "secure_document_access_logs_id_tenant_id_key" ON "secure_document_access_logs"("id", "tenant_id");

-- AddForeignKey
ALTER TABLE "secure_documents" ADD CONSTRAINT "secure_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_versions" ADD CONSTRAINT "secure_document_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_versions" ADD CONSTRAINT "secure_document_versions_document_id_tenant_id_fkey" FOREIGN KEY ("document_id", "tenant_id") REFERENCES "secure_documents"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_document_id_tenant_id_fkey" FOREIGN KEY ("document_id", "tenant_id") REFERENCES "secure_documents"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_version_id_tenant_id_fkey" FOREIGN KEY ("version_id", "tenant_id") REFERENCES "secure_document_versions"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_links" ADD CONSTRAINT "secure_document_links_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_links" ADD CONSTRAINT "secure_document_links_document_id_tenant_id_fkey" FOREIGN KEY ("document_id", "tenant_id") REFERENCES "secure_documents"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_policies" ADD CONSTRAINT "secure_document_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_policies" ADD CONSTRAINT "secure_document_policies_document_id_tenant_id_fkey" FOREIGN KEY ("document_id", "tenant_id") REFERENCES "secure_documents"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_access_logs" ADD CONSTRAINT "secure_document_access_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_access_logs" ADD CONSTRAINT "secure_document_access_logs_document_id_tenant_id_fkey" FOREIGN KEY ("document_id", "tenant_id") REFERENCES "secure_documents"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_access_logs" ADD CONSTRAINT "secure_document_access_logs_version_id_tenant_id_fkey" FOREIGN KEY ("version_id", "tenant_id") REFERENCES "secure_document_versions"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_access_logs" ADD CONSTRAINT "secure_document_access_logs_file_id_tenant_id_fkey" FOREIGN KEY ("file_id", "tenant_id") REFERENCES "secure_document_files"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_document_access_logs" ADD CONSTRAINT "secure_document_access_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "secure_documents" ADD CONSTRAINT "secure_documents_phase3_scope_check" CHECK (
  "visibility" = 'private' AND "sensitivity" = 'restricted' AND
  "category" = 'paymentReceipt' AND "source_module" = 'payments' AND
  "source_resource_type" = 'PAYMENT_RECEIPT'
);
ALTER TABLE "secure_document_versions" ADD CONSTRAINT "secure_document_versions_number_positive" CHECK ("version_number" > 0);
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_size_check" CHECK ("file_size" BETWEEN 1 AND 10485760);
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_hash_check" CHECK (
  "file_hash" ~ '^[0-9a-f]{64}$' AND "hash_algorithm" = 'SHA-256'
);
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_storage_key_check" CHECK (
  length(trim("storage_key")) > 0 AND "storage_key" LIKE "tenant_id"::text || '/%'
);
ALTER TABLE "secure_document_files" ADD CONSTRAINT "secure_document_files_available_check" CHECK (
  "status" <> 'available' OR "scan_status" = 'notRequired'
);
ALTER TABLE "secure_document_links" ADD CONSTRAINT "secure_document_links_phase3_scope_check" CHECK (
  "source_module" = 'payments' AND "resource_type" = 'PAYMENT_RECEIPT'
);

CREATE UNIQUE INDEX "secure_document_files_provider_storage_key_key"
ON "secure_document_files"("provider", "storage_key");
CREATE UNIQUE INDEX "secure_document_versions_one_active_per_document"
ON "secure_document_versions"("tenant_id", "document_id")
WHERE "status" = 'active' AND "archived_at" IS NULL;
CREATE UNIQUE INDEX "secure_document_files_one_primary_active_per_version"
ON "secure_document_files"("tenant_id", "version_id")
WHERE "is_primary" = true AND "archived_at" IS NULL AND "status" IN ('stored', 'available');
CREATE UNIQUE INDEX "secure_document_links_one_active_source"
ON "secure_document_links"("tenant_id", "document_id", "source_module", "resource_type", "resource_id")
WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "secure_document_policies_one_active_per_document"
ON "secure_document_policies"("tenant_id", "document_id")
WHERE "archived_at" IS NULL;

-- Extend the durable Audit catalog with the Phase 3 document events.
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
        ('lease.archived', 'tenant', 'success', 'Lease'),
        ('document.uploadFinalized', 'security', 'success', 'SecureDocument'),
        ('document.compensationFailed', 'security', 'success', 'SecureDocument'),
        ('document.orphanDetected', 'security', 'success', 'SecureDocument'),
        ('document.orphanReconciled', 'security', 'success', 'SecureDocument'),
        ('document.quarantined', 'security', 'success', 'SecureDocument'),
        ('document.rejected', 'security', 'success', 'SecureDocument')
    )
);

ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_actor_action_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_action_check" CHECK (
    (
        "action" IN (
            'platformAdmin.bootstrap.completed',
            'invitation.expired',
            'document.compensationFailed',
            'document.orphanDetected',
            'document.orphanReconciled'
        )
        AND "actor_type" = 'system'
    )
    OR (
        "action" IN ('document.quarantined', 'document.rejected')
        AND "actor_type" IN ('user', 'system')
    )
    OR (
        "outcome" = 'success'
        AND "action" NOT IN (
            'platformAdmin.bootstrap.completed',
            'invitation.expired',
            'document.compensationFailed',
            'document.orphanDetected',
            'document.orphanReconciled',
            'document.quarantined',
            'document.rejected'
        )
        AND "actor_type" = 'user'
    )
    OR ("outcome" = 'denied' AND "actor_type" IN ('user', 'anonymous'))
);

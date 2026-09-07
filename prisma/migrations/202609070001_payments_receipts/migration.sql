CREATE TYPE "payment_status" AS ENUM ('DRAFT','REPORTED','PENDING_VALIDATION','CONFIRMED','PARTIALLY_ALLOCATED','ALLOCATED','REJECTED','CANCELLED','REVERSED','ARCHIVED');
CREATE TYPE "payment_method_type" AS ENUM ('CASH','BANK_TRANSFER','DEPOSIT','CHECK','ONLINE','OTHER');
CREATE TYPE "payment_receipt_status" AS ENUM ('PENDING','UPLOADED','ACCEPTED','REJECTED','ARCHIVED');

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "reported_by" TEXT,
  "created_by" TEXT NOT NULL,
  "method" "payment_method_type" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "allocated_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "unallocated_amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "paid_at" TIMESTAMP(3) NOT NULL,
  "reported_at" TIMESTAMP(3),
  "confirmed_at" TIMESTAMP(3),
  "confirmed_by" TEXT,
  "rejected_at" TIMESTAMP(3),
  "rejected_by" TEXT,
  "rejection_reason" VARCHAR(500),
  "status" "payment_status" NOT NULL,
  "transaction_reference" VARCHAR(160),
  "external_reference" VARCHAR(160),
  "notes" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payments_amount_check" CHECK ("amount" > 0 AND scale("amount") <= 2),
  CONSTRAINT "payments_allocation_check" CHECK ("allocated_amount" = 0 AND "unallocated_amount" = "amount"),
  CONSTRAINT "payments_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "payments_lifecycle_check" CHECK (
    ("status" = 'DRAFT' AND "reported_by" IS NULL AND "reported_at" IS NULL AND "confirmed_at" IS NULL AND "rejected_at" IS NULL) OR
    ("status" = 'PENDING_VALIDATION' AND "reported_by" IS NOT NULL AND "reported_at" IS NOT NULL AND "confirmed_at" IS NULL AND "rejected_at" IS NULL) OR
    ("status" = 'CONFIRMED' AND "confirmed_by" IS NOT NULL AND "confirmed_at" IS NOT NULL AND "rejected_at" IS NULL) OR
    ("status" = 'REJECTED' AND "reported_by" IS NOT NULL AND "rejected_by" IS NOT NULL AND "rejected_at" IS NOT NULL AND "rejection_reason" IS NOT NULL) OR
    "status" IN ('REPORTED','PARTIALLY_ALLOCATED','ALLOCATED','CANCELLED','REVERSED','ARCHIVED')
  )
);

CREATE UNIQUE INDEX "payments_id_tenant_id_key" ON "payments"("id","tenant_id");
CREATE INDEX "payments_tenant_id_property_unit_id_status_idx" ON "payments"("tenant_id","property_unit_id","status");
CREATE INDEX "payments_tenant_id_status_idx" ON "payments"("tenant_id","status");
CREATE INDEX "payments_tenant_id_method_idx" ON "payments"("tenant_id","method");
CREATE INDEX "payments_tenant_id_paid_at_idx" ON "payments"("tenant_id","paid_at");

CREATE TABLE "payment_receipts" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "secure_document_id" TEXT NOT NULL,
  "receipt_number" VARCHAR(160),
  "transaction_reference" VARCHAR(160),
  "status" "payment_receipt_status" NOT NULL DEFAULT 'PENDING',
  "uploaded_by" TEXT NOT NULL,
  "uploaded_at" TIMESTAMP(3),
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "rejection_reason" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_receipts_lifecycle_check" CHECK (
    ("status" = 'PENDING' AND "uploaded_at" IS NULL AND "reviewed_at" IS NULL) OR
    ("status" = 'UPLOADED' AND "uploaded_at" IS NOT NULL AND "reviewed_at" IS NULL) OR
    ("status" = 'ACCEPTED' AND "uploaded_at" IS NOT NULL AND "reviewed_by" IS NOT NULL AND "reviewed_at" IS NOT NULL AND "rejection_reason" IS NULL) OR
    ("status" = 'REJECTED' AND "uploaded_at" IS NOT NULL AND "reviewed_by" IS NOT NULL AND "reviewed_at" IS NOT NULL AND "rejection_reason" IS NOT NULL) OR
    "status" = 'ARCHIVED'
  )
);

CREATE UNIQUE INDEX "payment_receipts_id_tenant_id_key" ON "payment_receipts"("id","tenant_id");
CREATE UNIQUE INDEX "payment_receipts_tenant_id_payment_id_key" ON "payment_receipts"("tenant_id","payment_id");
CREATE UNIQUE INDEX "payment_receipts_payment_id_tenant_id_key" ON "payment_receipts"("payment_id","tenant_id");
CREATE UNIQUE INDEX "payment_receipts_secure_document_id_key" ON "payment_receipts"("secure_document_id");
CREATE UNIQUE INDEX "payment_receipts_secure_document_id_tenant_id_key" ON "payment_receipts"("secure_document_id","tenant_id");
CREATE INDEX "payment_receipts_tenant_id_status_idx" ON "payment_receipts"("tenant_id","status");
CREATE INDEX "payment_receipts_tenant_id_secure_document_id_idx" ON "payment_receipts"("tenant_id","secure_document_id");

ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_payment_id_tenant_id_fkey" FOREIGN KEY ("payment_id","tenant_id") REFERENCES "payments"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_secure_document_id_tenant_id_fkey" FOREIGN KEY ("secure_document_id","tenant_id") REFERENCES "secure_documents"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "permissions" ("id","code","module","action","description","is_system","created_at","updated_at")
SELECT gen_random_uuid(), p.code, p.module, p.action, 'System permission ' || p.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM (VALUES
 ('payments.read','payments','read'),('payments.create','payments','create'),('payments.confirm','payments','confirm'),('payments.reject','payments','reject'),
 ('payments.read.own','payments','read.own'),('payments.create.own','payments','create.own'),('paymentReceipts.read','paymentReceipts','read'),('paymentReceipts.create','paymentReceipts','create'),
 ('paymentReceipts.download','paymentReceipts','download'),('paymentReceipts.review','paymentReceipts','review'),('paymentReceipts.create.own','paymentReceipts','create.own'),('paymentReceipts.download.own','paymentReceipts','download.own')
) AS p(code,module,action) ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id","role_id","permission_id","created_at") SELECT gen_random_uuid(), r."id", p."id", CURRENT_TIMESTAMP FROM "roles" r JOIN "permissions" p ON p."code" = ANY (
 CASE r."code"
  WHEN 'TenantAdmin' THEN ARRAY['payments.read','payments.create','payments.confirm','payments.reject','paymentReceipts.read','paymentReceipts.create','paymentReceipts.download','paymentReceipts.review']
  WHEN 'Treasurer' THEN ARRAY['payments.read','payments.create','payments.confirm','payments.reject','paymentReceipts.read','paymentReceipts.create','paymentReceipts.download','paymentReceipts.review']
  WHEN 'BoardMember' THEN ARRAY['payments.read']
  WHEN 'TenantAuditor' THEN ARRAY['payments.read','paymentReceipts.read','paymentReceipts.download']
  WHEN 'ExternalAccountant' THEN ARRAY['payments.read','paymentReceipts.read','paymentReceipts.download']
  WHEN 'PropertyOwner' THEN ARRAY['payments.read.own','payments.create.own','paymentReceipts.create.own','paymentReceipts.download.own']
  WHEN 'Resident' THEN ARRAY['payments.read.own','payments.create.own','paymentReceipts.create.own','paymentReceipts.download.own']
  ELSE ARRAY[]::text[] END
) WHERE r."scope" = 'tenant' ON CONFLICT ("role_id","permission_id") DO NOTHING;

ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK (("action","category","outcome","resource_type") IN (
 ('platformAdmin.bootstrap.completed','platform','success','UserProfile'),('tenant.created','tenant','success','Tenant'),('tenant.baseRoles.created','tenant','success','Role'),('tenant.updated','tenant','success','Tenant'),('tenant.activated','tenant','success','Tenant'),('tenant.suspended','tenant','success','Tenant'),('tenant.reactivated','tenant','success','Tenant'),('tenant.archived','tenant','success','Tenant'),('tenant.profile.updated','tenant','success','TenantProfile'),('tenant.branding.updated','tenant','success','TenantBranding'),('tenant.wordpressMapping.updated','tenant','success','TenantWordPressMapping'),('tenantSetting.updated','tenant','success','TenantSettingValue'),
 ('user.created','identity','success','UserProfile'),('user.updated','identity','success','UserProfile'),('user.disabled','identity','success','UserProfile'),('user.enabled','identity','success','UserProfile'),('user.keycloakLinked','identity','success','UserProfile'),('globalRole.assigned','access','success','UserGlobalRole'),('globalRole.removed','access','success','UserGlobalRole'),('invitation.created','access','success','Invitation'),('invitation.accepted','access','success','Invitation'),('invitation.revoked','access','success','Invitation'),('invitation.expired','access','success','Invitation'),('membership.created','access','success','UserTenantMembership'),('membership.suspended','access','success','UserTenantMembership'),('membership.revoked','access','success','UserTenantMembership'),('membership.roleAssigned','access','success','MembershipRole'),('membership.roleRemoved','access','success','MembershipRole'),('authentication.denied','security','denied','Authentication'),('authorization.denied','access','denied','Authorization'),('tenantAccess.denied','access','denied','TenantAccess'),
 ('propertyUnit.created','tenant','success','PropertyUnit'),('propertyUnit.updated','tenant','success','PropertyUnit'),('propertyUnit.statusChanged','tenant','success','PropertyUnit'),('propertyUnit.archived','tenant','success','PropertyUnit'),('person.created','tenant','success','Person'),('person.updated','tenant','success','Person'),('person.statusChanged','tenant','success','Person'),('person.archived','tenant','success','Person'),('person.identityLinked','tenant','success','Person'),('person.identityUnlinked','tenant','success','Person'),('legalEntity.created','tenant','success','LegalEntity'),('legalEntity.updated','tenant','success','LegalEntity'),('legalEntity.statusChanged','tenant','success','LegalEntity'),('legalEntity.archived','tenant','success','LegalEntity'),('propertyOwnership.created','tenant','success','PropertyOwnership'),('propertyOwnership.updated','tenant','success','PropertyOwnership'),('propertyOwnership.disputed','tenant','success','PropertyOwnership'),('propertyOwnership.resolved','tenant','success','PropertyOwnership'),('propertyOwnership.ended','tenant','success','PropertyOwnership'),('propertyOwnership.archived','tenant','success','PropertyOwnership'),('residency.created','tenant','success','Residency'),('residency.updated','tenant','success','Residency'),('residency.suspended','tenant','success','Residency'),('residency.reactivated','tenant','success','Residency'),('residency.ended','tenant','success','Residency'),('residency.archived','tenant','success','Residency'),('lease.created','tenant','success','Lease'),('lease.updated','tenant','success','Lease'),('lease.activated','tenant','success','Lease'),('lease.cancelled','tenant','success','Lease'),('lease.ended','tenant','success','Lease'),('lease.archived','tenant','success','Lease'),
 ('document.uploadFinalized','security','success','SecureDocument'),('document.compensationFailed','security','success','SecureDocument'),('document.orphanDetected','security','success','SecureDocument'),('document.orphanReconciled','security','success','SecureDocument'),('document.quarantined','security','success','SecureDocument'),('document.rejected','security','success','SecureDocument'),
 ('chargeConcept.created','tenant','success','ChargeConcept'),('chargeConcept.updated','tenant','success','ChargeConcept'),('chargeConcept.archived','tenant','success','ChargeConcept'),('feeSchedule.created','tenant','success','FeeSchedule'),('feeSchedule.updated','tenant','success','FeeSchedule'),('feeSchedule.archived','tenant','success','FeeSchedule'),('unitFee.assigned','tenant','success','UnitFee'),('unitFee.ended','tenant','success','UnitFee'),('billingPeriod.created','tenant','success','BillingPeriod'),('billingPeriod.closed','tenant','success','BillingPeriod'),('billingPeriod.locked','tenant','success','BillingPeriod'),('chargeBatch.created','tenant','success','ChargeBatch'),('chargeBatch.completed','tenant','success','ChargeBatch'),('chargeBatch.completedWithErrors','tenant','success','ChargeBatch'),('charge.created','tenant','success','Charge'),('charge.cancelled','tenant','success','Charge'),('charge.adjusted','tenant','success','Charge'),('charge.reversed','tenant','success','Charge'),
 ('payment.created','tenant','success','Payment'),('payment.reported','tenant','success','Payment'),('payment.confirmed','tenant','success','Payment'),('payment.rejected','tenant','success','Payment'),('paymentReceipt.uploaded','tenant','success','PaymentReceipt'),('paymentReceipt.reuploaded','tenant','success','PaymentReceipt'),('paymentReceipt.accepted','tenant','success','PaymentReceipt'),('paymentReceipt.rejected','tenant','success','PaymentReceipt'),('paymentReceipt.downloaded','tenant','success','PaymentReceipt')
));

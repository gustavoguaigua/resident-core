CREATE TYPE "payment_allocation_status" AS ENUM ('active','reversed');

CREATE UNIQUE INDEX "charges_id_tenant_id_property_unit_id_key" ON "charges"("id","tenant_id","property_unit_id");
CREATE UNIQUE INDEX "payments_id_tenant_id_property_unit_id_key" ON "payments"("id","tenant_id","property_unit_id");

ALTER TABLE "payments" DROP CONSTRAINT "payments_allocation_check";
ALTER TABLE "payments" ADD CONSTRAINT "payments_allocation_check" CHECK (
  "allocated_amount" >= 0 AND scale("allocated_amount") <= 2 AND
  "unallocated_amount" >= 0 AND scale("unallocated_amount") <= 2 AND
  (
    ("status" = 'REVERSED' AND "allocated_amount" = 0 AND "unallocated_amount" = 0) OR
    ("status" <> 'REVERSED' AND "allocated_amount" + "unallocated_amount" = "amount")
  )
);

CREATE TABLE "payment_allocations" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "charge_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "status" "payment_allocation_status" NOT NULL DEFAULT 'active',
  "allocated_by" TEXT NOT NULL,
  "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_allocations_amount_check" CHECK ("amount" > 0 AND scale("amount") <= 2),
  CONSTRAINT "payment_allocations_currency_check" CHECK ("currency" = 'USD')
);

CREATE TABLE "payment_allocation_reversals" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "allocation_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "reason" VARCHAR(500) NOT NULL,
  "reversed_by" TEXT NOT NULL,
  "reversed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_allocation_reversals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_allocation_reversals_amount_check" CHECK ("amount" > 0 AND scale("amount") <= 2),
  CONSTRAINT "payment_allocation_reversals_currency_check" CHECK ("currency" = 'USD')
);

CREATE TABLE "payment_reversals" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "reason" VARCHAR(500) NOT NULL,
  "reversed_by" TEXT NOT NULL,
  "reversed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_reversals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_reversals_amount_check" CHECK ("amount" > 0 AND scale("amount") <= 2),
  CONSTRAINT "payment_reversals_currency_check" CHECK ("currency" = 'USD')
);

CREATE UNIQUE INDEX "payment_allocations_id_tenant_id_key" ON "payment_allocations"("id","tenant_id");
CREATE INDEX "payment_allocations_tenant_id_payment_id_status_idx" ON "payment_allocations"("tenant_id","payment_id","status");
CREATE INDEX "payment_allocations_tenant_id_charge_id_status_idx" ON "payment_allocations"("tenant_id","charge_id","status");
CREATE INDEX "payment_allocations_tenant_id_property_unit_id_idx" ON "payment_allocations"("tenant_id","property_unit_id");
CREATE INDEX "payment_allocations_tenant_id_allocated_at_idx" ON "payment_allocations"("tenant_id","allocated_at");
CREATE UNIQUE INDEX "payment_allocation_reversals_id_tenant_id_key" ON "payment_allocation_reversals"("id","tenant_id");
CREATE UNIQUE INDEX "payment_allocation_reversals_allocation_id_tenant_id_key" ON "payment_allocation_reversals"("allocation_id","tenant_id");
CREATE INDEX "payment_allocation_reversals_tenant_id_reversed_at_idx" ON "payment_allocation_reversals"("tenant_id","reversed_at");
CREATE UNIQUE INDEX "payment_reversals_id_tenant_id_key" ON "payment_reversals"("id","tenant_id");
CREATE UNIQUE INDEX "payment_reversals_payment_id_tenant_id_key" ON "payment_reversals"("payment_id","tenant_id");
CREATE INDEX "payment_reversals_tenant_id_reversed_at_idx" ON "payment_reversals"("tenant_id","reversed_at");

ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_tenant_id_property_unit_id_fkey" FOREIGN KEY ("payment_id","tenant_id","property_unit_id") REFERENCES "payments"("id","tenant_id","property_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_charge_id_tenant_id_property_unit_id_fkey" FOREIGN KEY ("charge_id","tenant_id","property_unit_id") REFERENCES "charges"("id","tenant_id","property_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocation_reversals" ADD CONSTRAINT "payment_allocation_reversals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocation_reversals" ADD CONSTRAINT "payment_allocation_reversals_allocation_id_tenant_id_fkey" FOREIGN KEY ("allocation_id","tenant_id") REFERENCES "payment_allocations"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_allocation_reversals" ADD CONSTRAINT "payment_allocation_reversals_reversed_by_fkey" FOREIGN KEY ("reversed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_payment_id_tenant_id_fkey" FOREIGN KEY ("payment_id","tenant_id") REFERENCES "payments"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_reversals" ADD CONSTRAINT "payment_reversals_reversed_by_fkey" FOREIGN KEY ("reversed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "permissions" ("id","code","module","action","description","is_system","created_at","updated_at")
SELECT gen_random_uuid(), p.code, p.module, p.action, 'System permission ' || p.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM (VALUES
 ('payments.allocate','payments','allocate'),
 ('payments.reverse','payments','reverse'),
 ('payments.allocations.reverse','payments','allocations.reverse')
) AS p(code,module,action) ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id","role_id","permission_id","created_at")
SELECT gen_random_uuid(), r."id", p."id", CURRENT_TIMESTAMP
FROM "roles" r
JOIN "permissions" p ON p."code" = ANY (
  CASE r."code"
    WHEN 'TenantAdmin' THEN ARRAY['payments.allocate','payments.reverse','payments.allocations.reverse']
    WHEN 'Treasurer' THEN ARRAY['payments.allocate','payments.reverse','payments.allocations.reverse']
    ELSE ARRAY[]::text[]
  END
)
WHERE r."scope" = 'tenant'
ON CONFLICT ("role_id","permission_id") DO NOTHING;

ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK (("action","category","outcome","resource_type") IN (
 ('platformAdmin.bootstrap.completed','platform','success','UserProfile'),('tenant.created','tenant','success','Tenant'),('tenant.baseRoles.created','tenant','success','Role'),('tenant.updated','tenant','success','Tenant'),('tenant.activated','tenant','success','Tenant'),('tenant.suspended','tenant','success','Tenant'),('tenant.reactivated','tenant','success','Tenant'),('tenant.archived','tenant','success','Tenant'),('tenant.profile.updated','tenant','success','TenantProfile'),('tenant.branding.updated','tenant','success','TenantBranding'),('tenant.wordpressMapping.updated','tenant','success','TenantWordPressMapping'),('tenantSetting.updated','tenant','success','TenantSettingValue'),
 ('user.created','identity','success','UserProfile'),('user.updated','identity','success','UserProfile'),('user.disabled','identity','success','UserProfile'),('user.enabled','identity','success','UserProfile'),('user.keycloakLinked','identity','success','UserProfile'),('globalRole.assigned','access','success','UserGlobalRole'),('globalRole.removed','access','success','UserGlobalRole'),('invitation.created','access','success','Invitation'),('invitation.accepted','access','success','Invitation'),('invitation.revoked','access','success','Invitation'),('invitation.expired','access','success','Invitation'),('membership.created','access','success','UserTenantMembership'),('membership.suspended','access','success','UserTenantMembership'),('membership.revoked','access','success','UserTenantMembership'),('membership.roleAssigned','access','success','MembershipRole'),('membership.roleRemoved','access','success','MembershipRole'),('authentication.denied','security','denied','Authentication'),('authorization.denied','access','denied','Authorization'),('tenantAccess.denied','access','denied','TenantAccess'),
 ('propertyUnit.created','tenant','success','PropertyUnit'),('propertyUnit.updated','tenant','success','PropertyUnit'),('propertyUnit.statusChanged','tenant','success','PropertyUnit'),('propertyUnit.archived','tenant','success','PropertyUnit'),('person.created','tenant','success','Person'),('person.updated','tenant','success','Person'),('person.statusChanged','tenant','success','Person'),('person.archived','tenant','success','Person'),('person.identityLinked','tenant','success','Person'),('person.identityUnlinked','tenant','success','Person'),('legalEntity.created','tenant','success','LegalEntity'),('legalEntity.updated','tenant','success','LegalEntity'),('legalEntity.statusChanged','tenant','success','LegalEntity'),('legalEntity.archived','tenant','success','LegalEntity'),('propertyOwnership.created','tenant','success','PropertyOwnership'),('propertyOwnership.updated','tenant','success','PropertyOwnership'),('propertyOwnership.disputed','tenant','success','PropertyOwnership'),('propertyOwnership.resolved','tenant','success','PropertyOwnership'),('propertyOwnership.ended','tenant','success','PropertyOwnership'),('propertyOwnership.archived','tenant','success','PropertyOwnership'),('residency.created','tenant','success','Residency'),('residency.updated','tenant','success','Residency'),('residency.suspended','tenant','success','Residency'),('residency.reactivated','tenant','success','Residency'),('residency.ended','tenant','success','Residency'),('residency.archived','tenant','success','Residency'),('lease.created','tenant','success','Lease'),('lease.updated','tenant','success','Lease'),('lease.activated','tenant','success','Lease'),('lease.cancelled','tenant','success','Lease'),('lease.ended','tenant','success','Lease'),('lease.archived','tenant','success','Lease'),
 ('document.uploadFinalized','security','success','SecureDocument'),('document.compensationFailed','security','success','SecureDocument'),('document.orphanDetected','security','success','SecureDocument'),('document.orphanReconciled','security','success','SecureDocument'),('document.quarantined','security','success','SecureDocument'),('document.rejected','security','success','SecureDocument'),
 ('chargeConcept.created','tenant','success','ChargeConcept'),('chargeConcept.updated','tenant','success','ChargeConcept'),('chargeConcept.archived','tenant','success','ChargeConcept'),('feeSchedule.created','tenant','success','FeeSchedule'),('feeSchedule.updated','tenant','success','FeeSchedule'),('feeSchedule.archived','tenant','success','FeeSchedule'),('unitFee.assigned','tenant','success','UnitFee'),('unitFee.ended','tenant','success','UnitFee'),('billingPeriod.created','tenant','success','BillingPeriod'),('billingPeriod.closed','tenant','success','BillingPeriod'),('billingPeriod.locked','tenant','success','BillingPeriod'),('chargeBatch.created','tenant','success','ChargeBatch'),('chargeBatch.completed','tenant','success','ChargeBatch'),('chargeBatch.completedWithErrors','tenant','success','ChargeBatch'),('charge.created','tenant','success','Charge'),('charge.cancelled','tenant','success','Charge'),('charge.adjusted','tenant','success','Charge'),('charge.reversed','tenant','success','Charge'),
 ('payment.created','tenant','success','Payment'),('payment.reported','tenant','success','Payment'),('payment.confirmed','tenant','success','Payment'),('payment.rejected','tenant','success','Payment'),('paymentReceipt.uploaded','tenant','success','PaymentReceipt'),('paymentReceipt.reuploaded','tenant','success','PaymentReceipt'),('paymentReceipt.accepted','tenant','success','PaymentReceipt'),('paymentReceipt.rejected','tenant','success','PaymentReceipt'),('paymentReceipt.downloaded','tenant','success','PaymentReceipt'),
 ('payment.reversed','tenant','success','Payment'),('paymentAllocation.created','tenant','success','PaymentAllocation'),('paymentAllocation.reversed','tenant','success','PaymentAllocation')
));

CREATE TYPE "charge_batch_status" AS ENUM ('draft', 'processing', 'completed', 'completedWithErrors', 'cancelled');
CREATE TYPE "charge_batch_type" AS ENUM ('monthlyGeneration');
CREATE TYPE "charge_status" AS ENUM ('draft', 'issued', 'partiallyPaid', 'paid', 'cancelled', 'reversed');
CREATE TYPE "charge_type" AS ENUM ('ordinary', 'extraordinary', 'manual', 'fine', 'reservation', 'other');
CREATE TYPE "charge_adjustment_type" AS ENUM ('increase', 'decrease');

CREATE TABLE "charge_batches" (
  "id" TEXT NOT NULL, "tenant_id" TEXT NOT NULL,
  "billing_period_id" TEXT NOT NULL, "fee_schedule_id" TEXT,
  "type" "charge_batch_type" NOT NULL DEFAULT 'monthlyGeneration',
  "status" "charge_batch_status" NOT NULL DEFAULT 'draft', "requested_by" TEXT NOT NULL,
  "started_at" TIMESTAMP(3), "completed_at" TIMESTAMP(3),
  "total_items" INTEGER NOT NULL DEFAULT 0, "success_items" INTEGER NOT NULL DEFAULT 0,
  "skipped_items" INTEGER NOT NULL DEFAULT 0, "failed_items" INTEGER NOT NULL DEFAULT 0,
  "error_summary" JSONB, "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "charge_batches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "charge_batches_counts_check" CHECK ("total_items" >= 0 AND "success_items" >= 0 AND "skipped_items" >= 0 AND "failed_items" >= 0 AND (("status" IN ('completed','completedWithErrors') AND "total_items" = "success_items" + "skipped_items" + "failed_items") OR ("status" NOT IN ('completed','completedWithErrors') AND "total_items" >= "success_items" + "skipped_items" + "failed_items"))),
  CONSTRAINT "charge_batches_completion_check" CHECK (("status" IN ('completed','completedWithErrors') AND "completed_at" IS NOT NULL) OR ("status" NOT IN ('completed','completedWithErrors') AND "completed_at" IS NULL)),
  CONSTRAINT "charge_batches_error_state_check" CHECK (("status" = 'completedWithErrors' AND "failed_items" > 0 AND "error_summary" IS NOT NULL) OR ("status" <> 'completedWithErrors' AND "failed_items" = 0 AND "error_summary" IS NULL)),
  CONSTRAINT "charge_batches_currency_check" CHECK ("currency" = 'USD')
);

CREATE TABLE "charges" (
  "id" TEXT NOT NULL, "tenant_id" TEXT NOT NULL,
  "billing_period_id" TEXT NOT NULL, "property_unit_id" TEXT NOT NULL,
  "charge_concept_id" TEXT NOT NULL, "fee_schedule_id" TEXT, "charge_batch_id" TEXT,
  "type" "charge_type" NOT NULL, "description" VARCHAR(500),
  "original_amount" DECIMAL(12,2) NOT NULL, "effective_amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD', "issued_date" DATE NOT NULL,
  "due_date" DATE NOT NULL, "status" "charge_status" NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "cancelled_at" TIMESTAMP(3), "cancelled_by" TEXT, "cancellation_reason" VARCHAR(500),
  CONSTRAINT "charges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "charges_amount_check" CHECK ("original_amount" > 0 AND "effective_amount" >= 0),
  CONSTRAINT "charges_dates_check" CHECK ("due_date" >= "issued_date"),
  CONSTRAINT "charges_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "charges_cancelled_check" CHECK (("status" = 'cancelled' AND "cancelled_at" IS NOT NULL AND "cancelled_by" IS NOT NULL AND "cancellation_reason" IS NOT NULL AND "effective_amount" = 0) OR ("status" <> 'cancelled' AND "cancelled_at" IS NULL AND "cancelled_by" IS NULL AND "cancellation_reason" IS NULL)),
  CONSTRAINT "charges_reversed_check" CHECK (("status" = 'reversed' AND "effective_amount" = 0) OR "status" <> 'reversed')
);

CREATE TABLE "charge_adjustments" (
  "id" TEXT NOT NULL, "tenant_id" TEXT NOT NULL, "charge_id" TEXT NOT NULL,
  "type" "charge_adjustment_type" NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
  "effective_date" DATE NOT NULL, "reason" VARCHAR(500) NOT NULL, "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "charge_adjustments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "charge_adjustments_amount_check" CHECK ("amount" > 0),
  CONSTRAINT "charge_adjustments_reason_check" CHECK (length(btrim("reason")) > 0)
);

CREATE TABLE "charge_reversals" (
  "id" TEXT NOT NULL, "tenant_id" TEXT NOT NULL, "charge_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "effective_date" DATE NOT NULL, "reason" VARCHAR(500) NOT NULL, "reversed_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "charge_reversals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "charge_reversals_amount_check" CHECK ("amount" > 0),
  CONSTRAINT "charge_reversals_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "charge_reversals_reason_check" CHECK (length(btrim("reason")) > 0)
);

CREATE UNIQUE INDEX "charge_batches_id_tenant_id_key" ON "charge_batches"("id","tenant_id");
CREATE INDEX "charge_batches_tenant_id_status_idx" ON "charge_batches"("tenant_id","status");
CREATE INDEX "charge_batches_tenant_id_billing_period_id_idx" ON "charge_batches"("tenant_id","billing_period_id");
CREATE INDEX "charge_batches_tenant_id_created_at_idx" ON "charge_batches"("tenant_id","created_at");
CREATE UNIQUE INDEX "charges_id_tenant_id_key" ON "charges"("id","tenant_id");
CREATE UNIQUE INDEX "charges_generation_natural_key" ON "charges"("tenant_id","billing_period_id","charge_concept_id","property_unit_id","type") WHERE "charge_batch_id" IS NOT NULL;
CREATE INDEX "charges_tenant_id_status_idx" ON "charges"("tenant_id","status");
CREATE INDEX "charges_tenant_id_property_unit_id_issued_date_idx" ON "charges"("tenant_id","property_unit_id","issued_date");
CREATE INDEX "charges_tenant_id_billing_period_id_idx" ON "charges"("tenant_id","billing_period_id");
CREATE INDEX "charges_tenant_id_charge_batch_id_idx" ON "charges"("tenant_id","charge_batch_id");
CREATE UNIQUE INDEX "charge_adjustments_id_tenant_id_key" ON "charge_adjustments"("id","tenant_id");
CREATE INDEX "charge_adjustments_tenant_id_charge_id_created_at_idx" ON "charge_adjustments"("tenant_id","charge_id","created_at");
CREATE UNIQUE INDEX "charge_reversals_id_tenant_id_key" ON "charge_reversals"("id","tenant_id");
CREATE UNIQUE INDEX "charge_reversals_charge_id_tenant_id_key" ON "charge_reversals"("charge_id","tenant_id");
CREATE INDEX "charge_reversals_tenant_id_created_at_idx" ON "charge_reversals"("tenant_id","created_at");

ALTER TABLE "charge_batches" ADD CONSTRAINT "charge_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_batches" ADD CONSTRAINT "charge_batches_billing_period_id_tenant_id_fkey" FOREIGN KEY ("billing_period_id","tenant_id") REFERENCES "billing_periods"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_batches" ADD CONSTRAINT "charge_batches_fee_schedule_id_tenant_id_fkey" FOREIGN KEY ("fee_schedule_id","tenant_id") REFERENCES "fee_schedules"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_batches" ADD CONSTRAINT "charge_batches_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_billing_period_id_tenant_id_fkey" FOREIGN KEY ("billing_period_id","tenant_id") REFERENCES "billing_periods"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_charge_concept_id_tenant_id_fkey" FOREIGN KEY ("charge_concept_id","tenant_id") REFERENCES "charge_concepts"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_fee_schedule_id_tenant_id_fkey" FOREIGN KEY ("fee_schedule_id","tenant_id") REFERENCES "fee_schedules"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_charge_batch_id_tenant_id_fkey" FOREIGN KEY ("charge_batch_id","tenant_id") REFERENCES "charge_batches"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charges" ADD CONSTRAINT "charges_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_adjustments" ADD CONSTRAINT "charge_adjustments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_adjustments" ADD CONSTRAINT "charge_adjustments_charge_id_tenant_id_fkey" FOREIGN KEY ("charge_id","tenant_id") REFERENCES "charges"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_adjustments" ADD CONSTRAINT "charge_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_reversals" ADD CONSTRAINT "charge_reversals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_reversals" ADD CONSTRAINT "charge_reversals_charge_id_tenant_id_fkey" FOREIGN KEY ("charge_id","tenant_id") REFERENCES "charges"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "charge_reversals" ADD CONSTRAINT "charge_reversals_reversed_by_fkey" FOREIGN KEY ("reversed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_charge_original_amount_change"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."original_amount" <> OLD."original_amount" THEN RAISE EXCEPTION 'charge original amount is immutable'; END IF; RETURN NEW; END $$;
CREATE TRIGGER "charges_original_amount_immutable" BEFORE UPDATE ON "charges" FOR EACH ROW EXECUTE FUNCTION "prevent_charge_original_amount_change"();
CREATE FUNCTION "prevent_charge_history_mutation"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'charge history is append-only'; END $$;
CREATE TRIGGER "charge_adjustments_append_only" BEFORE UPDATE OR DELETE ON "charge_adjustments" FOR EACH ROW EXECUTE FUNCTION "prevent_charge_history_mutation"();
CREATE TRIGGER "charge_reversals_append_only" BEFORE UPDATE OR DELETE ON "charge_reversals" FOR EACH ROW EXECUTE FUNCTION "prevent_charge_history_mutation"();

INSERT INTO "permissions" ("id","code","module","action","description","is_system","created_at","updated_at")
SELECT gen_random_uuid(), p.code, p.module, p.action, 'System permission ' || p.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM (VALUES
 ('billingPeriods.close','billingPeriods','close'),('billingPeriods.lock','billingPeriods','lock'),('fees.generate','fees','generate'),('fees.readBatches','fees','readBatches'),
 ('charges.read','charges','read'),('charges.create','charges','create'),('charges.cancel','charges','cancel'),('charges.adjust','charges','adjust'),('charges.reverse','charges','reverse'),('charges.read.own','charges','read.own')
) AS p(code,module,action) ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id","role_id","permission_id","created_at") SELECT gen_random_uuid(), r."id", p."id", CURRENT_TIMESTAMP FROM "roles" r JOIN "permissions" p ON p."code" = ANY (
 CASE r."code"
  WHEN 'TenantAdmin' THEN ARRAY['billingPeriods.close','billingPeriods.lock','fees.generate','fees.readBatches','charges.read','charges.create','charges.cancel','charges.adjust','charges.reverse']
  WHEN 'Treasurer' THEN ARRAY['billingPeriods.close','billingPeriods.lock','fees.generate','fees.readBatches','charges.read','charges.create','charges.cancel','charges.adjust','charges.reverse']
  WHEN 'BoardMember' THEN ARRAY['fees.readBatches','charges.read']
  WHEN 'TenantAuditor' THEN ARRAY['fees.readBatches','charges.read']
  WHEN 'ExternalAccountant' THEN ARRAY['fees.readBatches','charges.read']
  WHEN 'PropertyOwner' THEN ARRAY['charges.read.own']
  WHEN 'Resident' THEN ARRAY['charges.read.own']
  ELSE ARRAY[]::text[] END
) WHERE r."scope" = 'tenant' ON CONFLICT ("role_id","permission_id") DO NOTHING;

ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK (("action","category","outcome","resource_type") IN (
 ('platformAdmin.bootstrap.completed','platform','success','UserProfile'),('tenant.created','tenant','success','Tenant'),('tenant.baseRoles.created','tenant','success','Role'),('tenant.updated','tenant','success','Tenant'),('tenant.activated','tenant','success','Tenant'),('tenant.suspended','tenant','success','Tenant'),('tenant.reactivated','tenant','success','Tenant'),('tenant.archived','tenant','success','Tenant'),('tenant.profile.updated','tenant','success','TenantProfile'),('tenant.branding.updated','tenant','success','TenantBranding'),('tenant.wordpressMapping.updated','tenant','success','TenantWordPressMapping'),('tenantSetting.updated','tenant','success','TenantSettingValue'),
 ('user.created','identity','success','UserProfile'),('user.updated','identity','success','UserProfile'),('user.disabled','identity','success','UserProfile'),('user.enabled','identity','success','UserProfile'),('user.keycloakLinked','identity','success','UserProfile'),('globalRole.assigned','access','success','UserGlobalRole'),('globalRole.removed','access','success','UserGlobalRole'),('invitation.created','access','success','Invitation'),('invitation.accepted','access','success','Invitation'),('invitation.revoked','access','success','Invitation'),('invitation.expired','access','success','Invitation'),('membership.created','access','success','UserTenantMembership'),('membership.suspended','access','success','UserTenantMembership'),('membership.revoked','access','success','UserTenantMembership'),('membership.roleAssigned','access','success','MembershipRole'),('membership.roleRemoved','access','success','MembershipRole'),('authentication.denied','security','denied','Authentication'),('authorization.denied','access','denied','Authorization'),('tenantAccess.denied','access','denied','TenantAccess'),
 ('propertyUnit.created','tenant','success','PropertyUnit'),('propertyUnit.updated','tenant','success','PropertyUnit'),('propertyUnit.statusChanged','tenant','success','PropertyUnit'),('propertyUnit.archived','tenant','success','PropertyUnit'),('person.created','tenant','success','Person'),('person.updated','tenant','success','Person'),('person.statusChanged','tenant','success','Person'),('person.archived','tenant','success','Person'),('person.identityLinked','tenant','success','Person'),('person.identityUnlinked','tenant','success','Person'),('legalEntity.created','tenant','success','LegalEntity'),('legalEntity.updated','tenant','success','LegalEntity'),('legalEntity.statusChanged','tenant','success','LegalEntity'),('legalEntity.archived','tenant','success','LegalEntity'),('propertyOwnership.created','tenant','success','PropertyOwnership'),('propertyOwnership.updated','tenant','success','PropertyOwnership'),('propertyOwnership.disputed','tenant','success','PropertyOwnership'),('propertyOwnership.resolved','tenant','success','PropertyOwnership'),('propertyOwnership.ended','tenant','success','PropertyOwnership'),('propertyOwnership.archived','tenant','success','PropertyOwnership'),('residency.created','tenant','success','Residency'),('residency.updated','tenant','success','Residency'),('residency.suspended','tenant','success','Residency'),('residency.reactivated','tenant','success','Residency'),('residency.ended','tenant','success','Residency'),('residency.archived','tenant','success','Residency'),('lease.created','tenant','success','Lease'),('lease.updated','tenant','success','Lease'),('lease.activated','tenant','success','Lease'),('lease.cancelled','tenant','success','Lease'),('lease.ended','tenant','success','Lease'),('lease.archived','tenant','success','Lease'),
 ('document.uploadFinalized','security','success','SecureDocument'),('document.compensationFailed','security','success','SecureDocument'),('document.orphanDetected','security','success','SecureDocument'),('document.orphanReconciled','security','success','SecureDocument'),('document.quarantined','security','success','SecureDocument'),('document.rejected','security','success','SecureDocument'),
 ('chargeConcept.created','tenant','success','ChargeConcept'),('chargeConcept.updated','tenant','success','ChargeConcept'),('chargeConcept.archived','tenant','success','ChargeConcept'),('feeSchedule.created','tenant','success','FeeSchedule'),('feeSchedule.updated','tenant','success','FeeSchedule'),('feeSchedule.archived','tenant','success','FeeSchedule'),('unitFee.assigned','tenant','success','UnitFee'),('unitFee.ended','tenant','success','UnitFee'),('billingPeriod.created','tenant','success','BillingPeriod'),
 ('billingPeriod.closed','tenant','success','BillingPeriod'),('billingPeriod.locked','tenant','success','BillingPeriod'),('chargeBatch.created','tenant','success','ChargeBatch'),('chargeBatch.completed','tenant','success','ChargeBatch'),('chargeBatch.completedWithErrors','tenant','success','ChargeBatch'),('charge.created','tenant','success','Charge'),('charge.cancelled','tenant','success','Charge'),('charge.adjusted','tenant','success','Charge'),('charge.reversed','tenant','success','Charge')
));

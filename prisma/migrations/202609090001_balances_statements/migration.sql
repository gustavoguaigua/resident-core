CREATE TYPE "account_statement_status" AS ENUM ('generated','published','closed','locked','superseded','archived');
CREATE TYPE "account_statement_line_type" AS ENUM ('openingBalance','charge','chargeAdjustment','chargeReversal','paymentAllocation','paymentAllocationReversal','creditBalance','closingBalance');
CREATE TYPE "balance_snapshot_status" AS ENUM ('current','superseded','closed','archived');
CREATE TYPE "statement_source_type" AS ENUM ('charge','chargeAdjustment','chargeReversal','paymentAllocation','paymentAllocationReversal','openingBalance','creditBalance','closingBalance');

CREATE TABLE "account_statements" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "billing_period_id" TEXT NOT NULL,
  "statement_number" VARCHAR(120) NOT NULL,
  "status" "account_statement_status" NOT NULL DEFAULT 'generated',
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "as_of_date" DATE NOT NULL,
  "opening_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "charges_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "adjustments_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "payments_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "reversals_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "credit_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "closing_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "overdue_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "not_due_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "line_count" INTEGER NOT NULL DEFAULT 0,
  "source_hash" CHAR(64) NOT NULL,
  "source_watermark" TIMESTAMP(3),
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "generated_by" TEXT NOT NULL,
  "published_at" TIMESTAMP(3),
  "published_by" TEXT,
  "closed_at" TIMESTAMP(3),
  "closed_by" TEXT,
  "close_reason" VARCHAR(500),
  "locked_at" TIMESTAMP(3),
  "locked_by" TEXT,
  "lock_reason" VARCHAR(500),
  "previous_statement_id" TEXT,
  "superseded_by_id" TEXT,
  "regeneration_reason" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "account_statements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "account_statements_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "account_statements_amounts_check" CHECK (
    "opening_balance" >= 0 AND "charges_total" >= 0 AND "adjustments_total" >= 0 AND
    "payments_total" >= 0 AND "reversals_total" >= 0 AND "credit_balance" >= 0 AND
    "closing_balance" >= 0 AND "overdue_balance" >= 0 AND "not_due_balance" >= 0 AND
    scale("opening_balance") <= 2 AND scale("charges_total") <= 2 AND
    scale("adjustments_total") <= 2 AND scale("payments_total") <= 2 AND
    scale("reversals_total") <= 2 AND scale("credit_balance") <= 2 AND
    scale("closing_balance") <= 2 AND scale("overdue_balance") <= 2 AND scale("not_due_balance") <= 2
  ),
  CONSTRAINT "account_statements_line_count_check" CHECK ("line_count" >= 0),
  CONSTRAINT "account_statements_source_hash_check" CHECK ("source_hash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "account_statements_lifecycle_check" CHECK (
    ("status" = 'generated' AND "published_at" IS NULL AND "closed_at" IS NULL AND "locked_at" IS NULL) OR
    ("status" = 'published' AND "published_at" IS NOT NULL AND "published_by" IS NOT NULL AND "closed_at" IS NULL AND "locked_at" IS NULL) OR
    ("status" = 'closed' AND "published_at" IS NOT NULL AND "closed_at" IS NOT NULL AND "closed_by" IS NOT NULL AND "close_reason" IS NOT NULL AND "locked_at" IS NULL) OR
    ("status" = 'locked' AND "published_at" IS NOT NULL AND "closed_at" IS NOT NULL AND "locked_at" IS NOT NULL AND "locked_by" IS NOT NULL AND "lock_reason" IS NOT NULL) OR
    ("status" IN ('superseded','archived'))
  )
);

CREATE TABLE "account_statement_lines" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "account_statement_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "billing_period_id" TEXT NOT NULL,
  "line_type" "account_statement_line_type" NOT NULL,
  "source_type" "statement_source_type",
  "source_id" TEXT,
  "description_code" VARCHAR(80) NOT NULL,
  "line_date" DATE NOT NULL,
  "due_date" DATE,
  "debit_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "credit_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "balance_after_line" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "sort_order" INTEGER NOT NULL,
  "is_visible_to_resident" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "account_statement_lines_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "account_statement_lines_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "account_statement_lines_amount_check" CHECK (
    "debit_amount" >= 0 AND "credit_amount" >= 0 AND scale("debit_amount") <= 2 AND scale("credit_amount") <= 2 AND
    NOT ("debit_amount" > 0 AND "credit_amount" > 0)
  ),
  CONSTRAINT "account_statement_lines_source_check" CHECK (
    ("source_type" IS NULL AND "source_id" IS NULL) OR ("source_type" IS NOT NULL AND "source_id" IS NOT NULL)
  ),
  CONSTRAINT "account_statement_lines_sort_check" CHECK ("sort_order" >= 0)
);

CREATE TABLE "unit_balances" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "outstanding_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "overdue_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "not_due_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "credit_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "unallocated_payment_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source_watermark" TIMESTAMP(3),
  "source_hash" CHAR(64) NOT NULL,
  "is_stale" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "unit_balances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unit_balances_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "unit_balances_amounts_check" CHECK (
    "outstanding_balance" >= 0 AND "overdue_balance" >= 0 AND "not_due_balance" >= 0 AND
    "credit_balance" >= 0 AND "unallocated_payment_balance" >= 0
  ),
  CONSTRAINT "unit_balances_source_hash_check" CHECK ("source_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "balance_snapshots" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "billing_period_id" TEXT,
  "account_statement_id" TEXT,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "as_of_date" DATE NOT NULL,
  "outstanding_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "overdue_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "not_due_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "credit_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "unallocated_payment_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "calculated_by" TEXT,
  "status" "balance_snapshot_status" NOT NULL DEFAULT 'current',
  "source_hash" CHAR(64) NOT NULL,
  "source_watermark" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "balance_snapshots_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "balance_snapshots_currency_check" CHECK ("currency" = 'USD'),
  CONSTRAINT "balance_snapshots_amounts_check" CHECK (
    "outstanding_balance" >= 0 AND "overdue_balance" >= 0 AND "not_due_balance" >= 0 AND
    "credit_balance" >= 0 AND "unallocated_payment_balance" >= 0
  ),
  CONSTRAINT "balance_snapshots_source_hash_check" CHECK ("source_hash" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "balance_snapshots_statement_period_check" CHECK (
    "account_statement_id" IS NULL OR "billing_period_id" IS NOT NULL
  )
);

CREATE UNIQUE INDEX "account_statements_id_tenant_id_key" ON "account_statements"("id","tenant_id");
CREATE UNIQUE INDEX "account_statements_id_tenant_id_property_unit_id_billing_pe_key" ON "account_statements"("id","tenant_id","property_unit_id","billing_period_id");
CREATE UNIQUE INDEX "account_statements_tenant_id_statement_number_key" ON "account_statements"("tenant_id","statement_number");
CREATE UNIQUE INDEX "account_statements_active_key" ON "account_statements"("tenant_id","property_unit_id","billing_period_id","currency") WHERE "status" IN ('generated','published','closed','locked');
CREATE INDEX "account_statements_tenant_id_property_unit_id_billing_perio_idx" ON "account_statements"("tenant_id","property_unit_id","billing_period_id","currency","status");
CREATE INDEX "account_statements_tenant_id_status_idx" ON "account_statements"("tenant_id","status");
CREATE UNIQUE INDEX "account_statement_lines_id_tenant_id_key" ON "account_statement_lines"("id","tenant_id");
CREATE UNIQUE INDEX "account_statement_lines_account_statement_id_sort_order_key" ON "account_statement_lines"("account_statement_id","sort_order");
CREATE UNIQUE INDEX "account_statement_lines_account_statement_id_source_type_so_key" ON "account_statement_lines"("account_statement_id","source_type","source_id");
CREATE INDEX "account_statement_lines_tenant_id_property_unit_id_line_dat_idx" ON "account_statement_lines"("tenant_id","property_unit_id","line_date");
CREATE INDEX "account_statement_lines_tenant_id_billing_period_id_idx" ON "account_statement_lines"("tenant_id","billing_period_id");
CREATE UNIQUE INDEX "unit_balances_id_tenant_id_key" ON "unit_balances"("id","tenant_id");
CREATE UNIQUE INDEX "unit_balances_tenant_id_property_unit_id_currency_key" ON "unit_balances"("tenant_id","property_unit_id","currency");
CREATE INDEX "unit_balances_tenant_id_is_stale_idx" ON "unit_balances"("tenant_id","is_stale");
CREATE UNIQUE INDEX "balance_snapshots_id_tenant_id_key" ON "balance_snapshots"("id","tenant_id");
CREATE INDEX "balance_snapshots_tenant_id_property_unit_id_calculated_at_idx" ON "balance_snapshots"("tenant_id","property_unit_id","calculated_at");
CREATE INDEX "balance_snapshots_tenant_id_billing_period_id_idx" ON "balance_snapshots"("tenant_id","billing_period_id");
CREATE INDEX "balance_snapshots_tenant_id_account_statement_id_idx" ON "balance_snapshots"("tenant_id","account_statement_id");

ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_billing_period_id_tenant_id_fkey" FOREIGN KEY ("billing_period_id","tenant_id") REFERENCES "billing_periods"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_previous_statement_id_tenant_id_fkey" FOREIGN KEY ("previous_statement_id","tenant_id") REFERENCES "account_statements"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_superseded_by_id_tenant_id_fkey" FOREIGN KEY ("superseded_by_id","tenant_id") REFERENCES "account_statements"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statement_lines" ADD CONSTRAINT "account_statement_lines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statement_lines" ADD CONSTRAINT "account_statement_lines_account_statement_id_tenant_id_pro_fkey" FOREIGN KEY ("account_statement_id","tenant_id","property_unit_id","billing_period_id") REFERENCES "account_statements"("id","tenant_id","property_unit_id","billing_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statement_lines" ADD CONSTRAINT "account_statement_lines_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_statement_lines" ADD CONSTRAINT "account_statement_lines_billing_period_id_tenant_id_fkey" FOREIGN KEY ("billing_period_id","tenant_id") REFERENCES "billing_periods"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_balances" ADD CONSTRAINT "unit_balances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_balances" ADD CONSTRAINT "unit_balances_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id","tenant_id") REFERENCES "property_units"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_billing_period_id_tenant_id_fkey" FOREIGN KEY ("billing_period_id","tenant_id") REFERENCES "billing_periods"("id","tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_account_statement_id_tenant_id_property__fkey" FOREIGN KEY ("account_statement_id","tenant_id","property_unit_id","billing_period_id") REFERENCES "account_statements"("id","tenant_id","property_unit_id","billing_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_calculated_by_fkey" FOREIGN KEY ("calculated_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "mark_unit_balance_stale_direct"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "unit_balances" SET "is_stale" = true, "updated_at" = CURRENT_TIMESTAMP
  WHERE "tenant_id" = NEW."tenant_id" AND "property_unit_id" = NEW."property_unit_id";
  RETURN NEW;
END;
$$;

CREATE FUNCTION "mark_unit_balance_stale_from_charge"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "unit_balances" SET "is_stale" = true, "updated_at" = CURRENT_TIMESTAMP
  WHERE "tenant_id" = NEW."tenant_id" AND "property_unit_id" = (
    SELECT "property_unit_id" FROM "charges" WHERE "id" = NEW."charge_id" AND "tenant_id" = NEW."tenant_id"
  );
  RETURN NEW;
END;
$$;

CREATE FUNCTION "mark_unit_balance_stale_from_allocation"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "unit_balances" SET "is_stale" = true, "updated_at" = CURRENT_TIMESTAMP
  WHERE "tenant_id" = NEW."tenant_id" AND "property_unit_id" = (
    SELECT "property_unit_id" FROM "payment_allocations" WHERE "id" = NEW."allocation_id" AND "tenant_id" = NEW."tenant_id"
  );
  RETURN NEW;
END;
$$;

CREATE FUNCTION "mark_unit_balance_stale_from_payment"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "unit_balances" SET "is_stale" = true, "updated_at" = CURRENT_TIMESTAMP
  WHERE "tenant_id" = NEW."tenant_id" AND "property_unit_id" = (
    SELECT "property_unit_id" FROM "payments" WHERE "id" = NEW."payment_id" AND "tenant_id" = NEW."tenant_id"
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER "charges_mark_balance_stale" AFTER INSERT OR UPDATE ON "charges" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_direct"();
CREATE TRIGGER "payments_mark_balance_stale" AFTER INSERT OR UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_direct"();
CREATE TRIGGER "allocations_mark_balance_stale" AFTER INSERT OR UPDATE ON "payment_allocations" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_direct"();
CREATE TRIGGER "adjustments_mark_balance_stale" AFTER INSERT ON "charge_adjustments" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_from_charge"();
CREATE TRIGGER "charge_reversals_mark_balance_stale" AFTER INSERT ON "charge_reversals" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_from_charge"();
CREATE TRIGGER "allocation_reversals_mark_balance_stale" AFTER INSERT ON "payment_allocation_reversals" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_from_allocation"();
CREATE TRIGGER "payment_reversals_mark_balance_stale" AFTER INSERT ON "payment_reversals" FOR EACH ROW EXECUTE FUNCTION "mark_unit_balance_stale_from_payment"();

INSERT INTO "permissions" ("id","code","module","action","description","is_system","created_at","updated_at")
SELECT gen_random_uuid(), p.code, p.module, p.action, 'System permission ' || p.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM (VALUES
 ('accountStatements.read','accountStatements','read'),('accountStatements.generate','accountStatements','generate'),
 ('accountStatements.publish','accountStatements','publish'),('accountStatements.close','accountStatements','close'),
 ('accountStatements.lock','accountStatements','lock'),('accountStatements.regenerate','accountStatements','regenerate'),
 ('accountStatements.read.own','accountStatements.read','own'),('balances.read','balances','read'),
 ('balances.recalculate','balances','recalculate'),('balances.read.own','balances.read','own'),
 ('financialMovements.read','financialMovements','read'),('financialMovements.read.own','financialMovements.read','own')
) AS p(code,module,action) ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id","role_id","permission_id","created_at")
SELECT gen_random_uuid(), r."id", p."id", CURRENT_TIMESTAMP FROM "roles" r JOIN "permissions" p ON p."code" = ANY (
  CASE r."code"
    WHEN 'TenantAdmin' THEN ARRAY['accountStatements.read','accountStatements.generate','accountStatements.publish','accountStatements.close','accountStatements.lock','accountStatements.regenerate','balances.read','balances.recalculate','financialMovements.read']
    WHEN 'Treasurer' THEN ARRAY['accountStatements.read','accountStatements.generate','accountStatements.publish','accountStatements.close','accountStatements.lock','accountStatements.regenerate','balances.read','balances.recalculate','financialMovements.read']
    WHEN 'BoardMember' THEN ARRAY['accountStatements.read','balances.read','financialMovements.read']
    WHEN 'TenantAuditor' THEN ARRAY['accountStatements.read','balances.read','financialMovements.read']
    WHEN 'ExternalAccountant' THEN ARRAY['accountStatements.read','balances.read','financialMovements.read']
    WHEN 'PropertyOwner' THEN ARRAY['accountStatements.read.own','balances.read.own','financialMovements.read.own']
    WHEN 'Resident' THEN ARRAY['accountStatements.read.own','balances.read.own','financialMovements.read.own']
    ELSE ARRAY[]::text[] END
) WHERE r."scope" = 'tenant' ON CONFLICT ("role_id","permission_id") DO NOTHING;

ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK (("action","category","outcome","resource_type") IN (
 ('platformAdmin.bootstrap.completed','platform','success','UserProfile'),('tenant.created','tenant','success','Tenant'),('tenant.baseRoles.created','tenant','success','Role'),('tenant.updated','tenant','success','Tenant'),('tenant.activated','tenant','success','Tenant'),('tenant.suspended','tenant','success','Tenant'),('tenant.reactivated','tenant','success','Tenant'),('tenant.archived','tenant','success','Tenant'),('tenant.profile.updated','tenant','success','TenantProfile'),('tenant.branding.updated','tenant','success','TenantBranding'),('tenant.wordpressMapping.updated','tenant','success','TenantWordPressMapping'),('tenantSetting.updated','tenant','success','TenantSettingValue'),
 ('user.created','identity','success','UserProfile'),('user.updated','identity','success','UserProfile'),('user.disabled','identity','success','UserProfile'),('user.enabled','identity','success','UserProfile'),('user.keycloakLinked','identity','success','UserProfile'),('globalRole.assigned','access','success','UserGlobalRole'),('globalRole.removed','access','success','UserGlobalRole'),('invitation.created','access','success','Invitation'),('invitation.accepted','access','success','Invitation'),('invitation.revoked','access','success','Invitation'),('invitation.expired','access','success','Invitation'),('membership.created','access','success','UserTenantMembership'),('membership.suspended','access','success','UserTenantMembership'),('membership.revoked','access','success','UserTenantMembership'),('membership.roleAssigned','access','success','MembershipRole'),('membership.roleRemoved','access','success','MembershipRole'),('authentication.denied','security','denied','Authentication'),('authorization.denied','access','denied','Authorization'),('tenantAccess.denied','access','denied','TenantAccess'),
 ('propertyUnit.created','tenant','success','PropertyUnit'),('propertyUnit.updated','tenant','success','PropertyUnit'),('propertyUnit.statusChanged','tenant','success','PropertyUnit'),('propertyUnit.archived','tenant','success','PropertyUnit'),('person.created','tenant','success','Person'),('person.updated','tenant','success','Person'),('person.statusChanged','tenant','success','Person'),('person.archived','tenant','success','Person'),('person.identityLinked','tenant','success','Person'),('person.identityUnlinked','tenant','success','Person'),('legalEntity.created','tenant','success','LegalEntity'),('legalEntity.updated','tenant','success','LegalEntity'),('legalEntity.statusChanged','tenant','success','LegalEntity'),('legalEntity.archived','tenant','success','LegalEntity'),('propertyOwnership.created','tenant','success','PropertyOwnership'),('propertyOwnership.updated','tenant','success','PropertyOwnership'),('propertyOwnership.disputed','tenant','success','PropertyOwnership'),('propertyOwnership.resolved','tenant','success','PropertyOwnership'),('propertyOwnership.ended','tenant','success','PropertyOwnership'),('propertyOwnership.archived','tenant','success','PropertyOwnership'),('residency.created','tenant','success','Residency'),('residency.updated','tenant','success','Residency'),('residency.suspended','tenant','success','Residency'),('residency.reactivated','tenant','success','Residency'),('residency.ended','tenant','success','Residency'),('residency.archived','tenant','success','Residency'),('lease.created','tenant','success','Lease'),('lease.updated','tenant','success','Lease'),('lease.activated','tenant','success','Lease'),('lease.cancelled','tenant','success','Lease'),('lease.ended','tenant','success','Lease'),('lease.archived','tenant','success','Lease'),
 ('document.uploadFinalized','security','success','SecureDocument'),('document.compensationFailed','security','success','SecureDocument'),('document.orphanDetected','security','success','SecureDocument'),('document.orphanReconciled','security','success','SecureDocument'),('document.quarantined','security','success','SecureDocument'),('document.rejected','security','success','SecureDocument'),
 ('chargeConcept.created','tenant','success','ChargeConcept'),('chargeConcept.updated','tenant','success','ChargeConcept'),('chargeConcept.archived','tenant','success','ChargeConcept'),('feeSchedule.created','tenant','success','FeeSchedule'),('feeSchedule.updated','tenant','success','FeeSchedule'),('feeSchedule.archived','tenant','success','FeeSchedule'),('unitFee.assigned','tenant','success','UnitFee'),('unitFee.ended','tenant','success','UnitFee'),('billingPeriod.created','tenant','success','BillingPeriod'),('billingPeriod.closed','tenant','success','BillingPeriod'),('billingPeriod.locked','tenant','success','BillingPeriod'),('chargeBatch.created','tenant','success','ChargeBatch'),('chargeBatch.completed','tenant','success','ChargeBatch'),('chargeBatch.completedWithErrors','tenant','success','ChargeBatch'),('charge.created','tenant','success','Charge'),('charge.cancelled','tenant','success','Charge'),('charge.adjusted','tenant','success','Charge'),('charge.reversed','tenant','success','Charge'),
 ('payment.created','tenant','success','Payment'),('payment.reported','tenant','success','Payment'),('payment.confirmed','tenant','success','Payment'),('payment.rejected','tenant','success','Payment'),('paymentReceipt.uploaded','tenant','success','PaymentReceipt'),('paymentReceipt.reuploaded','tenant','success','PaymentReceipt'),('paymentReceipt.accepted','tenant','success','PaymentReceipt'),('paymentReceipt.rejected','tenant','success','PaymentReceipt'),('paymentReceipt.downloaded','tenant','success','PaymentReceipt'),('payment.reversed','tenant','success','Payment'),('paymentAllocation.created','tenant','success','PaymentAllocation'),('paymentAllocation.reversed','tenant','success','PaymentAllocation'),
 ('accountStatement.generated','tenant','success','AccountStatement'),('accountStatement.batchGenerated','tenant','success','AccountStatement'),('accountStatement.published','tenant','success','AccountStatement'),('accountStatement.closed','tenant','success','AccountStatement'),('accountStatement.locked','tenant','success','AccountStatement'),('accountStatement.regenerated','tenant','success','AccountStatement'),('accountStatement.superseded','tenant','success','AccountStatement'),('balance.recalculated','tenant','success','UnitBalance')
));

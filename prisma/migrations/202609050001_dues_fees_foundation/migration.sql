CREATE TYPE "currency_code" AS ENUM ('USD');
CREATE TYPE "charge_concept_status" AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE "charge_concept_category" AS ENUM ('ordinary', 'extraordinary', 'service', 'fine', 'reservation', 'other');
CREATE TYPE "fee_schedule_status" AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE "fee_frequency" AS ENUM ('monthly', 'quarterly', 'annual', 'oneTime');
CREATE TYPE "unit_fee_assignment_status" AS ENUM ('active', 'ended', 'inactive', 'archived');
CREATE TYPE "billing_period_status" AS ENUM ('open', 'closed', 'locked', 'archived');

CREATE TABLE "charge_concepts" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "code" VARCHAR(80) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "category" "charge_concept_category" NOT NULL DEFAULT 'ordinary',
  "default_amount" DECIMAL(12,2),
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "status" "charge_concept_status" NOT NULL DEFAULT 'active',
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "charge_concepts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "charge_concepts_amount_check" CHECK ("default_amount" IS NULL OR "default_amount" > 0)
);

CREATE TABLE "fee_schedules" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "charge_concept_id" TEXT NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" "currency_code" NOT NULL DEFAULT 'USD',
  "frequency" "fee_frequency" NOT NULL DEFAULT 'monthly',
  "effective_from" DATE NOT NULL,
  "effective_to" DATE,
  "status" "fee_schedule_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "fee_schedules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fee_schedules_amount_check" CHECK ("amount" > 0),
  CONSTRAINT "fee_schedules_dates_check" CHECK ("effective_to" IS NULL OR "effective_to" >= "effective_from")
);

CREATE TABLE "unit_fee_assignments" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "property_unit_id" TEXT NOT NULL,
  "fee_schedule_id" TEXT NOT NULL,
  "status" "unit_fee_assignment_status" NOT NULL DEFAULT 'active',
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "ended_at" TIMESTAMP(3),
  "ended_by" TEXT,
  "end_reason" VARCHAR(500),
  CONSTRAINT "unit_fee_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "unit_fee_assignments_dates_check" CHECK ("end_date" IS NULL OR "end_date" >= "start_date"),
  CONSTRAINT "unit_fee_assignments_end_state_check" CHECK (
    ("status" = 'ended' AND "end_date" IS NOT NULL AND "ended_at" IS NOT NULL AND "ended_by" IS NOT NULL AND "end_reason" IS NOT NULL)
    OR "status" <> 'ended'
  )
);

CREATE TABLE "billing_periods" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "period_code" VARCHAR(7) NOT NULL,
  "starts_at" DATE NOT NULL,
  "ends_at" DATE NOT NULL,
  "due_date" DATE NOT NULL,
  "status" "billing_period_status" NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "closed_at" TIMESTAMP(3),
  "closed_by" TEXT,
  "locked_at" TIMESTAMP(3),
  "locked_by" TEXT,
  CONSTRAINT "billing_periods_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "billing_periods_code_check" CHECK ("period_code" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT "billing_periods_dates_check" CHECK (
    "starts_at" = date_trunc('month', "starts_at")::date
    AND "ends_at" = (date_trunc('month', "starts_at") + interval '1 month - 1 day')::date
    AND to_char("starts_at", 'YYYY-MM') = "period_code"
    AND "due_date" >= "starts_at"
  )
);

CREATE UNIQUE INDEX "charge_concepts_id_tenant_id_key" ON "charge_concepts"("id", "tenant_id");
CREATE UNIQUE INDEX "charge_concepts_tenant_id_code_key" ON "charge_concepts"("tenant_id", "code");
CREATE INDEX "charge_concepts_tenant_id_status_idx" ON "charge_concepts"("tenant_id", "status");
CREATE INDEX "charge_concepts_tenant_id_category_idx" ON "charge_concepts"("tenant_id", "category");
CREATE UNIQUE INDEX "fee_schedules_id_tenant_id_key" ON "fee_schedules"("id", "tenant_id");
CREATE UNIQUE INDEX "fee_schedules_tenant_id_charge_concept_id_name_key" ON "fee_schedules"("tenant_id", "charge_concept_id", "name");
CREATE INDEX "fee_schedules_tenant_id_status_idx" ON "fee_schedules"("tenant_id", "status");
CREATE INDEX "fee_schedules_tenant_id_charge_concept_id_idx" ON "fee_schedules"("tenant_id", "charge_concept_id");
CREATE INDEX "fee_schedules_tenant_id_effective_from_effective_to_idx" ON "fee_schedules"("tenant_id", "effective_from", "effective_to");
CREATE UNIQUE INDEX "unit_fee_assignments_id_tenant_id_key" ON "unit_fee_assignments"("id", "tenant_id");
CREATE INDEX "unit_fee_assignments_tenant_id_status_idx" ON "unit_fee_assignments"("tenant_id", "status");
CREATE INDEX "unit_fee_assignments_tenant_id_property_unit_id_idx" ON "unit_fee_assignments"("tenant_id", "property_unit_id");
CREATE INDEX "unit_fee_assignments_tenant_id_fee_schedule_id_idx" ON "unit_fee_assignments"("tenant_id", "fee_schedule_id");
CREATE INDEX "unit_fee_assignments_tenant_id_start_date_end_date_idx" ON "unit_fee_assignments"("tenant_id", "start_date", "end_date");
CREATE UNIQUE INDEX "unit_fee_assignments_one_active_equivalent" ON "unit_fee_assignments"("tenant_id", "property_unit_id", "fee_schedule_id") WHERE "status" = 'active';
CREATE UNIQUE INDEX "billing_periods_id_tenant_id_key" ON "billing_periods"("id", "tenant_id");
CREATE UNIQUE INDEX "billing_periods_tenant_id_period_code_key" ON "billing_periods"("tenant_id", "period_code");
CREATE INDEX "billing_periods_tenant_id_status_idx" ON "billing_periods"("tenant_id", "status");
CREATE INDEX "billing_periods_tenant_id_starts_at_ends_at_idx" ON "billing_periods"("tenant_id", "starts_at", "ends_at");

ALTER TABLE "charge_concepts" ADD CONSTRAINT "charge_concepts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_charge_concept_id_tenant_id_fkey" FOREIGN KEY ("charge_concept_id", "tenant_id") REFERENCES "charge_concepts"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id", "tenant_id") REFERENCES "property_units"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_fee_schedule_id_tenant_id_fkey" FOREIGN KEY ("fee_schedule_id", "tenant_id") REFERENCES "fee_schedules"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "unit_fee_assignments" ADD CONSTRAINT "unit_fee_assignments_ended_by_fkey" FOREIGN KEY ("ended_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "permissions" ("id", "code", "module", "action", "description", "is_system", "created_at", "updated_at")
SELECT gen_random_uuid(), p.code, p.module, p.action, 'System permission ' || p.code, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
 ('chargeConcepts.read','chargeConcepts','read'), ('chargeConcepts.create','chargeConcepts','create'), ('chargeConcepts.update','chargeConcepts','update'), ('chargeConcepts.archive','chargeConcepts','archive'),
 ('feeSchedules.read','feeSchedules','read'), ('feeSchedules.create','feeSchedules','create'), ('feeSchedules.update','feeSchedules','update'), ('feeSchedules.archive','feeSchedules','archive'),
 ('unitFees.read','unitFees','read'), ('unitFees.assign','unitFees','assign'), ('unitFees.end','unitFees','end'),
 ('billingPeriods.read','billingPeriods','read'), ('billingPeriods.create','billingPeriods','create')
) AS p(code,module,action) ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "created_at")
SELECT gen_random_uuid(), r."id", p."id", CURRENT_TIMESTAMP FROM "roles" r JOIN "permissions" p ON p."code" = ANY (
 CASE r."code"
  WHEN 'TenantAdmin' THEN ARRAY['chargeConcepts.read','chargeConcepts.create','chargeConcepts.update','chargeConcepts.archive','feeSchedules.read','feeSchedules.create','feeSchedules.update','feeSchedules.archive','unitFees.read','unitFees.assign','unitFees.end','billingPeriods.read','billingPeriods.create']
  WHEN 'Treasurer' THEN ARRAY['chargeConcepts.read','chargeConcepts.create','chargeConcepts.update','chargeConcepts.archive','feeSchedules.read','feeSchedules.create','feeSchedules.update','feeSchedules.archive','unitFees.read','unitFees.assign','unitFees.end','billingPeriods.read','billingPeriods.create']
  WHEN 'BoardMember' THEN ARRAY['chargeConcepts.read','feeSchedules.read','unitFees.read','billingPeriods.read']
  WHEN 'TenantAuditor' THEN ARRAY['chargeConcepts.read','feeSchedules.read','unitFees.read','billingPeriods.read']
  WHEN 'ExternalAccountant' THEN ARRAY['chargeConcepts.read','feeSchedules.read','unitFees.read','billingPeriods.read']
  ELSE ARRAY[]::text[] END
) WHERE r."scope" = 'tenant' ON CONFLICT ("role_id", "permission_id") DO NOTHING;

DO $migration$
DECLARE current_check text;
BEGIN
 SELECT pg_get_constraintdef(oid) INTO current_check FROM pg_constraint WHERE conname = 'audit_logs_catalog_check';
 current_check := substring(current_check FROM 8 FOR char_length(current_check) - 8);
 ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_catalog_check";
 EXECUTE format('ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_catalog_check" CHECK ((%s) OR (("action", "category", "outcome", "resource_type") IN (
  (''chargeConcept.created'',''tenant'',''success'',''ChargeConcept''), (''chargeConcept.updated'',''tenant'',''success'',''ChargeConcept''), (''chargeConcept.archived'',''tenant'',''success'',''ChargeConcept''),
  (''feeSchedule.created'',''tenant'',''success'',''FeeSchedule''), (''feeSchedule.updated'',''tenant'',''success'',''FeeSchedule''), (''feeSchedule.archived'',''tenant'',''success'',''FeeSchedule''),
  (''unitFee.assigned'',''tenant'',''success'',''UnitFee''), (''unitFee.ended'',''tenant'',''success'',''UnitFee''), (''billingPeriod.created'',''tenant'',''success'',''BillingPeriod'')
 )))', current_check);
END $migration$;

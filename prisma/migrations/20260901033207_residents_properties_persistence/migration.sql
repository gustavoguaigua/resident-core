-- CreateEnum
CREATE TYPE "person_status" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "legal_entity_status" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "identification_type" AS ENUM ('cedula', 'ruc', 'passport', 'other');

-- CreateEnum
CREATE TYPE "property_unit_status" AS ENUM ('active', 'inactive', 'underMaintenance', 'blocked', 'archived');

-- CreateEnum
CREATE TYPE "property_unit_type" AS ENUM ('house', 'apartment', 'suite', 'lot', 'parking', 'storage', 'commercial', 'mixed', 'other');

-- CreateEnum
CREATE TYPE "ownership_status" AS ENUM ('active', 'ended', 'disputed', 'archived');

-- CreateEnum
CREATE TYPE "ownership_type" AS ENUM ('owner', 'coOwner', 'legalRepresentative', 'usufructuary', 'other');

-- CreateEnum
CREATE TYPE "residency_status" AS ENUM ('active', 'ended', 'suspended', 'archived');

-- CreateEnum
CREATE TYPE "residency_type" AS ENUM ('ownerResident', 'tenant', 'familyMember', 'authorizedOccupant', 'caretaker', 'other');

-- CreateEnum
CREATE TYPE "lease_status" AS ENUM ('draft', 'active', 'ended', 'cancelled', 'archived');

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT NOT NULL,
    "identification_type" "identification_type",
    "identification_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "status" "person_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_identification_type" "identification_type",
    "tax_identification_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" "legal_entity_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_units" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "type" "property_unit_type" NOT NULL DEFAULT 'house',
    "block" TEXT,
    "floor" TEXT,
    "address_reference" TEXT,
    "area_m2" DECIMAL(12,2),
    "status" "property_unit_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "property_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ownerships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_unit_id" TEXT NOT NULL,
    "person_id" TEXT,
    "legal_entity_id" TEXT,
    "ownership_type" "ownership_type" NOT NULL DEFAULT 'owner',
    "ownership_percentage" DECIMAL(5,2),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "ownership_status" NOT NULL DEFAULT 'active',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residencies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_unit_id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "residency_type" "residency_type" NOT NULL DEFAULT 'authorizedOccupant',
    "is_primary_resident" BOOLEAN NOT NULL DEFAULT false,
    "status" "residency_status" NOT NULL DEFAULT 'active',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_unit_id" TEXT NOT NULL,
    "owner_person_id" TEXT,
    "owner_legal_entity_id" TEXT,
    "tenant_person_id" TEXT NOT NULL,
    "residency_id" TEXT,
    "status" "lease_status" NOT NULL DEFAULT 'draft',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "persons_tenant_id_idx" ON "persons"("tenant_id");

-- CreateIndex
CREATE INDEX "persons_user_profile_id_idx" ON "persons"("user_profile_id");

-- CreateIndex
CREATE INDEX "persons_status_idx" ON "persons"("status");

-- CreateIndex
CREATE INDEX "persons_display_name_idx" ON "persons"("display_name");

-- CreateIndex
CREATE INDEX "persons_tenant_id_identification_type_identification_number_idx" ON "persons"("tenant_id", "identification_type", "identification_number");

-- CreateIndex
CREATE UNIQUE INDEX "persons_id_tenant_id_key" ON "persons"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "persons_tenant_id_user_profile_id_key" ON "persons"("tenant_id", "user_profile_id");

-- CreateIndex
CREATE INDEX "legal_entities_tenant_id_idx" ON "legal_entities"("tenant_id");

-- CreateIndex
CREATE INDEX "legal_entities_status_idx" ON "legal_entities"("status");

-- CreateIndex
CREATE INDEX "legal_entities_name_idx" ON "legal_entities"("name");

-- CreateIndex
CREATE INDEX "legal_entities_tenant_id_tax_identification_type_tax_identi_idx" ON "legal_entities"("tenant_id", "tax_identification_type", "tax_identification_number");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entities_id_tenant_id_key" ON "legal_entities"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "property_units_tenant_id_idx" ON "property_units"("tenant_id");

-- CreateIndex
CREATE INDEX "property_units_status_idx" ON "property_units"("status");

-- CreateIndex
CREATE INDEX "property_units_type_idx" ON "property_units"("type");

-- CreateIndex
CREATE INDEX "property_units_tenant_id_block_idx" ON "property_units"("tenant_id", "block");

-- CreateIndex
CREATE UNIQUE INDEX "property_units_id_tenant_id_key" ON "property_units"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_units_tenant_id_code_key" ON "property_units"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "property_ownerships_tenant_id_idx" ON "property_ownerships"("tenant_id");

-- CreateIndex
CREATE INDEX "property_ownerships_property_unit_id_idx" ON "property_ownerships"("property_unit_id");

-- CreateIndex
CREATE INDEX "property_ownerships_person_id_idx" ON "property_ownerships"("person_id");

-- CreateIndex
CREATE INDEX "property_ownerships_legal_entity_id_idx" ON "property_ownerships"("legal_entity_id");

-- CreateIndex
CREATE INDEX "property_ownerships_status_idx" ON "property_ownerships"("status");

-- CreateIndex
CREATE INDEX "property_ownerships_tenant_id_property_unit_id_status_idx" ON "property_ownerships"("tenant_id", "property_unit_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "property_ownerships_id_tenant_id_key" ON "property_ownerships"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "residencies_tenant_id_idx" ON "residencies"("tenant_id");

-- CreateIndex
CREATE INDEX "residencies_property_unit_id_idx" ON "residencies"("property_unit_id");

-- CreateIndex
CREATE INDEX "residencies_person_id_idx" ON "residencies"("person_id");

-- CreateIndex
CREATE INDEX "residencies_status_idx" ON "residencies"("status");

-- CreateIndex
CREATE INDEX "residencies_tenant_id_property_unit_id_status_idx" ON "residencies"("tenant_id", "property_unit_id", "status");

-- CreateIndex
CREATE INDEX "residencies_tenant_id_person_id_status_idx" ON "residencies"("tenant_id", "person_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "residencies_id_tenant_id_key" ON "residencies"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "leases_residency_id_key" ON "leases"("residency_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_idx" ON "leases"("tenant_id");

-- CreateIndex
CREATE INDEX "leases_property_unit_id_idx" ON "leases"("property_unit_id");

-- CreateIndex
CREATE INDEX "leases_tenant_person_id_idx" ON "leases"("tenant_person_id");

-- CreateIndex
CREATE INDEX "leases_owner_person_id_idx" ON "leases"("owner_person_id");

-- CreateIndex
CREATE INDEX "leases_owner_legal_entity_id_idx" ON "leases"("owner_legal_entity_id");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "leases_id_tenant_id_key" ON "leases"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "leases_residency_id_tenant_id_key" ON "leases"("residency_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id", "tenant_id") REFERENCES "property_units"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_person_id_tenant_id_fkey" FOREIGN KEY ("person_id", "tenant_id") REFERENCES "persons"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ownerships" ADD CONSTRAINT "property_ownerships_legal_entity_id_tenant_id_fkey" FOREIGN KEY ("legal_entity_id", "tenant_id") REFERENCES "legal_entities"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residencies" ADD CONSTRAINT "residencies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residencies" ADD CONSTRAINT "residencies_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id", "tenant_id") REFERENCES "property_units"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residencies" ADD CONSTRAINT "residencies_person_id_tenant_id_fkey" FOREIGN KEY ("person_id", "tenant_id") REFERENCES "persons"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_unit_id_tenant_id_fkey" FOREIGN KEY ("property_unit_id", "tenant_id") REFERENCES "property_units"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_owner_person_id_tenant_id_fkey" FOREIGN KEY ("owner_person_id", "tenant_id") REFERENCES "persons"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_owner_legal_entity_id_tenant_id_fkey" FOREIGN KEY ("owner_legal_entity_id", "tenant_id") REFERENCES "legal_entities"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_person_id_tenant_id_fkey" FOREIGN KEY ("tenant_person_id", "tenant_id") REFERENCES "persons"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_residency_id_tenant_id_fkey" FOREIGN KEY ("residency_id", "tenant_id") REFERENCES "residencies"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tenant-safe domain constraints that Prisma cannot express directly.
ALTER TABLE "persons"
ADD CONSTRAINT "persons_identification_pair_check" CHECK (
    ("identification_type" IS NULL AND "identification_number" IS NULL)
    OR ("identification_type" IS NOT NULL AND "identification_number" IS NOT NULL)
);

ALTER TABLE "legal_entities"
ADD CONSTRAINT "legal_entities_tax_identification_pair_check" CHECK (
    ("tax_identification_type" IS NULL AND "tax_identification_number" IS NULL)
    OR ("tax_identification_type" IS NOT NULL AND "tax_identification_number" IS NOT NULL)
);

ALTER TABLE "property_units"
ADD CONSTRAINT "property_units_area_m2_check" CHECK ("area_m2" IS NULL OR "area_m2" > 0);

ALTER TABLE "property_ownerships"
ADD CONSTRAINT "property_ownerships_owner_xor_check" CHECK (
    ("person_id" IS NOT NULL AND "legal_entity_id" IS NULL)
    OR ("person_id" IS NULL AND "legal_entity_id" IS NOT NULL)
),
ADD CONSTRAINT "property_ownerships_percentage_check" CHECK (
    "ownership_percentage" IS NULL
    OR ("ownership_percentage" > 0 AND "ownership_percentage" <= 100)
),
ADD CONSTRAINT "property_ownerships_date_range_check" CHECK (
    "end_date" IS NULL OR "end_date" >= "start_date"
);

ALTER TABLE "residencies"
ADD CONSTRAINT "residencies_date_range_check" CHECK (
    "end_date" IS NULL OR "end_date" >= "start_date"
);

ALTER TABLE "leases"
ADD CONSTRAINT "leases_owner_xor_check" CHECK (
    ("owner_person_id" IS NOT NULL AND "owner_legal_entity_id" IS NULL)
    OR ("owner_person_id" IS NULL AND "owner_legal_entity_id" IS NOT NULL)
),
ADD CONSTRAINT "leases_date_range_check" CHECK (
    "end_date" IS NULL OR "end_date" >= "start_date"
),
ADD CONSTRAINT "leases_active_residency_check" CHECK (
    "status" <> 'active' OR "residency_id" IS NOT NULL
);

CREATE UNIQUE INDEX "persons_tenant_identification_unique"
ON "persons"("tenant_id", "identification_type", "identification_number")
WHERE "identification_number" IS NOT NULL;

CREATE UNIQUE INDEX "legal_entities_tenant_tax_identification_unique"
ON "legal_entities"("tenant_id", "tax_identification_type", "tax_identification_number")
WHERE "tax_identification_number" IS NOT NULL;

CREATE UNIQUE INDEX "property_ownerships_one_active_primary_per_unit"
ON "property_ownerships"("tenant_id", "property_unit_id")
WHERE "is_primary" = true AND "status" = 'active';

CREATE UNIQUE INDEX "residencies_one_active_primary_per_unit"
ON "residencies"("tenant_id", "property_unit_id")
WHERE "is_primary_resident" = true AND "status" = 'active';

CREATE FUNCTION "enforce_active_ownership_percentage"() RETURNS trigger AS $$
DECLARE
    current_total DECIMAL(7,2);
BEGIN
    IF NEW."status" <> 'active' OR NEW."ownership_percentage" IS NULL THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtextextended(NEW."tenant_id" || ':' || NEW."property_unit_id", 0)
    );

    SELECT COALESCE(SUM("ownership_percentage"), 0)
      INTO current_total
      FROM "property_ownerships"
     WHERE "tenant_id" = NEW."tenant_id"
       AND "property_unit_id" = NEW."property_unit_id"
       AND "status" = 'active'
       AND "ownership_percentage" IS NOT NULL
       AND "id" <> NEW."id";

    IF current_total + NEW."ownership_percentage" > 100 THEN
        RAISE EXCEPTION 'active ownership percentages cannot exceed 100'
          USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "property_ownerships_percentage_guard"
BEFORE INSERT OR UPDATE OF "tenant_id", "property_unit_id", "ownership_percentage", "status"
ON "property_ownerships"
FOR EACH ROW EXECUTE FUNCTION "enforce_active_ownership_percentage"();

CREATE FUNCTION "enforce_active_lease_residency"() RETURNS trigger AS $$
BEGIN
    IF NEW."status" <> 'active' THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM "residencies"
         WHERE "id" = NEW."residency_id"
           AND "tenant_id" = NEW."tenant_id"
           AND "property_unit_id" = NEW."property_unit_id"
           AND "person_id" = NEW."tenant_person_id"
           AND "residency_type" = 'tenant'
           AND "status" = 'active'
    ) THEN
        RAISE EXCEPTION 'active lease requires a matching active tenant residency'
          USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "leases_active_residency_guard"
BEFORE INSERT OR UPDATE OF "tenant_id", "property_unit_id", "tenant_person_id", "residency_id", "status"
ON "leases"
FOR EACH ROW EXECUTE FUNCTION "enforce_active_lease_residency"();

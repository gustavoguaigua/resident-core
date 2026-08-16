-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "tenant_status" AS ENUM ('pendingSetup', 'active', 'suspended', 'inactive', 'archived');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "slug" TEXT NOT NULL,
    "status" "tenant_status" NOT NULL DEFAULT 'pendingSetup',
    "timezone" TEXT NOT NULL DEFAULT 'America/Guayaquil',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "plan_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "suspended_at" TIMESTAMP(3),
    "suspended_by" TEXT,
    "suspension_reason" TEXT,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "slogan" TEXT,
    "description" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT DEFAULT 'Ecuador',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_branding" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "accent_color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_wordpress_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "wordpress_site_url" TEXT,
    "wordpress_conjunto_slug" TEXT,
    "wordpress_conjunto_id" TEXT,
    "access_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_wordpress_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_created_at_idx" ON "tenants"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_profiles_tenant_id_key" ON "tenant_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_profiles_display_name_idx" ON "tenant_profiles"("display_name");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_branding_tenant_id_key" ON "tenant_branding"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_wordpress_mappings_tenant_id_key" ON "tenant_wordpress_mappings"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_wordpress_mappings_wordpress_conjunto_slug_idx" ON "tenant_wordpress_mappings"("wordpress_conjunto_slug");

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_branding" ADD CONSTRAINT "tenant_branding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_wordpress_mappings" ADD CONSTRAINT "tenant_wordpress_mappings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

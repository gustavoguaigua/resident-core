import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SYSTEM_ACTOR_ID = "02500000-0000-4000-8000-000000000001";

const permissionOwners = {
  "platformSettingDefinitions.read": ["SuperAdmin", "PlatformAdmin"],
  "tenantSettings.read": ["TenantAdmin"],
  "tenantSettings.update": ["TenantAdmin"],
};

try {
  await prisma.$transaction(async (transaction) => {
    await transaction.settingDefinition.upsert({
      create: {
        allowedValues: ["es-EC", "en-US"],
        category: "GENERAL",
        createdBy: SYSTEM_ACTOR_ID,
        defaultValue: "es-EC",
        description: "Locale de presentación por defecto.",
        isTenantOverridable: true,
        key: "general.locale",
        schema: {
          enum: ["es-EC", "en-US"],
          pattern: "^[a-z]{2}-[A-Z]{2}$",
          type: "string",
        },
        sensitivity: "INTERNAL",
        status: "ACTIVE",
        valueType: "STRING",
      },
      update: {
        allowedValues: ["es-EC", "en-US"],
        category: "GENERAL",
        defaultValue: "es-EC",
        description: "Locale de presentación por defecto.",
        isRuntimeCritical: false,
        isTenantOverridable: true,
        requiresRestart: false,
        residentVisible: false,
        schema: {
          enum: ["es-EC", "en-US"],
          pattern: "^[a-z]{2}-[A-Z]{2}$",
          type: "string",
        },
        sensitivity: "INTERNAL",
        status: "ACTIVE",
        updatedBy: SYSTEM_ACTOR_ID,
        valueType: "STRING",
      },
      where: { key: "general.locale" },
    });

    for (const [code, roleCodes] of Object.entries(permissionOwners)) {
      const segments = code.split(".");
      const action = segments.pop();
      if (action === undefined) throw new Error(`Invalid permission ${code}.`);
      const permission = await transaction.permission.upsert({
        create: {
          action,
          code,
          description: `System permission ${code}`,
          module: segments.join("."),
        },
        update: {},
        where: { code },
      });
      if (!permission.isSystem) {
        throw new Error(`Permission ${code} is not system-owned.`);
      }
      const roles = await transaction.role.findMany({
        where: { code: { in: roleCodes }, isSystem: true },
      });
      for (const role of roles) {
        const expectedScope = code.startsWith("tenantSettings.")
          ? "TENANT"
          : "GLOBAL";
        if (role.scope !== expectedScope) continue;
        await transaction.rolePermission.upsert({
          create: { permissionId: permission.id, roleId: role.id },
          update: {},
          where: {
            roleId_permissionId: {
              permissionId: permission.id,
              roleId: role.id,
            },
          },
        });
      }
    }
  });
  process.stdout.write("Tenant settings catalog seeded.\n");
} finally {
  await prisma.$disconnect();
}

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AuditWriterPort } from "../../src/modules/audit/audit-writer.port.js";
import { PrismaAuditWriter } from "../../src/modules/audit/prisma-audit-writer.js";
import type { SettingsActorContext } from "../../src/modules/tenant-settings/tenant-settings.contract.js";
import { TenantSettingsService } from "../../src/modules/tenant-settings/tenant-settings.service.js";
import { PrismaService } from "../../src/platform/database/prisma.service.js";

const enabled = process.env.SETTINGS_PHASE8_TEST === "1";
const trace = (label: string) => `phase8-${label}-${randomUUID()}`;

if (!enabled) {
  describe.skip("Phase 8 tenant settings", () => {
    it("runs only through the phase 8 gate", () => undefined);
  });
} else {
  const prisma = new PrismaService();
  const auditWriter = new PrismaAuditWriter(prisma);
  const settings = new TenantSettingsService(prisma, auditWriter);
  let platformAdminId: string;

  describe.sequential("Phase 8 tenant settings", () => {
    beforeAll(async () => {
      await prisma.$connect();
      platformAdminId = await createPlatformActor();
    });

    afterAll(async () => prisma.$disconnect());

    it("loads the deterministic catalog and protects platform reads with Core authorization", async () => {
      const definitions = await settings.listDefinitions(platformAdminId);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toMatchObject({
        allowedValues: ["es-EC", "en-US"],
        category: "GENERAL",
        defaultValue: "es-EC",
        key: "general.locale",
        valueType: "STRING",
      });
      await expect(
        settings.getDefinition(definitions[0]!.id, platformAdminId),
      ).resolves.toMatchObject({ key: "general.locale" });

      const untrusted = await prisma.userProfile.create({
        data: {
          displayName: "Untrusted platform claims",
          email: `${randomUUID()}@example.test`,
          keycloakSubjectId: randomUUID(),
          status: "ACTIVE",
        },
      });
      await expect(
        settings.listDefinitions(untrusted.id),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    });

    it("resolves platform default, tenant override and idempotent repeated writes", async () => {
      const actor = await createTenantActor("ACTIVE", true);
      await expect(
        settings.getEffective("general.locale", actor),
      ).resolves.toMatchObject({
        settingValueId: null,
        source: "PLATFORM_DEFAULT",
        value: "es-EC",
      });

      const first = await settings.updateOverride(
        "general.locale",
        { value: "en-US" },
        actor,
        trace("override"),
      );
      expect(first).toMatchObject({
        source: "TENANT_OVERRIDE",
        value: "en-US",
      });
      const auditCount = await prisma.auditLog.count({
        where: { action: "tenantSetting.updated", tenantId: actor.tenantId },
      });
      const repeated = await settings.updateOverride(
        "general.locale",
        { value: "en-US" },
        actor,
        trace("idempotent"),
      );
      expect(repeated.settingValueId).toBe(first.settingValueId);
      await expect(
        prisma.auditLog.count({
          where: { action: "tenantSetting.updated", tenantId: actor.tenantId },
        }),
      ).resolves.toBe(auditCount);
      await expect(settings.listEffective(actor)).resolves.toHaveLength(1);
    });

    it("fails closed for unknown keys, wrong types, invalid values and Tenant-owned fields", async () => {
      const actor = await createTenantActor("ACTIVE", true);
      await expect(
        settings.updateOverride(
          "missing.key",
          { value: "value" },
          actor,
          trace("missing"),
        ),
      ).rejects.toMatchObject({ code: "SETTING_NOT_FOUND" });
      await expect(
        settings.updateOverride(
          "general.locale",
          { value: 42 },
          actor,
          trace("type"),
        ),
      ).rejects.toMatchObject({ code: "SETTING_INVALID_VALUE" });
      await expect(
        settings.updateOverride(
          "general.locale",
          { value: "fr-FR" },
          actor,
          trace("enum"),
        ),
      ).rejects.toMatchObject({ code: "SETTING_INVALID_VALUE" });
      for (const key of ["general.timezone", "general.currency"]) {
        await expect(settings.getEffective(key, actor)).rejects.toMatchObject({
          code: "SETTING_NOT_FOUND",
        });
      }
      await expect(
        settings.updateOverride(
          "general.locale",
          { value: "javascript" },
          actor,
          trace("executable"),
        ),
      ).rejects.toMatchObject({ code: "SETTING_INVALID_VALUE" });
    });

    it("enforces tenant isolation, active lifecycle and persisted permissions", async () => {
      const left = await createTenantActor("ACTIVE", true);
      const right = await createTenantActor("ACTIVE", true);
      await settings.updateOverride(
        "general.locale",
        { value: "en-US" },
        left,
        trace("left"),
      );
      await expect(
        settings.getEffective("general.locale", right),
      ).resolves.toMatchObject({ source: "PLATFORM_DEFAULT", value: "es-EC" });
      await expect(
        settings.getEffective("general.locale", {
          ...left,
          tenantId: right.tenantId,
        }),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });

      const unauthorized = await createTenantActor("ACTIVE", false);
      await expect(
        settings.getEffective("general.locale", unauthorized),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
      const suspended = await createTenantActor("SUSPENDED", true);
      await expect(
        settings.updateOverride(
          "general.locale",
          { value: "en-US" },
          suspended,
          trace("suspended"),
        ),
      ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    });

    it("keeps one consistent override under concurrent writes", async () => {
      const actor = await createTenantActor("ACTIVE", true);
      const results = await Promise.allSettled([
        settings.updateOverride(
          "general.locale",
          { value: "en-US" },
          actor,
          trace("concurrent-en"),
        ),
        settings.updateOverride(
          "general.locale",
          { value: "es-EC" },
          actor,
          trace("concurrent-es"),
        ),
      ]);
      expect(results.some((result) => result.status === "fulfilled")).toBe(
        true,
      );
      await expect(
        prisma.tenantSettingValue.count({
          where: { tenantId: actor.tenantId },
        }),
      ).resolves.toBe(1);
      await expect(
        settings.getEffective("general.locale", actor),
      ).resolves.toMatchObject({ source: "TENANT_OVERRIDE" });
    });

    it("rolls back the override when durable audit fails", async () => {
      const actor = await createTenantActor("ACTIVE", true);
      const failingWriter: AuditWriterPort = {
        recordConfirmed: async () => {
          throw new Error("Synthetic Phase 8 audit failure");
        },
        recordDenied: async () => ({ persisted: false }),
      };
      const failing = new TenantSettingsService(prisma, failingWriter);
      await expect(
        failing.updateOverride(
          "general.locale",
          { value: "en-US" },
          actor,
          trace("rollback"),
        ),
      ).rejects.toThrow("Synthetic Phase 8 audit failure");
      await expect(
        prisma.tenantSettingValue.count({
          where: { tenantId: actor.tenantId },
        }),
      ).resolves.toBe(0);
    });
  });

  async function createPlatformActor(): Promise<string> {
    const user = await prisma.userProfile.create({
      data: {
        displayName: "Phase 8 Platform Admin",
        email: `${randomUUID()}@example.test`,
        keycloakSubjectId: randomUUID(),
        status: "ACTIVE",
      },
    });
    const role = await prisma.role.create({
      data: {
        code: `Phase8PlatformAdmin-${randomUUID()}`,
        isSystem: true,
        name: "Phase 8 Platform Admin",
        scope: "GLOBAL",
      },
    });
    const permission = await prisma.permission.findUniqueOrThrow({
      where: { code: "platformSettingDefinitions.read" },
    });
    await prisma.rolePermission.create({
      data: { permissionId: permission.id, roleId: role.id },
    });
    await prisma.userGlobalRole.create({
      data: { roleId: role.id, userProfileId: user.id },
    });
    return user.id;
  }

  async function createTenantActor(
    status: "ACTIVE" | "SUSPENDED",
    withPermission: boolean,
  ): Promise<Required<SettingsActorContext>> {
    const user = await prisma.userProfile.create({
      data: {
        displayName: "Phase 8 Tenant Actor",
        email: `${randomUUID()}@example.test`,
        keycloakSubjectId: randomUUID(),
        status: "ACTIVE",
      },
    });
    const tenant = await prisma.tenant.create({
      data: {
        name: "Phase 8 Tenant",
        slug: `phase8-${randomUUID()}`,
        status,
      },
    });
    const role = await prisma.role.create({
      data: {
        code: `Phase8SettingsAdmin-${randomUUID()}`,
        isSystem: true,
        name: "Phase 8 Settings Admin",
        scope: "TENANT",
        tenantId: tenant.id,
      },
    });
    if (withPermission) {
      for (const code of ["tenantSettings.read", "tenantSettings.update"]) {
        const permission = await prisma.permission.findUniqueOrThrow({
          where: { code },
        });
        await prisma.rolePermission.create({
          data: { permissionId: permission.id, roleId: role.id },
        });
      }
    }
    const membership = await prisma.userTenantMembership.create({
      data: {
        joinedAt: new Date(),
        status: "ACTIVE",
        tenantId: tenant.id,
        userProfileId: user.id,
      },
    });
    await prisma.membershipRole.create({
      data: { membershipId: membership.id, roleId: role.id },
    });
    return {
      membershipId: membership.id,
      tenantId: tenant.id,
      userProfileId: user.id,
    };
  }
}

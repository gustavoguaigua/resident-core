import { isDeepStrictEqual } from "node:util";

import { Inject, Injectable } from "@nestjs/common";
import { Prisma, type PrismaClient } from "@prisma/client";

import { PrismaService } from "../../platform/database/prisma.service.js";
import {
  AUDIT_WRITER_PORT,
  type AuditWriterPort,
} from "../audit/audit-writer.port.js";
import type {
  EffectiveSetting,
  SettingsActorContext,
  UpdateSettingInput,
} from "./tenant-settings.contract.js";
import { TenantSettingsError } from "./tenant-settings.contract.js";

const MAX_SERIALIZATION_ATTEMPTS = 3;
const FORBIDDEN_CONTENT =
  /(?:password|token|secret|api.?key|private.?key|client.?secret|database.?url|storage.?key|signed.?url|raw.?sql|script|javascript|function.?body|executable|shell.?command|cron.?command)/iu;

type Transaction = Prisma.TransactionClient;
type Definition = Awaited<
  ReturnType<PrismaClient["settingDefinition"]["findFirstOrThrow"]>
>;

@Injectable()
export class TenantSettingsService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AUDIT_WRITER_PORT) private readonly auditWriter: AuditWriterPort,
  ) {}

  public async listDefinitions(actorUserProfileId: string) {
    await this.assertGlobalPermission(
      this.prisma,
      actorUserProfileId,
      "platformSettingDefinitions.read",
    );
    return this.prisma.settingDefinition.findMany({
      orderBy: { key: "asc" },
      where: { status: "ACTIVE" },
    });
  }

  public async getDefinition(definitionId: string, actorUserProfileId: string) {
    await this.assertGlobalPermission(
      this.prisma,
      actorUserProfileId,
      "platformSettingDefinitions.read",
    );
    const definition = await this.prisma.settingDefinition.findFirst({
      where: { id: definitionId, status: "ACTIVE" },
    });
    if (definition === null) throw new TenantSettingsError("SETTING_NOT_FOUND");
    return definition;
  }

  public async listEffective(
    actor: SettingsActorContext,
  ): Promise<readonly EffectiveSetting[]> {
    const tenantId = this.requireTenantActor(actor);
    await this.assertTenantPermission(
      this.prisma,
      actor,
      "tenantSettings.read",
    );
    const definitions = await this.prisma.settingDefinition.findMany({
      include: {
        tenantValues: {
          where: this.effectiveOverrideWhere(tenantId),
        },
      },
      orderBy: { key: "asc" },
      where: { status: "ACTIVE" },
    });
    return definitions.map((definition) =>
      this.toEffective(definition, definition.tenantValues[0] ?? null),
    );
  }

  public async getEffective(
    key: string,
    actor: SettingsActorContext,
  ): Promise<EffectiveSetting> {
    const tenantId = this.requireTenantActor(actor);
    await this.assertTenantPermission(
      this.prisma,
      actor,
      "tenantSettings.read",
    );
    const definition = await this.prisma.settingDefinition.findFirst({
      include: {
        tenantValues: {
          where: this.effectiveOverrideWhere(tenantId),
        },
      },
      where: { key, status: "ACTIVE" },
    });
    if (definition === null) throw new TenantSettingsError("SETTING_NOT_FOUND");
    return this.toEffective(definition, definition.tenantValues[0] ?? null);
  }

  public async updateOverride(
    key: string,
    input: UpdateSettingInput,
    actor: SettingsActorContext,
    traceId: string,
  ): Promise<EffectiveSetting> {
    this.requireTenantActor(actor);
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          (transaction) =>
            this.updateOverrideTransaction(
              transaction,
              key,
              input,
              actor,
              traceId,
            ),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 10_000,
            timeout: 20_000,
          },
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < MAX_SERIALIZATION_ATTEMPTS
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new TenantSettingsError("SETTING_INVALID_VALUE");
  }

  private async updateOverrideTransaction(
    transaction: Transaction,
    key: string,
    input: UpdateSettingInput,
    actor: SettingsActorContext,
    traceId: string,
  ): Promise<EffectiveSetting> {
    const tenantId = this.requireTenantActor(actor);
    const membershipId = actor.membershipId;
    if (membershipId === undefined) {
      throw new TenantSettingsError("ACCESS_DENIED");
    }
    await this.assertTenantPermission(
      transaction,
      actor,
      "tenantSettings.update",
    );
    const definition = await transaction.settingDefinition.findFirst({
      where: { key, status: "ACTIVE" },
    });
    if (definition === null) throw new TenantSettingsError("SETTING_NOT_FOUND");
    if (!definition.isTenantOverridable) {
      throw new TenantSettingsError("SETTING_NOT_OVERRIDABLE");
    }
    this.validateValue(definition, input.value);

    const existing = await transaction.tenantSettingValue.findUnique({
      where: {
        tenantId_settingDefinitionId: {
          settingDefinitionId: definition.id,
          tenantId,
        },
      },
    });
    if (
      existing !== null &&
      existing.status === "ACTIVE" &&
      isDeepStrictEqual(existing.value, input.value)
    ) {
      return this.toEffective(definition, existing);
    }

    const now = new Date();
    const persistedValue = toInputJsonValue(input.value);
    const override = await transaction.tenantSettingValue.upsert({
      create: {
        activatedAt: now,
        activatedBy: actor.userProfileId,
        createdBy: actor.userProfileId,
        effectiveFrom: now,
        key: definition.key,
        settingDefinitionId: definition.id,
        source: "TENANT_OVERRIDE",
        status: "ACTIVE",
        tenantId,
        value: persistedValue,
        valueType: definition.valueType,
      },
      update: {
        activatedAt: now,
        activatedBy: actor.userProfileId,
        archivedAt: null,
        archivedBy: null,
        effectiveFrom: now,
        effectiveUntil: null,
        key: definition.key,
        reason: null,
        source: "TENANT_OVERRIDE",
        status: "ACTIVE",
        updatedBy: actor.userProfileId,
        value: persistedValue,
        valueType: definition.valueType,
      },
      where: {
        tenantId_settingDefinitionId: {
          settingDefinitionId: definition.id,
          tenantId,
        },
      },
    });
    await this.auditWriter.recordConfirmed(
      transaction,
      {
        actor: {
          membershipId,
          type: "USER",
          userProfileId: actor.userProfileId,
        },
        tenantId,
        traceId,
      },
      {
        action: "tenantSetting.updated",
        metadata: { changedFields: ["value"] },
        occurredAt: now,
        resourceId: override.id,
      },
    );
    return this.toEffective(definition, override);
  }

  private effectiveOverrideWhere(tenantId: string) {
    const now = new Date();
    return {
      effectiveFrom: { lte: now },
      OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      status: "ACTIVE" as const,
      tenantId,
    };
  }

  private toEffective(
    definition: Definition,
    override: {
      id: string;
      effectiveFrom: Date;
      effectiveUntil: Date | null;
      source: EffectiveSetting["source"];
      value: Prisma.JsonValue;
    } | null,
  ): EffectiveSetting {
    return {
      category: definition.category,
      effectiveFrom: override?.effectiveFrom ?? null,
      effectiveUntil: override?.effectiveUntil ?? null,
      isTenantOverridable: definition.isTenantOverridable,
      key: definition.key,
      residentVisible: definition.residentVisible,
      sensitivity: definition.sensitivity,
      settingDefinitionId: definition.id,
      settingValueId: override?.id ?? null,
      source: override?.source ?? "PLATFORM_DEFAULT",
      value: override?.value ?? definition.defaultValue,
      valueType: definition.valueType,
    };
  }

  private validateValue(definition: Definition, value: Prisma.JsonValue): void {
    if (value === null || containsForbiddenContent(value)) {
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
    }
    const validType =
      definition.valueType === "STRING"
        ? typeof value === "string"
        : definition.valueType === "NUMBER"
          ? typeof value === "number" && Number.isFinite(value)
          : definition.valueType === "INTEGER"
            ? typeof value === "number" && Number.isInteger(value)
            : definition.valueType === "BOOLEAN"
              ? typeof value === "boolean"
              : definition.valueType === "DECIMAL_STRING"
                ? typeof value === "string" && /^-?\d+(?:\.\d+)?$/u.test(value)
                : definition.valueType === "DATE"
                  ? typeof value === "string" &&
                    /^\d{4}-\d{2}-\d{2}$/u.test(value)
                  : definition.valueType === "TIME"
                    ? typeof value === "string" &&
                      /^\d{2}:\d{2}(?::\d{2})?$/u.test(value)
                    : definition.valueType === "DURATION"
                      ? typeof value === "string" &&
                        /^P(?:\d+[YMWD])?(?:T(?:\d+[HMS])?)*$/u.test(value)
                      : definition.valueType === "ENUM"
                        ? typeof value === "string"
                        : definition.valueType === "STRING_ARRAY"
                          ? Array.isArray(value) &&
                            value.every((item) => typeof item === "string")
                          : definition.valueType === "OBJECT"
                            ? isPlainObject(value)
                            : true;
    if (!validType) throw new TenantSettingsError("SETTING_INVALID_VALUE");

    if (
      Array.isArray(definition.allowedValues) &&
      !definition.allowedValues.some((allowed) =>
        isDeepStrictEqual(allowed, value),
      )
    ) {
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
    }
    validateSupportedSchema(definition.schema, value);
  }

  private requireTenantActor(actor: SettingsActorContext): string {
    if (actor.tenantId === undefined || actor.membershipId === undefined) {
      throw new TenantSettingsError("ACCESS_DENIED");
    }
    return actor.tenantId;
  }

  private async assertTenantPermission(
    transaction: Pick<Transaction, "membershipRole">,
    actor: SettingsActorContext,
    permission: string,
  ): Promise<void> {
    const tenantId = this.requireTenantActor(actor);
    const membershipId = actor.membershipId;
    if (membershipId === undefined) {
      throw new TenantSettingsError("ACCESS_DENIED");
    }
    const assignment = await transaction.membershipRole.findFirst({
      where: {
        membership: {
          id: membershipId,
          status: "ACTIVE",
          tenant: { status: "ACTIVE" },
          tenantId,
          userProfileId: actor.userProfileId,
        },
        removedAt: null,
        role: {
          scope: "TENANT",
          tenantId,
          permissions: { some: { permission: { code: permission } } },
        },
      },
    });
    if (assignment === null) throw new TenantSettingsError("ACCESS_DENIED");
  }

  private async assertGlobalPermission(
    transaction: Pick<Transaction, "userGlobalRole">,
    actorUserProfileId: string,
    permission: string,
  ): Promise<void> {
    const assignment = await transaction.userGlobalRole.findFirst({
      where: {
        removedAt: null,
        role: {
          scope: "GLOBAL",
          tenantId: null,
          permissions: { some: { permission: { code: permission } } },
        },
        userProfile: { status: "ACTIVE" },
        userProfileId: actorUserProfileId,
      },
    });
    if (assignment === null) throw new TenantSettingsError("ACCESS_DENIED");
  }
}

function toInputJsonValue(value: Prisma.JsonValue): Prisma.InputJsonValue {
  if (value === null) throw new TenantSettingsError("SETTING_INVALID_VALUE");
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isPlainObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsForbiddenContent(value: Prisma.JsonValue): boolean {
  if (typeof value === "string") return FORBIDDEN_CONTENT.test(value);
  if (Array.isArray(value)) return value.some(containsForbiddenContent);
  if (!isPlainObject(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      FORBIDDEN_CONTENT.test(key) ||
      (nested !== undefined && containsForbiddenContent(nested)),
  );
}

function validateSupportedSchema(
  schema: Prisma.JsonValue | null,
  value: Prisma.JsonValue,
): void {
  if (schema === null) return;
  if (!isPlainObject(schema))
    throw new TenantSettingsError("SETTING_INVALID_VALUE");
  const definition = schema as Record<string, Prisma.JsonValue>;
  const supported = new Set([
    "enum",
    "maximum",
    "maxLength",
    "minimum",
    "minLength",
    "pattern",
    "type",
  ]);
  if (Object.keys(definition).some((key) => !supported.has(key))) {
    throw new TenantSettingsError("SETTING_INVALID_VALUE");
  }
  if (
    Array.isArray(definition.enum) &&
    !definition.enum.some((allowed) => isDeepStrictEqual(allowed, value))
  ) {
    throw new TenantSettingsError("SETTING_INVALID_VALUE");
  }
  if (typeof value === "string") {
    if (
      typeof definition.minLength === "number" &&
      value.length < definition.minLength
    )
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
    if (
      typeof definition.maxLength === "number" &&
      value.length > definition.maxLength
    )
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
    if (
      typeof definition.pattern === "string" &&
      !new RegExp(definition.pattern, "u").test(value)
    )
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
  }
  if (typeof value === "number") {
    if (typeof definition.minimum === "number" && value < definition.minimum)
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
    if (typeof definition.maximum === "number" && value > definition.maximum)
      throw new TenantSettingsError("SETTING_INVALID_VALUE");
  }
}

import type {
  Prisma,
  TenantSettingCategory,
  TenantSettingSensitivity,
  TenantSettingSource,
  TenantSettingValueType,
} from "@prisma/client";

export interface SettingsActorContext {
  readonly userProfileId: string;
  readonly membershipId?: string;
  readonly tenantId?: string;
}

export interface EffectiveSetting {
  readonly category: TenantSettingCategory;
  readonly effectiveFrom: Date | null;
  readonly effectiveUntil: Date | null;
  readonly isTenantOverridable: boolean;
  readonly key: string;
  readonly residentVisible: boolean;
  readonly sensitivity: TenantSettingSensitivity;
  readonly settingDefinitionId: string;
  readonly settingValueId: string | null;
  readonly source: TenantSettingSource;
  readonly value: Prisma.JsonValue;
  readonly valueType: TenantSettingValueType;
}

export interface UpdateSettingInput {
  readonly value: Prisma.JsonValue;
}

export type TenantSettingsErrorCode =
  | "ACCESS_DENIED"
  | "SETTING_INVALID_VALUE"
  | "SETTING_NOT_FOUND"
  | "SETTING_NOT_OVERRIDABLE"
  | "TENANT_NOT_ACTIVE";

export class TenantSettingsError extends Error {
  public constructor(public readonly code: TenantSettingsErrorCode) {
    super(code);
  }
}

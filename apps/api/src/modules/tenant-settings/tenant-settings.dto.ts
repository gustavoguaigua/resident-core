import { ApiProperty } from "@nestjs/swagger";
import type { Prisma } from "@prisma/client";
import { IsDefined } from "class-validator";

export class UpdateTenantSettingDto {
  @ApiProperty({
    description: "Typed JSON value governed by the setting definition",
    oneOf: [
      { type: "string" },
      { type: "number" },
      { type: "boolean" },
      { type: "array" },
      { type: "object" },
    ],
    type: Object,
  })
  @IsDefined()
  public readonly value!: Prisma.JsonValue;
}

export class SettingDefinitionDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ example: "general.locale", type: String })
  public readonly key!: string;

  @ApiProperty({ example: "general", type: String })
  public readonly category!: string;

  @ApiProperty({ example: "string", type: String })
  public readonly valueType!: string;

  @ApiProperty({ type: Object })
  public readonly defaultValue!: unknown;

  @ApiProperty({ nullable: true, type: Object })
  public readonly allowedValues!: unknown;

  @ApiProperty({ nullable: true, type: Object })
  public readonly schema!: unknown;

  @ApiProperty({ nullable: true, type: String })
  public readonly description!: string | null;

  @ApiProperty({ example: "internal", type: String })
  public readonly sensitivity!: string;

  @ApiProperty({ type: Boolean })
  public readonly isTenantOverridable!: boolean;

  @ApiProperty({ type: Boolean })
  public readonly isRuntimeCritical!: boolean;

  @ApiProperty({ type: Boolean })
  public readonly requiresRestart!: boolean;

  @ApiProperty({ type: Boolean })
  public readonly residentVisible!: boolean;

  @ApiProperty({ example: "active", type: String })
  public readonly status!: string;

  @ApiProperty({ format: "date-time", type: String })
  public readonly createdAt!: string;

  @ApiProperty({ format: "date-time", type: String })
  public readonly updatedAt!: string;
}

export class EffectiveSettingDataDto {
  @ApiProperty({ example: "general.locale", type: String })
  public readonly key!: string;

  @ApiProperty({ example: "general", type: String })
  public readonly category!: string;

  @ApiProperty({ example: "string", type: String })
  public readonly valueType!: string;

  @ApiProperty({ type: Object })
  public readonly value!: unknown;

  @ApiProperty({ enum: ["platformDefault", "tenantOverride"] })
  public readonly source!: "platformDefault" | "tenantOverride";

  @ApiProperty({ format: "uuid", type: String })
  public readonly settingDefinitionId!: string;

  @ApiProperty({ format: "uuid", nullable: true, type: String })
  public readonly settingValueId!: string | null;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  public readonly effectiveFrom!: string | null;

  @ApiProperty({ format: "date-time", nullable: true, type: String })
  public readonly effectiveUntil!: string | null;

  @ApiProperty({ example: "internal", type: String })
  public readonly sensitivity!: string;

  @ApiProperty({ type: Boolean })
  public readonly isTenantOverridable!: boolean;

  @ApiProperty({ type: Boolean })
  public readonly residentVisible!: boolean;
}

export class TraceMetaDto {
  @ApiProperty({ type: String })
  public readonly traceId!: string;
}

export class PageMetaDto extends TraceMetaDto {
  @ApiProperty({ example: 1, type: Number })
  public readonly page!: number;

  @ApiProperty({ example: 25, type: Number })
  public readonly pageSize!: number;

  @ApiProperty({ example: 1, type: Number })
  public readonly total!: number;
}

export class SettingDefinitionResponseDto {
  @ApiProperty({ type: SettingDefinitionDataDto })
  public readonly data!: SettingDefinitionDataDto;

  @ApiProperty({ type: TraceMetaDto })
  public readonly meta!: TraceMetaDto;
}

export class SettingDefinitionListResponseDto {
  @ApiProperty({ isArray: true, type: SettingDefinitionDataDto })
  public readonly data!: readonly SettingDefinitionDataDto[];

  @ApiProperty({ type: PageMetaDto })
  public readonly meta!: PageMetaDto;
}

export class EffectiveSettingResponseDto {
  @ApiProperty({ type: EffectiveSettingDataDto })
  public readonly data!: EffectiveSettingDataDto;

  @ApiProperty({ type: TraceMetaDto })
  public readonly meta!: TraceMetaDto;
}

export class EffectiveSettingListResponseDto {
  @ApiProperty({ isArray: true, type: EffectiveSettingDataDto })
  public readonly data!: readonly EffectiveSettingDataDto[];

  @ApiProperty({ type: PageMetaDto })
  public readonly meta!: PageMetaDto;
}

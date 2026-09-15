import { ApiProperty } from "@nestjs/swagger";

export class DiscoveryMetaDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly traceId!: string;
}

export class CurrentUserDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly userProfileId!: string;

  @ApiProperty({ type: String })
  public readonly displayName!: string;

  @ApiProperty({ enum: ["active"], type: String })
  public readonly status!: "active";
}

export class CurrentUserResponseDto {
  @ApiProperty({ type: () => CurrentUserDataDto })
  public readonly data!: CurrentUserDataDto;

  @ApiProperty({ type: () => DiscoveryMetaDto })
  public readonly meta!: DiscoveryMetaDto;
}

export class AccessibleTenantDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly tenantId!: string;

  @ApiProperty({ type: String })
  public readonly slug!: string;

  @ApiProperty({ type: String })
  public readonly name!: string;

  @ApiProperty({ enum: ["active"], type: String })
  public readonly membershipStatus!: "active";
}

export class AccessibleTenantsResponseDto {
  @ApiProperty({ isArray: true, type: () => AccessibleTenantDataDto })
  public readonly data!: AccessibleTenantDataDto[];

  @ApiProperty({ type: () => DiscoveryMetaDto })
  public readonly meta!: DiscoveryMetaDto;
}

export class EffectiveTenantPermissionsDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly tenantId!: string;

  @ApiProperty({ isArray: true, type: String })
  public readonly permissions!: readonly string[];
}

export class EffectiveTenantPermissionsResponseDto {
  @ApiProperty({ type: () => EffectiveTenantPermissionsDataDto })
  public readonly data!: EffectiveTenantPermissionsDataDto;

  @ApiProperty({ type: () => DiscoveryMetaDto })
  public readonly meta!: DiscoveryMetaDto;
}

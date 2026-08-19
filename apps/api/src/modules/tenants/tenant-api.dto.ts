import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InitialAdminDto {
  @ApiProperty({ example: "tenant.admin@example.com", type: String })
  @IsEmail()
  @MaxLength(254)
  public readonly email!: string;
}

export class TenantProfileInputDto {
  @ApiPropertyOptional({ example: "Villa Club", type: String })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public readonly displayName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  public readonly slogan?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  public readonly description?: string;

  @ApiPropertyOptional({ type: String })
  @IsEmail()
  @IsOptional()
  @MaxLength(254)
  public readonly contactEmail?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public readonly contactPhone?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public readonly whatsapp?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly address?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public readonly city?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public readonly province?: string;

  @ApiPropertyOptional({ default: "Ecuador", type: String })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public readonly country?: string;
}

export class TenantBrandingInputDto {
  @ApiPropertyOptional({ format: "uri", type: String })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  public readonly logoUrl?: string;

  @ApiPropertyOptional({ format: "uri", type: String })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  public readonly bannerUrl?: string;

  @ApiPropertyOptional({ example: "#1E88E5", type: String })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/u)
  public readonly primaryColor?: string;

  @ApiPropertyOptional({ example: "#90CAF9", type: String })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/u)
  public readonly secondaryColor?: string;

  @ApiPropertyOptional({ example: "#FFC107", type: String })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/u)
  public readonly accentColor?: string;
}

export class TenantWordPressMappingInputDto {
  @ApiPropertyOptional({ format: "uri", type: String })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  public readonly wordpressSiteUrl?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  public readonly wordpressConjuntoSlug?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public readonly wordpressConjuntoId?: string;

  @ApiPropertyOptional({ format: "uri", type: String })
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  public readonly accessUrl?: string;

  @ApiPropertyOptional({ default: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  public readonly isActive?: boolean;
}

export class CreateTenantDto {
  @ApiProperty({ example: "Villa Club", type: String })
  @IsString()
  @MaxLength(200)
  @MinLength(1)
  public readonly name!: string;

  @ApiPropertyOptional({ example: "Villa Club", type: String })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public readonly legalName?: string;

  @ApiPropertyOptional({ example: "villa-club", type: String })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  @MaxLength(80)
  @MinLength(3)
  public readonly slug?: string;

  @ApiPropertyOptional({ default: "America/Guayaquil", type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public readonly timezone?: string;

  @ApiPropertyOptional({ default: "USD", enum: ["USD"], type: String })
  @IsIn(["USD"])
  @IsOptional()
  public readonly currency?: string;

  @ApiProperty({ type: () => InitialAdminDto })
  @Type(() => InitialAdminDto)
  @ValidateNested()
  public readonly initialAdmin!: InitialAdminDto;

  @ApiPropertyOptional({ type: () => TenantProfileInputDto })
  @IsOptional()
  @Type(() => TenantProfileInputDto)
  @ValidateNested()
  public readonly profile?: TenantProfileInputDto;

  @ApiPropertyOptional({ type: () => TenantBrandingInputDto })
  @IsOptional()
  @Type(() => TenantBrandingInputDto)
  @ValidateNested()
  public readonly branding?: TenantBrandingInputDto;

  @ApiPropertyOptional({ type: () => TenantWordPressMappingInputDto })
  @IsOptional()
  @Type(() => TenantWordPressMappingInputDto)
  @ValidateNested()
  public readonly wordpressMapping?: TenantWordPressMappingInputDto;
}

export class TenantTransitionReasonDto {
  @ApiProperty({ maxLength: 500, type: String })
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  public readonly reason!: string;
}

export class TenantLifecycleDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ type: String })
  public readonly slug!: string;

  @ApiProperty({
    enum: ["pendingSetup", "active", "suspended", "inactive", "archived"],
    type: String,
  })
  public readonly status!: string;

  @ApiProperty({ format: "date-time", type: String })
  public readonly updatedAt!: string;

  @ApiPropertyOptional({ format: "date-time", nullable: true, type: String })
  public readonly suspendedAt?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  public readonly suspensionReason?: string | null;

  @ApiPropertyOptional({ format: "date-time", nullable: true, type: String })
  public readonly archivedAt?: string | null;
}

export class TenantResponseMetaDto {
  @ApiProperty({ type: String })
  public readonly traceId!: string;
}

export class TenantLifecycleResponseDto {
  @ApiProperty({ type: () => TenantLifecycleDataDto })
  public readonly data!: TenantLifecycleDataDto;

  @ApiProperty({ type: () => TenantResponseMetaDto })
  public readonly meta!: TenantResponseMetaDto;
}

export class InitialAdminResponseDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly userProfileId!: string;

  @ApiProperty({ type: String })
  public readonly email!: string;

  @ApiProperty({ enum: ["active"], type: String })
  public readonly membershipStatus!: "active";

  @ApiProperty({ enum: ["TenantAdmin"], type: String })
  public readonly role!: "TenantAdmin";
}

export class CreatedTenantDataDto extends TenantLifecycleDataDto {
  @ApiProperty({ type: String })
  public readonly name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  public readonly legalName!: string | null;

  @ApiProperty({ type: String })
  public readonly timezone!: string;

  @ApiProperty({ enum: ["USD"], type: String })
  public readonly currency!: string;

  @ApiProperty({ type: () => InitialAdminResponseDto })
  public readonly initialAdmin!: InitialAdminResponseDto;

  @ApiProperty({ type: Object })
  public readonly profile!: object;

  @ApiPropertyOptional({ nullable: true, type: Object })
  public readonly branding!: object | null;

  @ApiPropertyOptional({ nullable: true, type: Object })
  public readonly wordpressMapping!: object | null;

  @ApiProperty({ format: "date-time", type: String })
  public readonly createdAt!: string;
}

export class CreateTenantResponseDto {
  @ApiProperty({ type: () => CreatedTenantDataDto })
  public readonly data!: CreatedTenantDataDto;

  @ApiProperty({ type: () => TenantResponseMetaDto })
  public readonly meta!: TenantResponseMetaDto;
}

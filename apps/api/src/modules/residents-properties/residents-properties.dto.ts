import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

const SAFE_TEXT = /^[^<>\p{Cc}]*$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const DECIMAL = /^(?:100(?:\.0{1,2})?|[1-9]?\d(?:\.\d{1,2})?)$/u;

const optionalTrim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly pageSize = 20;
}

export class PropertyUnitQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(["active", "inactive", "underMaintenance", "blocked", "archived"])
  public readonly status?: string;
  @IsOptional()
  @IsIn([
    "house",
    "apartment",
    "suite",
    "lot",
    "parking",
    "storage",
    "commercial",
    "mixed",
    "other",
  ])
  public readonly type?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(100)
  public readonly block?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(160)
  public readonly search?: string;
}

export class CreatePropertyUnitDto {
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(SAFE_TEXT)
  public readonly code!: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE_TEXT)
  public readonly name?: string;
  @IsOptional()
  @IsIn([
    "house",
    "apartment",
    "suite",
    "lot",
    "parking",
    "storage",
    "commercial",
    "mixed",
    "other",
  ])
  public readonly type?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(100)
  @Matches(SAFE_TEXT)
  public readonly block?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(30)
  @Matches(SAFE_TEXT)
  public readonly floor?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(255)
  @Matches(SAFE_TEXT)
  public readonly addressReference?: string;
  @IsOptional()
  @IsString()
  @Matches(DECIMAL)
  public readonly areaM2?: string;
}

export class UpdatePropertyUnitDto {
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(SAFE_TEXT)
  public readonly code?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE_TEXT)
  public readonly name?: string;
  @IsOptional()
  @IsIn([
    "house",
    "apartment",
    "suite",
    "lot",
    "parking",
    "storage",
    "commercial",
    "mixed",
    "other",
  ])
  public readonly type?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(100)
  @Matches(SAFE_TEXT)
  public readonly block?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(30)
  @Matches(SAFE_TEXT)
  public readonly floor?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(255)
  @Matches(SAFE_TEXT)
  public readonly addressReference?: string;
  @IsOptional()
  @IsString()
  @Matches(DECIMAL)
  public readonly areaM2?: string;
  @IsOptional()
  @IsIn(["active", "inactive", "underMaintenance", "blocked"])
  public readonly status?: string;
}

export class CreatePersonDto {
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(120)
  @Matches(SAFE_TEXT)
  public readonly firstName?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(120)
  @Matches(SAFE_TEXT)
  public readonly lastName?: string;
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(SAFE_TEXT)
  public readonly displayName!: string;
  @IsOptional()
  @IsIn(["cedula", "ruc", "passport", "other"])
  public readonly identificationType?: string;
  @ValidateIf(
    (input: CreatePersonDto) => input.identificationType !== undefined,
  )
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(SAFE_TEXT)
  public readonly identificationNumber?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsEmail()
  @MaxLength(254)
  public readonly email?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(40)
  @Matches(SAFE_TEXT)
  public readonly phone?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(40)
  @Matches(SAFE_TEXT)
  public readonly whatsapp?: string;
}

export class UpdatePersonDto {
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(120)
  @Matches(SAFE_TEXT)
  public readonly firstName?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(120)
  @Matches(SAFE_TEXT)
  public readonly lastName?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(SAFE_TEXT)
  public readonly displayName?: string;
  @IsOptional()
  @IsIn(["cedula", "ruc", "passport", "other"])
  public readonly identificationType?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(SAFE_TEXT)
  public readonly identificationNumber?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsEmail()
  @MaxLength(254)
  public readonly email?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(40)
  @Matches(SAFE_TEXT)
  public readonly phone?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(40)
  @Matches(SAFE_TEXT)
  public readonly whatsapp?: string;
  @IsOptional()
  @IsIn(["active", "inactive"])
  public readonly status?: string;
}

export class LinkUserDto {
  @IsUUID("4") public readonly userProfileId!: string;
}

export class CreateLegalEntityDto {
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(SAFE_TEXT)
  public readonly name!: string;
  @IsOptional()
  @IsIn(["cedula", "ruc", "passport", "other"])
  public readonly taxIdentificationType?: string;
  @ValidateIf(
    (input: CreateLegalEntityDto) => input.taxIdentificationType !== undefined,
  )
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(SAFE_TEXT)
  public readonly taxIdentificationNumber?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsEmail()
  @MaxLength(254)
  public readonly email?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(40)
  @Matches(SAFE_TEXT)
  public readonly phone?: string;
  @IsOptional()
  @Transform(optionalTrim)
  @IsString()
  @MaxLength(255)
  @Matches(SAFE_TEXT)
  public readonly address?: string;
}

export class UpdateLegalEntityDto extends CreateLegalEntityDto {
  @IsOptional() declare public readonly name: string;
  @IsOptional()
  @IsIn(["active", "inactive"])
  public readonly status?: string;
}

export class RelationshipQueryDto extends PageQueryDto {
  @IsOptional() @IsUUID("4") public readonly propertyUnitId?: string;
  @IsOptional() @IsUUID("4") public readonly personId?: string;
  @IsOptional() @IsUUID("4") public readonly legalEntityId?: string;
  @IsOptional() @IsString() @MaxLength(40) public readonly status?: string;
}

export class CreateOwnershipDto {
  @IsUUID("4") public readonly propertyUnitId!: string;
  @IsOptional() @IsUUID("4") public readonly personId?: string;
  @IsOptional() @IsUUID("4") public readonly legalEntityId?: string;
  @IsOptional()
  @IsIn(["owner", "coOwner", "legalRepresentative", "usufructuary", "other"])
  public readonly ownershipType?: string;
  @IsOptional()
  @IsString()
  @Matches(DECIMAL)
  public readonly ownershipPercentage?: string;
  @IsOptional() @IsBoolean() public readonly isPrimary?: boolean;
  @IsString() @Matches(DATE) public readonly startDate!: string;
}

export class UpdateOwnershipDto {
  @IsOptional()
  @IsIn(["owner", "coOwner", "legalRepresentative", "usufructuary", "other"])
  public readonly ownershipType?: string;
  @IsOptional()
  @IsString()
  @Matches(DECIMAL)
  public readonly ownershipPercentage?: string;
  @IsOptional() @IsBoolean() public readonly isPrimary?: boolean;
  @IsOptional()
  @IsIn(["active", "disputed"])
  public readonly status?: string;
}

export class CreateResidencyDto {
  @IsUUID("4") public readonly propertyUnitId!: string;
  @IsUUID("4") public readonly personId!: string;
  @IsOptional()
  @IsIn([
    "ownerResident",
    "tenant",
    "familyMember",
    "authorizedOccupant",
    "caretaker",
    "other",
  ])
  public readonly residencyType?: string;
  @IsOptional() @IsBoolean() public readonly isPrimaryResident?: boolean;
  @IsString() @Matches(DATE) public readonly startDate!: string;
}

export class UpdateResidencyDto {
  @IsOptional()
  @IsIn([
    "ownerResident",
    "tenant",
    "familyMember",
    "authorizedOccupant",
    "caretaker",
    "other",
  ])
  public readonly residencyType?: string;
  @IsOptional() @IsBoolean() public readonly isPrimaryResident?: boolean;
  @IsOptional()
  @IsIn(["active", "suspended"])
  public readonly status?: string;
}

export class CreateLeaseDto {
  @IsUUID("4") public readonly propertyUnitId!: string;
  @IsOptional() @IsUUID("4") public readonly ownerPersonId?: string;
  @IsOptional() @IsUUID("4") public readonly ownerLegalEntityId?: string;
  @IsUUID("4") public readonly tenantPersonId!: string;
  @IsString() @Matches(DATE) public readonly startDate!: string;
  @IsOptional() @IsString() @Matches(DATE) public readonly endDate?: string;
}

export class UpdateLeaseDto {
  @IsOptional() @IsString() @Matches(DATE) public readonly endDate?: string;
  @IsOptional()
  @IsIn(["active", "cancelled", "archived"])
  public readonly status?: string;
}

export class EndRelationshipDto {
  @IsString() @Matches(DATE) public readonly endDate!: string;
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(SAFE_TEXT)
  public readonly reason!: string;
}

export class ArchiveDto {
  @Transform(optionalTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(SAFE_TEXT)
  public readonly reason!: string;
}

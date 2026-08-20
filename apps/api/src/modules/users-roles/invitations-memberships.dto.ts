import { Type } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "cancelled",
] as const;

export class CreateInvitationDto {
  @ApiProperty({ example: "resident.user@example.com", type: String })
  @IsEmail()
  @MaxLength(254)
  public readonly email!: string;

  @ApiProperty({ format: "uuid", type: String })
  @IsUUID("4")
  public readonly roleId!: string;

  @ApiPropertyOptional({ maxLength: 500, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly message?: string;

  @ApiPropertyOptional({ default: 72, maximum: 168, minimum: 1, type: Number })
  @IsInt()
  @IsOptional()
  @Max(168)
  @Min(1)
  public readonly expiresInHours?: number;
}

export class InvitationListQueryDto {
  @ApiPropertyOptional({ enum: INVITATION_STATUSES, type: String })
  @IsIn(INVITATION_STATUSES)
  @IsOptional()
  public readonly status?: (typeof INVITATION_STATUSES)[number];

  @ApiPropertyOptional({ type: String })
  @IsEmail()
  @IsOptional()
  @MaxLength(254)
  public readonly email?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, type: Number })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  public readonly page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100, minimum: 1, type: Number })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  public readonly pageSize = 20;
}

export class AssignMembershipRoleDto {
  @ApiProperty({ format: "uuid", type: String })
  @IsUUID("4")
  public readonly roleId!: string;
}

export class RevokeMembershipDto {
  @ApiPropertyOptional({ maxLength: 500, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  public readonly reason?: string;
}

export class ApiMetaDto {
  @ApiProperty({ type: String })
  public readonly traceId!: string;
}

export class RoleSummaryDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ type: String })
  public readonly code!: string;

  @ApiProperty({ type: String })
  public readonly name!: string;
}

export class InvitationDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ type: String })
  public readonly email!: string;

  @ApiProperty({ type: () => RoleSummaryDto })
  public readonly role!: RoleSummaryDto;

  @ApiProperty({ enum: INVITATION_STATUSES, type: String })
  public readonly status!: string;

  @ApiProperty({ format: "date-time", type: String })
  public readonly expiresAt!: string;

  @ApiProperty({ format: "date-time", type: String })
  public readonly createdAt!: string;

  @ApiPropertyOptional({ format: "date-time", nullable: true, type: String })
  public readonly revokedAt!: string | null;
}

export class CreatedInvitationDataDto extends InvitationDataDto {
  @ApiProperty({ type: String })
  public readonly invitationUrl!: string;
}

export class InvitationResponseDto {
  @ApiProperty({ type: () => InvitationDataDto })
  public readonly data!: InvitationDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

export class CreatedInvitationResponseDto {
  @ApiProperty({ type: () => CreatedInvitationDataDto })
  public readonly data!: CreatedInvitationDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

export class InvitationListMetaDto extends ApiMetaDto {
  @ApiProperty({ type: Number })
  public readonly page!: number;

  @ApiProperty({ type: Number })
  public readonly pageSize!: number;

  @ApiProperty({ type: Number })
  public readonly total!: number;

  @ApiProperty({ type: Number })
  public readonly totalPages!: number;
}

export class InvitationListResponseDto {
  @ApiProperty({ isArray: true, type: () => InvitationDataDto })
  public readonly data!: InvitationDataDto[];

  @ApiProperty({ type: () => InvitationListMetaDto })
  public readonly meta!: InvitationListMetaDto;
}

export class PublicTenantSummaryDto {
  @ApiProperty({ type: String })
  public readonly slug!: string;

  @ApiProperty({ type: String })
  public readonly displayName!: string;
}

export class PublicRoleSummaryDto {
  @ApiProperty({ type: String })
  public readonly code!: string;

  @ApiProperty({ type: String })
  public readonly name!: string;
}

export class PublicInvitationDataDto {
  @ApiProperty({ type: String })
  public readonly email!: string;

  @ApiProperty({ type: () => PublicTenantSummaryDto })
  public readonly tenant!: PublicTenantSummaryDto;

  @ApiProperty({ type: () => PublicRoleSummaryDto })
  public readonly role!: PublicRoleSummaryDto;

  @ApiProperty({ enum: ["pending"], type: String })
  public readonly status!: "pending";

  @ApiProperty({ format: "date-time", type: String })
  public readonly expiresAt!: string;
}

export class PublicInvitationResponseDto {
  @ApiProperty({ type: () => PublicInvitationDataDto })
  public readonly data!: PublicInvitationDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

export class AcceptedInvitationDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly userId!: string;

  @ApiProperty({ format: "uuid", type: String })
  public readonly membershipId!: string;

  @ApiProperty({ format: "uuid", type: String })
  public readonly tenantId!: string;

  @ApiProperty({ type: String })
  public readonly tenantSlug!: string;

  @ApiProperty({ enum: ["active"], type: String })
  public readonly membershipStatus!: "active";

  @ApiProperty({ isArray: true, type: () => PublicRoleSummaryDto })
  public readonly roles!: PublicRoleSummaryDto[];

  @ApiProperty({ format: "date-time", type: String })
  public readonly acceptedAt!: string;
}

export class AcceptedInvitationResponseDto {
  @ApiProperty({ type: () => AcceptedInvitationDataDto })
  public readonly data!: AcceptedInvitationDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

export class MembershipRoleDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ format: "uuid", type: String })
  public readonly roleId!: string;

  @ApiPropertyOptional({ format: "date-time", type: String })
  public readonly assignedAt?: string;

  @ApiPropertyOptional({ format: "date-time", type: String })
  public readonly removedAt?: string;
}

export class MembershipRoleResponseDto {
  @ApiProperty({ type: () => MembershipRoleDataDto })
  public readonly data!: MembershipRoleDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

export class MembershipDataDto {
  @ApiProperty({ format: "uuid", type: String })
  public readonly id!: string;

  @ApiProperty({ enum: ["active", "revoked"], type: String })
  public readonly status!: string;

  @ApiPropertyOptional({ format: "date-time", nullable: true, type: String })
  public readonly revokedAt!: string | null;
}

export class MembershipResponseDto {
  @ApiProperty({ type: () => MembershipDataDto })
  public readonly data!: MembershipDataDto;

  @ApiProperty({ type: () => ApiMetaDto })
  public readonly meta!: ApiMetaDto;
}

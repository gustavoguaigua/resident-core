import { Transform, Type } from "class-transformer";
import {
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
} from "class-validator";

const SAFE = /^[^\p{Cc}<>]*$/u;
const DATE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/u;
const MONEY = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;
const PERIOD = /^\d{4}-(?:0[1-9]|1[0-2])$/u;
const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class DuesPageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) public page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) public pageSize =
    20;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE)
  public search?: string;
  @IsOptional()
  @IsIn(["active", "inactive", "archived", "ended", "open"])
  public status?: string;
}

export class CreateChargeConceptDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._-]*$/u)
  public code!: string;
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(SAFE)
  public name!: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  @Matches(SAFE)
  public description?: string;
  @IsOptional()
  @IsIn([
    "ordinary",
    "extraordinary",
    "service",
    "fine",
    "reservation",
    "other",
  ])
  public category?: string;
  @IsOptional() @IsString() @Matches(MONEY) public defaultAmount?: string;
}

export class UpdateChargeConceptDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(SAFE)
  public name?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  @Matches(SAFE)
  public description?: string;
  @IsOptional()
  @IsIn([
    "ordinary",
    "extraordinary",
    "service",
    "fine",
    "reservation",
    "other",
  ])
  public category?: string;
  @IsOptional() @IsString() @Matches(MONEY) public defaultAmount?: string;
  @IsOptional() @IsIn(["active", "inactive"]) public status?: string;
}

export class CreateFeeScheduleDto {
  @IsUUID("4") public chargeConceptId!: string;
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(SAFE)
  public name!: string;
  @IsString() @Matches(MONEY) public amount!: string;
  @IsOptional()
  @IsIn(["monthly", "quarterly", "annual", "oneTime"])
  public frequency?: string;
  @Matches(DATE) public effectiveFrom!: string;
  @IsOptional() @Matches(DATE) public effectiveTo?: string;
}

export class UpdateFeeScheduleDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(SAFE)
  public name?: string;
  @IsOptional() @IsString() @Matches(MONEY) public amount?: string;
  @IsOptional()
  @IsIn(["monthly", "quarterly", "annual", "oneTime"])
  public frequency?: string;
  @IsOptional() @Matches(DATE) public effectiveFrom?: string;
  @IsOptional() @Matches(DATE) public effectiveTo?: string;
  @IsOptional() @IsIn(["active", "inactive"]) public status?: string;
}

export class CreateUnitFeeDto {
  @IsUUID("4") public propertyUnitId!: string;
  @IsUUID("4") public feeScheduleId!: string;
  @Matches(DATE) public startDate!: string;
  @IsOptional() @Matches(DATE) public endDate?: string;
}

export class EndUnitFeeDto {
  @Matches(DATE) public endDate!: string;
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Matches(SAFE)
  public reason!: string;
}

export class CreateBillingPeriodDto {
  @Matches(PERIOD) public periodCode!: string;
  @Matches(DATE) public startsAt!: string;
  @Matches(DATE) public endsAt!: string;
  @Matches(DATE) public dueDate!: string;
}

export class EmptyMutationDto {}

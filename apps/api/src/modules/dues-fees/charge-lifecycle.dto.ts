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
const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class ChargePageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) public page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) public pageSize =
    20;
  @IsOptional() @IsUUID("4") public billingPeriodId?: string;
  @IsOptional() @IsUUID("4") public propertyUnitId?: string;
  @IsOptional()
  @IsIn(["draft", "issued", "partiallyPaid", "paid", "cancelled", "reversed"])
  public status?: string;
}

export class GenerateMonthlyChargesDto {
  @IsUUID("4") public billingPeriodId!: string;
  @IsOptional() @IsUUID("4") public feeScheduleId?: string;
}

export class CreateChargeDto {
  @IsUUID("4") public billingPeriodId!: string;
  @IsUUID("4") public propertyUnitId!: string;
  @IsUUID("4") public chargeConceptId!: string;
  @IsOptional() @IsUUID("4") public feeScheduleId?: string;
  @IsIn(["extraordinary", "manual", "fine", "reservation", "other"])
  public type!: string;
  @IsString() @Matches(MONEY) public amount!: string;
  @Matches(DATE) public issuedDate!: string;
  @Matches(DATE) public dueDate!: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  @Matches(SAFE)
  public description?: string;
}

export class ChargeReasonDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Matches(SAFE)
  public reason!: string;
}

export class AdjustChargeDto extends ChargeReasonDto {
  @IsIn(["increase", "decrease"]) public type!: string;
  @IsString() @Matches(MONEY) public amount!: string;
  @Matches(DATE) public effectiveDate!: string;
}

export class ReverseChargeDto extends ChargeReasonDto {
  @Matches(DATE) public effectiveDate!: string;
}

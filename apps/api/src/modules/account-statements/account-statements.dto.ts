import { Type } from "class-transformer";
import {
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

const DATE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/u;
const SAFE = /^[^\p{Cc}<>]*$/u;

export class StatementPageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) public page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) public pageSize =
    20;
  @IsOptional() @IsUUID("4") public propertyUnitId?: string;
  @IsOptional() @IsUUID("4") public billingPeriodId?: string;
}

export class GenerateStatementDto {
  @IsUUID("4") public propertyUnitId!: string;
  @IsUUID("4") public billingPeriodId!: string;
  @Matches(DATE) public asOfDate!: string;
}

export class GenerateStatementBatchDto {
  @IsUUID("4") public billingPeriodId!: string;
  @Matches(DATE) public asOfDate!: string;
}

export class StatementReasonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Matches(SAFE)
  public reason!: string;
}

export class RecalculateBalanceDto {
  @Matches(DATE) public asOfDate!: string;
}

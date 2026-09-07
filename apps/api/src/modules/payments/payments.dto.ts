import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const MONEY = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;
const SAFE = /^[^\p{Cc}<>]*$/u;
const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class PaymentPageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) public page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) public pageSize =
    20;
  @IsOptional() @IsUUID("4") public propertyUnitId?: string;
  @IsOptional()
  @IsIn(["draft", "reported", "pendingValidation", "confirmed", "rejected"])
  public status?: string;
}

export class CreatePaymentDto {
  @IsUUID("4") public propertyUnitId!: string;
  @IsIn(["cash", "bankTransfer", "deposit", "check", "online", "other"])
  public method!: string;
  @IsString() @Matches(MONEY) public amount!: string;
  @IsISO8601({ strict: true }) public paidAt!: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE)
  public transactionReference?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE)
  public externalReference?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  @Matches(SAFE)
  public notes?: string;
}

export class PaymentReasonDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @Matches(SAFE)
  public reason!: string;
}

export class ReceiptUploadDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE)
  public receiptNumber?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  @Matches(SAFE)
  public transactionReference?: string;
}

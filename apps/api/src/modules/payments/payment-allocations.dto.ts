import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from "class-validator";

const MONEY = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/u;

export class PaymentAllocationItemDto {
  @IsUUID("4") public chargeId!: string;
  @IsString() @Matches(MONEY) public amount!: string;
}

export class AllocatePaymentDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationItemDto)
  public allocations!: PaymentAllocationItemDto[];
}

export class AutoAllocatePaymentDto {}

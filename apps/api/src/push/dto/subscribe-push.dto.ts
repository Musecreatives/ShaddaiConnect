import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushKeysDto {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

export class SubscribePushDto {
  @IsString()
  @MaxLength(500)
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  voucherCode?: string;

  /** Sent from the checkout page, where there's a payment reference but no voucher yet. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  paymentReference?: string;
}

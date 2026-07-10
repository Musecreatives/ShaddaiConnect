import { Type } from 'class-transformer';
import { Equals, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class InitializePaymentDto {
  @Type(() => Number)
  @IsInt()
  planId!: number;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /**
   * Real server-side gate, not just a UI checkbox — a request without this set to `true` is
   * rejected before any payment is initialized. Doesn't (yet) persist a signed record of
   * acceptance; see docs note on this in DECISIONS.md if a real audit trail is needed later.
   */
  @Equals(true, { message: 'You must accept the Terms & Acceptable Use to continue' })
  termsAccepted!: boolean;
}

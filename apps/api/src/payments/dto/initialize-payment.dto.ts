import { Type } from 'class-transformer';
import { Equals, IsEmail, IsInt, IsString, Matches, MaxLength } from 'class-validator';

export class InitializePaymentDto {
  @Type(() => Number)
  @IsInt()
  planId!: number;

  @IsEmail()
  email!: string;

  /** Required since 2026-08-31 — support needs a way to reach a paying customer, and the
   * customer record is what the trial-upsell / failed-payment nudges key off. Same two-word
   * shape the free-trial flow already enforces, so a "." or "x" doesn't get through. */
  @IsString()
  @Matches(/^[A-Za-zÀ-ÿ'-]{2,}(\s+[A-Za-zÀ-ÿ'-]{2,})+$/, {
    message: 'Enter your full name (first and last name)',
  })
  @MaxLength(128)
  fullName!: string;

  /** Nigerian mobile: 11 digits starting 0, or +234 / 234 followed by 10. Spaces and dashes are
   * stripped client-side before this is sent. */
  @IsString()
  @Matches(/^(0\d{10}|(\+?234)\d{10})$/, {
    message: 'Enter a valid Nigerian phone number, e.g. 08012345678',
  })
  phone!: string;

  /**
   * Real server-side gate, not just a UI checkbox — a request without this set to `true` is
   * rejected before any payment is initialized. Doesn't (yet) persist a signed record of
   * acceptance; see docs note on this in DECISIONS.md if a real audit trail is needed later.
   */
  @Equals(true, { message: 'You must accept the Terms & Acceptable Use to continue' })
  termsAccepted!: boolean;
}

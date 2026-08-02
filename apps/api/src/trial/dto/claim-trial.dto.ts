import { IsString, Matches } from 'class-validator';

export class ClaimTrialDto {
  // Loose on purpose (7-15 digits, optional leading +) — this only gates repeat trial claims,
  // it isn't used for SMS delivery or billing, so it doesn't need strict E.164 validation.
  @IsString()
  @Matches(/^\+?\d{7,15}$/, { message: 'Enter a valid phone number' })
  phone!: string;
}

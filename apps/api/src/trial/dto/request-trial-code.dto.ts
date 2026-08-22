import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// Nigerian numbers only, per business decision (2026-08-06) to raise the bar on free-trial
// abuse: 11 digits starting with 0 (e.g. 08012345678), or +234 followed by 10 digits.
const NIGERIAN_PHONE_REGEX = /^(0\d{10}|\+234\d{10})$/;

// gmail.com/yahoo.com only, same decision — narrows the field to providers people generally
// already have a real, hard-to-mass-generate account with. Verified for real via the emailed
// code in TrialVerificationService, this alone doesn't prove ownership.
const ALLOWED_EMAIL_DOMAIN_REGEX = /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;

export class RequestTrialCodeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  fullName!: string;

  @IsEmail()
  @MaxLength(128)
  @Matches(ALLOWED_EMAIL_DOMAIN_REGEX, {
    message: 'Use a gmail.com or yahoo.com email address',
  })
  email!: string;

  @IsString()
  @Matches(NIGERIAN_PHONE_REGEX, { message: 'Enter a valid Nigerian phone number' })
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  locationNote!: string;
}

import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

// Nigerian numbers only, per business decision (2026-08-06) to raise the bar on free-trial
// abuse: 11 digits starting with 0 (e.g. 08012345678), or +234 followed by 10 digits.
const NIGERIAN_PHONE_REGEX = /^(0\d{10}|\+234\d{10})$/;

// gmail.com/yahoo.com only, same decision — narrows the field to providers people generally
// already have a real, hard-to-mass-generate account with. Verified for real via the emailed
// code in TrialVerificationService, this alone doesn't prove ownership.
const ALLOWED_EMAIL_DOMAIN_REGEX = /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;

// Requires at least a first and last name, letters only (plus accents/hyphens/apostrophes for
// names like "Mary-Jane" or "O'Brien") — format/presence only, per business decision
// (2026-08-28) not to correlate against the email address (too easy to false-positive on real
// customers).
const FULL_NAME_REGEX = /^[A-Za-zÀ-ÿ'-]{2,}(\s+[A-Za-zÀ-ÿ'-]{2,})+$/;

// Common placeholder/junk names seen in free-trial abuse — checked as whole words against the
// lowercased name so "test test", "asdf asdf" etc. are rejected even though they pass the
// two-word format check above.
const PLACEHOLDER_NAME_WORDS = new Set([
  'test',
  'asdf',
  'abc',
  'abcd',
  'xxx',
  'xxxx',
  'name',
  'fullname',
  'first',
  'last',
  'na',
  'nil',
  'none',
  'sample',
]);

function IsNotPlaceholderName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPlaceholderName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return true;
          const words = value.trim().toLowerCase().split(/\s+/);
          return !words.every((word) => PLACEHOLDER_NAME_WORDS.has(word));
        },
        defaultMessage() {
          return 'Enter your real full name.';
        },
      },
    });
  };
}

export class RequestTrialCodeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  @Matches(FULL_NAME_REGEX, { message: 'Enter your full name (first and last name).' })
  @IsNotPlaceholderName()
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

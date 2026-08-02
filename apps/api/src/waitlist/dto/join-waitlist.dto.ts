import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * Mirrors the original "Starlink Mini High-Speed Wi-Fi Pre-Registration" Google Form's question
 * set — kept as one loosely-validated nested object rather than one DTO field per question,
 * since this is one-time market-research signal (usage patterns, pricing feedback, referrals),
 * not data the app queries/filters on. Every field optional and shallow-validated (just string/
 * array shape, not exact enum values) — trusting the frontend's own controlled selects rather
 * than duplicating that list of options server-side.
 */
export class WaitlistSurveyDto {
  @IsOptional() @IsString() @MaxLength(64) description?: string;
  @IsOptional() @IsString() @MaxLength(128) workplace?: string;
  @IsOptional() @IsString() @MaxLength(64) area?: string;
  @IsOptional() @IsString() @MaxLength(128) hostelName?: string;
  @IsOptional() @IsString() @MaxLength(32) houseNumber?: string;
  @IsOptional() @IsString() @MaxLength(128) landmark?: string;
  @IsOptional() @IsString() @MaxLength(32) walkingDistance?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mainUse?: string[];
  @IsOptional() @IsString() @MaxLength(32) hoursDaily?: string;
  @IsOptional() @IsString() @MaxLength(48) devices?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) networks?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) challenges?: string[];
  @IsOptional() @IsString() @MaxLength(48) monthlySubscriptionRange?: string;
  @IsOptional() @IsString() @MaxLength(16) hourlyInterest?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) voucherTypes?: string[];
  @IsOptional() @IsBoolean() isBusinessInquiry?: boolean;
  @IsOptional() @IsString() @MaxLength(64) businessDeviceCount?: string;
  @IsOptional() @IsString() @MaxLength(80) bandwidthPreference?: string;
  @IsOptional() @IsString() @MaxLength(32) referralCount?: string;
  @IsOptional() @IsString() @MaxLength(16) wouldRefer?: string;
  @IsOptional() @IsString() @MaxLength(16) readyImmediately?: string;
  @IsOptional() @IsBoolean() wantsUpdates?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class JoinWaitlistDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{7,15}$/, { message: 'Enter a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationNote?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WaitlistSurveyDto)
  survey?: WaitlistSurveyDto;
}

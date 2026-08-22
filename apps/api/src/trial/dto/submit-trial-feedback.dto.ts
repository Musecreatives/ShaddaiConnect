import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const SIGNAL_QUALITY_VALUES = ['excellent', 'good', 'weak', 'no_connection'] as const;
const WOULD_BUY_VALUES = ['yes', 'maybe', 'no'] as const;

export class SubmitTrialFeedbackDto {
  @IsOptional()
  @IsIn(SIGNAL_QUALITY_VALUES)
  signalQuality?: (typeof SIGNAL_QUALITY_VALUES)[number];

  @IsOptional()
  @IsIn(WOULD_BUY_VALUES)
  wouldBuy?: (typeof WOULD_BUY_VALUES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsIn(['hourly', 'monthly'])
  planType!: 'hourly' | 'monthly';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceNaira!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  validityDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  simultaneousUse?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dataCapMb?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bandwidthDownKbps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bandwidthUpKbps?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

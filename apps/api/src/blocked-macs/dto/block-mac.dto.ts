import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class BlockMacDto {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  macAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

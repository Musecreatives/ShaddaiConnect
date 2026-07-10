import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsISO8601 } from 'class-validator';

export class QueryVouchersDto {
  @IsOptional()
  @IsIn(['unused', 'active', 'expired', 'disabled'])
  status?: 'unused' | 'active' | 'expired' | 'disabled';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  planId?: number;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

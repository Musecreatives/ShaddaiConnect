import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsISO8601, IsString, Matches } from 'class-validator';

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

  /** Comma-separated voucher ids. Lets the printable-batch page be re-opened or bookmarked —
   * before this, a batch lived only in sessionStorage and a refresh lost it, which is no good
   * for something you print, run out of paper on, and need to print again. */
  @IsOptional()
  @IsString()
  @Matches(/^\d+(,\d+)*$/, { message: 'ids must be comma-separated numbers' })
  ids?: string;
}

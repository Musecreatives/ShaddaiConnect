import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

export class PatchVoucherDto {
  @IsIn(['disable', 'enable', 'extend'])
  action!: 'disable' | 'enable' | 'extend';

  @ValidateIf((dto: PatchVoucherDto) => dto.action === 'extend')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  additionalDays?: number;
}

import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class InitializePaymentDto {
  @Type(() => Number)
  @IsInt()
  planId!: number;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

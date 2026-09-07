import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class NotifyPaymentGatewayIssueDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  planName?: string;
}

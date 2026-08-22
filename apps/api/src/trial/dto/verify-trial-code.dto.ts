import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class VerifyTrialCodeDto {
  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

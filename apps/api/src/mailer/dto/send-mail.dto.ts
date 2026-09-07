import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMailDto {
  @IsEmail()
  to!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}

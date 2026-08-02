import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name!: string;

  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

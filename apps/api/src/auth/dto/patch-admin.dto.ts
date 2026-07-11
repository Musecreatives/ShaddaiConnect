import { IsBoolean } from 'class-validator';

export class PatchAdminDto {
  @IsBoolean()
  active!: boolean;
}

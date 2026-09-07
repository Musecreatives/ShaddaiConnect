import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { POST_STATUSES } from './create-post.dto';
import type { PostStatusValue } from './create-post.dto';

/** Not PartialType(CreatePostDto): categoryId/featuredImage/publishAt need to accept `null` to
 * clear a previously-set value, which class-validator's optional-field handling doesn't do for
 * an inherited @IsInt()/@IsISO8601() without this per-field null allowance. */
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(POST_STATUSES)
  status?: PostStatusValue;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  featuredImage?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(128)
  authorName?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsISO8601()
  publishAt?: string | null;
}

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
} from 'class-validator';

export const POST_STATUSES = ['draft', 'review', 'scheduled', 'published'] as const;
export type PostStatusValue = (typeof POST_STATUSES)[number];

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsIn(POST_STATUSES)
  status?: PostStatusValue;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  featuredImage?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  authorName?: string;

  @IsOptional()
  @IsISO8601()
  publishAt?: string;
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SITE_SETTING_FIELDS, SiteSettingsService } from './site-settings.service';

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

/** Public: the buy site reads its editable copy from here. No auth — this is the same content
 * that's rendered on public pages anyway. */
@Controller('site-settings')
export class PublicSiteSettingsController {
  constructor(private readonly settings: SiteSettingsService) {}

  @Get()
  get() {
    return this.settings.getAll();
  }
}

@Controller('admin/site-settings')
@UseGuards(JwtAuthGuard)
export class AdminSiteSettingsController {
  constructor(private readonly settings: SiteSettingsService) {}

  /** Returns the field definitions alongside the values so the admin page renders itself from
   * one source of truth — adding a field server-side needs no admin UI change. */
  @Get()
  async get() {
    return { fields: SITE_SETTING_FIELDS, values: await this.settings.getAll() };
  }

  @Patch()
  update(@Body() body: Record<string, string>) {
    return this.settings.update(body);
  }

  /** Powers the `_image`-suffixed fields in the admin Site Content form — uploads a file to disk
   * (served back publicly by main.ts's useStaticAssets) and returns its URL, which the caller
   * then PATCHes in like any other field value. No schema change: the stored value is a string
   * either way, this just gets one onto disk first. */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
          cb(new BadRequestException('Only PNG, JPEG, or WebP images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/uploads/${file.filename}` };
  }
}

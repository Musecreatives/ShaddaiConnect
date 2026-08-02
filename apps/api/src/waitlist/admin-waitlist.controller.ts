import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WaitlistService } from './waitlist.service';

@Controller('admin/waitlist')
@UseGuards(JwtAuthGuard)
export class AdminWaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Get()
  findAll() {
    return this.waitlist.findAll();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  importCsv(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded — expected a "file" field.');
    return this.waitlist.importCsv(file.buffer.toString('utf-8'));
  }

  @Post('notify-imported')
  notifyImported() {
    return this.waitlist.notifyImportedSignups();
  }

  @Post('notify')
  notify() {
    return this.waitlist.notifyLaunch();
  }
}

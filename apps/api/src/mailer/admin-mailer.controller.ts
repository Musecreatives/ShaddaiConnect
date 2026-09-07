import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMailDto } from './dto/send-mail.dto';
import { MailerService } from './mailer.service';

@Controller('admin/mailer')
@UseGuards(JwtAuthGuard)
export class AdminMailerController {
  constructor(private readonly mailer: MailerService) {}

  @Post('send')
  send(@Body() dto: SendMailDto) {
    return this.mailer.send(dto);
  }
}

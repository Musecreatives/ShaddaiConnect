import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { supportContactTemplate } from '../email/templates/support-contact.template';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async contact(dto: ContactDto): Promise<{ sent: true }> {
    const supportEmail = this.config.get<string>('SUPPORT_EMAIL') || 'support@shaddaicommunications.com';
    await this.email.send({
      to: supportEmail,
      subject: `Support message from ${dto.name}`,
      html: supportContactTemplate(dto),
    });
    return { sent: true };
  }
}

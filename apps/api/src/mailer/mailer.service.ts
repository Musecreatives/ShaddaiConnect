import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { plainBodyTemplate } from '../email/templates/base.template';
import { SendMailDto } from './dto/send-mail.dto';

/** Free-form admin-composed email — the general-purpose counterpart to the bespoke templates
 * under email/templates/ (trial upsell, payment reminder, etc.), for one-off messages nobody
 * wrote a dedicated template for. Nothing here is persisted — this project has no outbox/send
 * history table, matching every other admin notify action (trial upsell, failed-payment
 * reminder) which also fires-and-forgets through EmailService without logging past its own
 * logger line. */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly email: EmailService) {}

  async send(dto: SendMailDto): Promise<{ sent: boolean }> {
    const sent = await this.email.send({
      to: dto.to,
      subject: dto.subject,
      html: plainBodyTemplate(dto.body),
    });
    this.logger.log(`Mailer: sent="${dto.subject}" to=${dto.to} (sent=${sent}).`);
    return { sent };
  }
}

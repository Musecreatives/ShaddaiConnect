import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

interface SendOpts {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled: boolean;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    this.fromAddress = this.config.get<string>('SUPPORT_EMAIL') || 'support@shaddaicommunications.com';
    this.enabled = Boolean(apiKey);
    if (this.enabled) {
      sgMail.setApiKey(apiKey!);
    } else {
      this.logger.warn('SENDGRID_API_KEY not set — emails will be logged, not sent.');
    }
  }

  async send(opts: SendOpts): Promise<void> {
    if (!this.enabled) {
      this.logger.log(`[email suppressed, no SENDGRID_API_KEY] to=${opts.to} subject="${opts.subject}"`);
      return;
    }
    try {
      await sgMail.send({
        to: opts.to,
        from: { email: this.fromAddress, name: 'Shaddai Communications' },
        subject: opts.subject,
        html: opts.html,
      });
    } catch (err) {
      // Never let a notification failure break the caller's transaction (voucher issuance,
      // waitlist signup, etc.) — email is best-effort, not a business-critical path.
      this.logger.error(`Failed to send email to ${opts.to}: ${(err as Error).message}`);
    }
  }
}

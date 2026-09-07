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
    this.fromAddress =
      this.config.get<string>('SUPPORT_EMAIL') || 'support@shaddaicommunications.com';
    this.enabled = Boolean(apiKey);
    if (this.enabled) {
      sgMail.setApiKey(apiKey!);
    } else {
      this.logger.warn('SENDGRID_API_KEY not set — emails will be logged, not sent.');
    }
  }

  /**
   * Returns whether the mail actually went out. Still never throws — a failed notification must
   * not break the caller's transaction (voucher issuance, waitlist signup) — but callers whose
   * whole flow depends on the mail arriving (the trial OTP) need to be able to tell, instead of
   * reporting success for a code that was never sent.
   */
  async send(opts: SendOpts): Promise<boolean> {
    if (!this.enabled) {
      this.logger.log(
        `[email suppressed, no SENDGRID_API_KEY] to=${opts.to} subject="${opts.subject}"`,
      );
      return false;
    }
    try {
      await sgMail.send({
        to: opts.to,
        from: { email: this.fromAddress, name: 'Shaddai Communications' },
        subject: opts.subject,
        html: opts.html,
      });
      return true;
    } catch (err) {
      // SendGrid puts the useful detail (bad key, unverified sender, blocked recipient) in
      // response.body, which the bare message omits — log it or these are undiagnosable.
      const detail = (err as { response?: { body?: unknown } }).response?.body;
      this.logger.error(
        `Failed to send email to ${opts.to}: ${(err as Error).message}` +
          (detail ? ` — ${JSON.stringify(detail)}` : ''),
      );
      return false;
    }
  }
}

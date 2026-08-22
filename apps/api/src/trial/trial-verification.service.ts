import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { EmailService } from '../email/email.service';
import { trialVerificationCodeTemplate } from '../email/templates/trial-verification-code.template';
import { RequestTrialCodeDto } from './dto/request-trial-code.dto';
import { TrialService } from './trial.service';

interface PendingTrial {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  locationNote: string;
  expiresAt: number;
  attempts: number;
}

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Pending codes live in-memory, not the DB — they're short-lived (10 min), single-instance
 * (this API isn't horizontally scaled), and never need to survive a restart; a deploy landing
 * mid-flow just means the customer re-requests a code, which is an acceptable tradeoff against
 * the DDL/table churn a persisted OTP store would add for something this disposable.
 */
@Injectable()
export class TrialVerificationService {
  private readonly logger = new Logger(TrialVerificationService.name);
  private readonly pending = new Map<string, PendingTrial>();

  constructor(
    private readonly email: EmailService,
    private readonly trial: TrialService,
  ) {}

  async requestCode(dto: RequestTrialCodeDto): Promise<{ sent: true }> {
    const key = dto.email.toLowerCase();
    const existing = this.pending.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      throw new HttpException(
        'A code was already sent — check your email, or wait a few minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(randomInt(100000, 1000000));
    this.pending.set(key, {
      code,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      locationNote: dto.locationNote,
      expiresAt: Date.now() + CODE_TTL_MS,
      attempts: 0,
    });

    await this.email.send({
      to: dto.email,
      subject: 'Your Shaddai WiFi verification code',
      html: trialVerificationCodeTemplate(code),
    });

    return { sent: true };
  }

  async verifyAndClaim(email: string, code: string): Promise<{ code: string }> {
    const key = email.toLowerCase();
    const pending = this.pending.get(key);
    if (!pending || pending.expiresAt < Date.now()) {
      this.pending.delete(key);
      throw new BadRequestException('That code has expired — request a new one.');
    }

    pending.attempts++;
    if (pending.attempts > MAX_VERIFY_ATTEMPTS) {
      this.pending.delete(key);
      throw new BadRequestException('Too many incorrect attempts — request a new code.');
    }

    if (pending.code !== code) {
      throw new BadRequestException('Incorrect code.');
    }

    this.pending.delete(key);
    try {
      return await this.trial.claim(pending.phone, pending.email, pending.fullName, pending.locationNote);
    } catch (err) {
      this.logger.warn(`Trial claim failed after verification for ${email}: ${err}`);
      throw err;
    }
  }
}

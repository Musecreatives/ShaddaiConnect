import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { EmailService } from '../email/email.service';
import { trialVerificationCodeTemplate } from '../email/templates/trial-verification-code.template';
import { PrismaService } from '../prisma/prisma.service';
import { RequestTrialCodeDto } from './dto/request-trial-code.dto';
import { TrialService } from './trial.service';

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Pending codes live in the `trial_otps` table, not in memory. They were in-memory originally on
 * the reasoning that they're short-lived and disposable — but that meant every API restart
 * silently invalidated every in-flight code, and with deploys happening during business hours a
 * customer would sit waiting on a code that had already stopped working (observed 2026-08-31,
 * mid-demo to a real client). Persisting them makes signups survive deploys.
 */
@Injectable()
export class TrialVerificationService {
  private readonly logger = new Logger(TrialVerificationService.name);

  constructor(
    private readonly email: EmailService,
    private readonly trial: TrialService,
    private readonly prisma: PrismaService,
  ) {}

  async requestCode(dto: RequestTrialCodeDto): Promise<{ sent: true }> {
    await this.trial.findActiveTrialPlan(); // fail fast — don't send an OTP for a paused trial

    const key = dto.email.toLowerCase();

    // Opportunistic cleanup — cheap, indexed, and avoids needing a dedicated cron for a table
    // that only ever holds a handful of rows.
    await this.prisma.trialOtp.deleteMany({ where: { expiresAt: { lt: new Date() } } });

    const existing = await this.prisma.trialOtp.findUnique({ where: { email: key } });
    if (existing && existing.expiresAt > new Date()) {
      throw new HttpException(
        'A code was already sent — check your email, or wait a few minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(randomInt(100000, 1000000));
    const record = {
      code,
      fullName: dto.fullName,
      phone: dto.phone,
      locationNote: dto.locationNote,
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    };
    await this.prisma.trialOtp.upsert({
      where: { email: key },
      create: { email: key, ...record },
      update: record,
    });

    const delivered = await this.email.send({
      to: dto.email,
      subject: 'Your Shaddai WiFi verification code',
      html: trialVerificationCodeTemplate(code),
    });

    if (!delivered) {
      // Drop the pending row, otherwise the retry hits the "a code was already sent" guard above
      // and the customer is stuck for 10 minutes waiting on a code that never left.
      await this.prisma.trialOtp.deleteMany({ where: { email: key } });
      this.logger.error(`Trial OTP could not be emailed to ${dto.email}`);
      throw new ServiceUnavailableException(
        "We couldn't send your code right now. Please try again in a moment.",
      );
    }

    this.logger.log(`Trial OTP sent to ${dto.email}`);
    return { sent: true };
  }

  async verifyAndClaim(email: string, code: string): Promise<{ code: string }> {
    const key = email.toLowerCase();
    const pending = await this.prisma.trialOtp.findUnique({ where: { email: key } });
    if (!pending || pending.expiresAt < new Date()) {
      if (pending) await this.prisma.trialOtp.deleteMany({ where: { email: key } });
      throw new BadRequestException('That code has expired — request a new one.');
    }

    // Count the attempt before checking the code, so brute-forcing can't get free tries by
    // always submitting a wrong value.
    const attempts = pending.attempts + 1;
    if (attempts > MAX_VERIFY_ATTEMPTS) {
      await this.prisma.trialOtp.deleteMany({ where: { email: key } });
      throw new BadRequestException('Too many incorrect attempts — request a new code.');
    }
    await this.prisma.trialOtp.update({ where: { email: key }, data: { attempts } });

    if (pending.code !== code) {
      throw new BadRequestException('Incorrect code.');
    }

    await this.prisma.trialOtp.deleteMany({ where: { email: key } });
    try {
      return await this.trial.claim(pending.phone, email, pending.fullName, pending.locationNote);
    } catch (err) {
      this.logger.warn(`Trial claim failed after verification for ${email}: ${err}`);
      throw err;
    }
  }
}

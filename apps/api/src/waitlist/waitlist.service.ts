import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NtfyService } from '../ntfy/ntfy.service';
import { PrismaService } from '../prisma/prisma.service';
import { waitlistConfirmationTemplate } from '../email/templates/waitlist-confirmation.template';
import { waitlistLaunchTemplate } from '../email/templates/waitlist-launch.template';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { parseWaitlistCsv } from './csv-parser.util';

export interface ImportSummary {
  added: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly ntfy: NtfyService,
  ) {}

  async join(dto: JoinWaitlistDto): Promise<{ joined: true }> {
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('Provide a phone number or an email address.');
    }

    const existing = await this.prisma.waitlist.findFirst({
      where: {
        OR: [
          ...(dto.phone ? [{ phone: dto.phone }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException("You're already on the waitlist — we'll email you at launch.");
    }

    await this.prisma.waitlist.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        locationNote: dto.locationNote,
        source: 'form',
        confirmationSentAt: dto.email ? new Date() : undefined,
        surveyResponses: dto.survey ? JSON.stringify(dto.survey) : undefined,
      },
    });

    if (dto.email) {
      await this.email.send({
        to: dto.email,
        subject: "You're on the Shaddai WiFi waitlist",
        html: waitlistConfirmationTemplate(dto.name),
      });
    }

    this.ntfy.publish({
      title: 'New waitlist signup',
      message: `${dto.name}${dto.locationNote ? ` from ${dto.locationNote}` : ''}`,
      tags: ['raised_hand'],
    });

    return { joined: true };
  }

  findAll() {
    return this.prisma.waitlist.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** CSV column headers are matched flexibly (see csv-parser.util.ts) since the real export this
   * was built against is a Google Forms download with its own question text as headers, not
   * generic field names. Skips (not errors) any row whose email already exists — re-importing
   * the same file twice is safe. Doesn't send any email here; that's a separate explicit step
   * (notifyImportedSignups) so a bad import doesn't immediately blast confirmation emails. */
  async importCsv(fileContent: string): Promise<ImportSummary> {
    const rows = parseWaitlistCsv(fileContent);
    const summary: ImportSummary = { added: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      if (!row.email) {
        summary.errors.push(`Row ${row.rowNumber}: missing email, skipped.`);
        continue;
      }
      // Real gotcha hit during the first live import: a misaligned form response put a phone
      // number in the email column ("+234..."). No `@` means it can't be a real email — reject
      // it here rather than silently storing a value that would later bounce at send time.
      if (!row.email.includes('@')) {
        summary.errors.push(`Row ${row.rowNumber}: "${row.email}" doesn't look like an email, skipped.`);
        continue;
      }
      try {
        const existing = await this.prisma.waitlist.findFirst({ where: { email: row.email } });
        if (existing) {
          summary.skipped++;
          continue;
        }
        await this.prisma.waitlist.create({
          data: {
            email: row.email,
            name: row.name,
            phone: row.phone,
            locationNote: row.locationNote,
            source: 'import',
          },
        });
        summary.added++;
      } catch (err) {
        summary.errors.push(`Row ${row.rowNumber}: ${(err as Error).message}`);
      }
    }

    return summary;
  }

  /** Sends the same confirmation email real signups get, to anyone (imported OR form-source) who
   * hasn't had one yet — covers imports (separate step from importCsv() so a bad/duplicate import
   * doesn't auto-send anything) and any older form signups that predate the confirmationSentAt
   * column, or that failed to send at signup time (email.send() only logs on failure, it doesn't
   * throw, so a transient SendGrid error wouldn't otherwise get retried). */
  async notifyImportedSignups(): Promise<{ notified: number }> {
    const pending = await this.prisma.waitlist.findMany({
      where: { confirmationSentAt: null, email: { not: null } },
    });

    let sent = 0;
    for (const entry of pending) {
      await this.email.send({
        to: entry.email!,
        subject: "You're on the Shaddai WiFi waitlist",
        html: waitlistConfirmationTemplate(entry.name ?? undefined),
      });
      await this.prisma.waitlist.update({
        where: { id: entry.id },
        data: { confirmationSentAt: new Date() },
      });
      sent++;
    }

    if (sent > 0) {
      this.logger.log(`Sent confirmation email to ${sent} imported waitlist signup(s).`);
    }
    return { notified: sent };
  }

  async notifyLaunch(): Promise<{ notified: number }> {
    const buyUrl = this.config.get<string>('CUSTOMER_APP_URL') || 'https://buy.shaddaicommunications.com';
    const pending = await this.prisma.waitlist.findMany({
      where: { notifiedAt: null, email: { not: null } },
    });

    for (const entry of pending) {
      await this.email.send({
        to: entry.email!,
        subject: 'Shaddai WiFi is live in your area',
        html: waitlistLaunchTemplate({ name: entry.name ?? undefined, buyUrl }),
      });
    }

    if (pending.length > 0) {
      await this.prisma.waitlist.updateMany({
        where: { id: { in: pending.map((e) => e.id) } },
        data: { notifiedAt: new Date() },
      });
    }

    return { notified: pending.length };
  }
}

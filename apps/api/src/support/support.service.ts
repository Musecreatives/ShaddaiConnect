import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NtfyService } from '../ntfy/ntfy.service';
import { supportContactTemplate } from '../email/templates/support-contact.template';
import { ContactDto } from './dto/contact.dto';
import type { SupportPriority, SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly ntfy: NtfyService,
  ) {}

  async contact(dto: ContactDto): Promise<{ sent: true }> {
    const supportEmail = this.config.get<string>('SUPPORT_EMAIL') || 'support@shaddaicommunications.com';
    await this.email.send({
      to: supportEmail,
      subject: `Support message from ${dto.name}`,
      html: supportContactTemplate(dto),
    });

    await this.prisma.supportTicket.create({
      data: {
        customerName: dto.name,
        customerEmail: dto.email,
        message: dto.message,
      },
    });

    await this.ntfy.publish({
      title: 'New support message',
      message: `${dto.name} (${dto.email}): ${dto.message.slice(0, 200)}`,
      tags: ['speech_balloon'],
    });

    return { sent: true };
  }

  findAllForAdmin() {
    return this.prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateForAdmin(id: number, data: { status?: SupportTicketStatus; priority?: SupportPriority }) {
    return this.prisma.supportTicket.update({ where: { id }, data });
  }
}

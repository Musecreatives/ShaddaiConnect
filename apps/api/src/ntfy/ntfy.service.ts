import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { adminAlertTemplate } from '../email/templates/admin-alert.template';
import { PushService } from '../push/push.service';

export interface NtfyPublishInput {
  title: string;
  message: string;
  tags?: string[];
}

export interface NtfyNotification {
  id: string;
  title: string;
  message: string;
  tags: string[];
  time: number;
}

/**
 * Thin client for the self-hosted ntfy instance (docker/docker-compose.portal.yml, bound to
 * 127.0.0.1 only — never exposed publicly). Silently no-ops when unconfigured so local/dev
 * environments without ntfy running don't break. History comes straight from ntfy's own message
 * cache (`GET /{topic}/json?poll=1&since=...`) rather than a separate DB table — ntfy already
 * persists it, so a second store would just be a sync-prone duplicate.
 */
@Injectable()
export class NtfyService {
  private readonly logger = new Logger(NtfyService.name);
  private readonly baseUrl: string | undefined;
  private readonly topic: string | undefined;
  private readonly enabled: boolean;
  private readonly alertEmail: string | undefined;

  constructor(
    config: ConfigService,
    private readonly email: EmailService,
    private readonly push: PushService,
  ) {
    this.baseUrl = config.get<string>('NTFY_URL');
    this.topic = config.get<string>('NTFY_TOPIC');
    this.enabled = Boolean(this.baseUrl && this.topic);
    if (!this.enabled) {
      this.logger.warn('NTFY_URL/NTFY_TOPIC not set — push notifications disabled.');
    }
    this.alertEmail = config.get<string>('ADMIN_ALERT_EMAIL');
    if (!this.alertEmail) {
      this.logger.warn('ADMIN_ALERT_EMAIL not set — admin alert emails disabled.');
    }
  }

  async publish(input: NtfyPublishInput): Promise<void> {
    await Promise.all([
      this.publishToNtfy(input),
      this.publishToEmail(input),
      this.push.sendToAdmins({ title: input.title, body: input.message }),
    ]);
  }

  private async publishToNtfy(input: NtfyPublishInput): Promise<void> {
    if (!this.enabled) return;
    try {
      await fetch(`${this.baseUrl}/${this.topic}`, {
        method: 'POST',
        headers: {
          Title: input.title,
          Tags: (input.tags ?? []).join(','),
        },
        body: input.message,
      });
    } catch (err) {
      this.logger.warn(`ntfy publish failed: ${(err as Error).message}`);
    }
  }

  // Same events that hit the admin bell (payments, support messages, blocklist hits, etc.) —
  // this is deliberately not a separate opt-in list, so the two channels never drift apart.
  private async publishToEmail(input: NtfyPublishInput): Promise<void> {
    if (!this.alertEmail) return;
    await this.email.send({
      to: this.alertEmail,
      subject: input.title,
      html: adminAlertTemplate({ title: input.title, message: input.message }),
    });
  }

  async getRecent(): Promise<NtfyNotification[]> {
    if (!this.enabled) return [];
    try {
      const res = await fetch(`${this.baseUrl}/${this.topic}/json?poll=1&since=7d`);
      if (!res.ok) return [];
      const text = await res.text();
      return text
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .filter((msg) => msg.event === 'message')
        .map((msg) => ({
          id: msg.id,
          title: msg.title ?? 'Shaddai',
          message: msg.message ?? '',
          tags: msg.tags ?? [],
          time: msg.time * 1000,
        }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 20);
    } catch (err) {
      this.logger.warn(`ntfy history fetch failed: ${(err as Error).message}`);
      return [];
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeAdminPushDto } from './dto/subscribe-admin-push.dto';
import { SubscribePushDto } from './dto/subscribe-push.dto';

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  data?: { url: string };
}

/**
 * Web Push (RFC 8030), not a third-party push service — VAPID keys are self-generated
 * (docker/.env on the server), delivery goes through the browser vendor's own push relay
 * (Chrome/Firefox/Safari's infrastructure, inherent to the Web Push standard itself), no
 * account or API key with any external notification provider.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    const publicKey = config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      config.get<string>('VAPID_SUBJECT') ?? 'mailto:support@shaddaicommunications.com';
    this.enabled = Boolean(publicKey && privateKey);

    if (this.enabled) {
      webpush.setVapidDetails(subject, publicKey!, privateKey!);
    } else {
      this.logger.warn('VAPID keys not set — push notifications disabled.');
    }
  }

  async subscribe(dto: SubscribePushDto): Promise<{ subscribed: true }> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        voucherCode: dto.voucherCode,
        paymentReference: dto.paymentReference,
      },
      // Only overwrite a field the caller actually supplied: the checkout page subscribes with a
      // paymentReference and the success page later re-subscribes the same endpoint with a
      // voucherCode, and neither should wipe the other.
      update: {
        ...(dto.voucherCode !== undefined ? { voucherCode: dto.voucherCode } : {}),
        ...(dto.paymentReference !== undefined ? { paymentReference: dto.paymentReference } : {}),
      },
    });
    return { subscribed: true };
  }

  /** Nudges a customer who started a payment but never completed it. Keyed by the payment
   * reference because at that point no voucher exists yet. */
  async sendToPaymentReference(reference: string, payload: PushPayload): Promise<void> {
    if (!this.enabled) return;
    const subs = await this.prisma.pushSubscription.findMany({
      where: { paymentReference: reference },
    });
    await Promise.all(subs.map((sub) => this.sendToSubscription(sub, payload)));
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async subscribeAdmin(
    dto: SubscribeAdminPushDto,
    adminEmail: string,
  ): Promise<{ subscribed: true }> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        adminEmail,
      },
      update: { adminEmail, voucherCode: null },
    });
    return { subscribed: true };
  }

  /** Real OS-level push for the admin PWA, alongside the ntfy/email fan-out every admin alert
   * already goes through — see NtfyService.publish(). No-ops (same as sendToVoucher) if VAPID
   * keys aren't configured. */
  async sendToAdmins(payload: PushPayload): Promise<void> {
    if (!this.enabled) return;
    const subs = await this.prisma.pushSubscription.findMany({
      where: { adminEmail: { not: null } },
    });
    await Promise.all(subs.map((sub) => this.sendToSubscription(sub, payload)));
  }

  /**
   * Logs to voucher_notifications regardless of whether this device has an active push
   * subscription — the in-app history (GET /vouchers/:code/notifications) is its own record,
   * separate from whether OS-level delivery actually happened, so a customer who never granted
   * notification permission still sees "you connected" / "5 min left" when they open the app.
   */
  async sendToVoucher(voucherCode: string, payload: PushPayload): Promise<void> {
    await this.prisma.voucherNotification.create({
      data: { voucherCode, title: payload.title, body: payload.body },
    });

    if (!this.enabled) return;
    const subs = await this.prisma.pushSubscription.findMany({ where: { voucherCode } });
    // data.url lets sw.js's notificationclick open straight to this voucher's status/upsell
    // screen instead of the generic home page — otherwise a customer whose trial just expired
    // taps the notification and lands back at the plan picker with no idea which code it was about.
    const withUrl = { ...payload, data: { url: `/check?code=${encodeURIComponent(voucherCode)}` } };
    await Promise.all(subs.map((sub) => this.sendToSubscription(sub, withUrl)));
  }

  getRecentForVoucher(voucherCode: string) {
    return this.prisma.voucherNotification.findMany({
      where: { voucherCode },
      orderBy: { sentAt: 'desc' },
      take: 20,
    });
  }

  private async sendToSubscription(
    sub: { id: number; endpoint: string; p256dh: string; auth: string },
    payload: PushPayload,
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      );
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      // 404/410 = the browser/OS has permanently invalidated this subscription (uninstalled,
      // permissions revoked, etc) — clean it up rather than retry it forever.
      if (statusCode === 404 || statusCode === 410) {
        await this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        this.logger.warn(`Push send failed for subscription ${sub.id}: ${(err as Error).message}`);
      }
    }
  }
}

import { subscribePush } from './api';

// Web Push requires the VAPID public key as a Uint8Array, but the browser API/env var carries it
// base64url-encoded — this is the standard conversion every Web Push tutorial uses.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushSubscribeResult = 'subscribed' | 'denied' | 'unsupported';

/** Requests notification permission and subscribes this browser to Web Push, tied to a voucher
 * code so the backend knows which device to alert on that voucher's events. Safe to call
 * repeatedly — an existing subscription for this browser/site just gets reused. */
export async function subscribeToVoucherPush(voucherCode: string): Promise<PushSubscribeResult> {
  return subscribeInternal({ voucherCode });
}

/**
 * Subscribes against a payment reference instead of a voucher — used on the checkout page,
 * where no voucher exists yet, so an abandoned payment can still be nudged
 * (AbandonedPaymentService). `silent` skips the permission prompt unless the customer has
 * already granted it: interrupting someone mid-purchase to ask for notifications would cost
 * more sales than the nudge recovers.
 */
export async function subscribeToPaymentPush(
  paymentReference: string,
  { silent = true }: { silent?: boolean } = {},
): Promise<PushSubscribeResult> {
  if (silent && Notification.permission !== 'granted') return 'denied';
  return subscribeInternal({ paymentReference });
}

async function subscribeInternal(
  target: { voucherCode?: string; paymentReference?: string },
): Promise<PushSubscribeResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'unsupported';

  await subscribePush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    ...target,
  });

  return 'subscribed';
}

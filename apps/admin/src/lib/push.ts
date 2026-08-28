import { subscribeAdminPush } from './api';

// Web Push requires the VAPID public key as a Uint8Array, but the browser API/env var carries it
// base64url-encoded — same conversion as the customer app's push.ts.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushSubscribeResult = 'subscribed' | 'denied' | 'unsupported';

/** Requests notification permission and subscribes this browser to Web Push for admin alerts
 * (payments, blocklist hits, trial signups, support messages — the same events already driving
 * the in-app bell). Safe to call repeatedly — an existing subscription just gets reused. */
export async function subscribeToAdminPush(): Promise<PushSubscribeResult> {
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

  await subscribeAdminPush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });

  return 'subscribed';
}

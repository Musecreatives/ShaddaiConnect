import { cookies } from 'next/headers';
import type {
  AdminPaymentRow,
  AdminSettings,
  AdminStats,
  AdminUserRow,
  AuditLogEntry,
  BlockedMac,
  Category,
  CustomerRow,
  FirewallStatus,
  FraudSignal,
  MediaAsset,
  NetworkOverview,
  Plan,
  Post,
  RepeatTrialDevice,
  SessionRow,
  SiteSettingsPayload,
  SupportTicket,
  TrialFeedbackRow,
  Voucher,
  WaitlistRow,
} from './api';

/** Every fetch in this file runs server-side, so prefer the internal address: the public
 * hostname routes out through Cloudflare and back for no reason (1.28s vs 1.7ms measured), since
 * the API is on this same host. Falls back to the public URL when unset. */
const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Server Component fetch — forwards the browser's cookies explicitly (see lib/auth.ts). */
async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function getStatsServer(): Promise<AdminStats> {
  return serverFetch<AdminStats>('/admin/stats');
}

export function getVouchersServer(filter?: { ids?: string }): Promise<Voucher[]> {
  const qs = filter?.ids ? `?ids=${encodeURIComponent(filter.ids)}` : '';
  return serverFetch<Voucher[]>(`/admin/vouchers${qs}`);
}

export function getPlansServer(): Promise<Plan[]> {
  return serverFetch<Plan[]>('/admin/plans');
}

export function getPaymentsServer(): Promise<{ payments: AdminPaymentRow[]; total: number }> {
  return serverFetch('/admin/payments');
}

export function getSessionsServer(
  status: 'live' | 'all' = 'live',
): Promise<{ sessions: SessionRow[]; total: number }> {
  return serverFetch(`/admin/sessions?status=${status}`);
}

export function getCustomersServer(): Promise<{ customers: CustomerRow[]; total: number }> {
  return serverFetch('/admin/customers');
}

export function getNetworkOverviewServer(): Promise<NetworkOverview> {
  return serverFetch('/admin/network');
}

export function getSettingsServer(): Promise<AdminSettings> {
  return serverFetch('/admin/settings');
}

export function getAdminsServer(): Promise<AdminUserRow[]> {
  return serverFetch('/admin/admins');
}

export function getFraudSignalsServer(): Promise<FraudSignal[]> {
  return serverFetch('/admin/payments/fraud-signals');
}

export function getWaitlistServer(): Promise<WaitlistRow[]> {
  return serverFetch('/admin/waitlist');
}

export function getTrialFeedbackServer(): Promise<TrialFeedbackRow[]> {
  return serverFetch('/admin/trial-feedback');
}

export function getRepeatTrialDevicesServer(): Promise<RepeatTrialDevice[]> {
  return serverFetch('/admin/trial-feedback/repeat-devices');
}

export function getSiteSettingsServer(): Promise<SiteSettingsPayload> {
  return serverFetch('/admin/site-settings');
}

export function getFirewallStatusServer(): Promise<FirewallStatus> {
  return serverFetch('/admin/firewall');
}

export function getSupportTicketsServer(): Promise<SupportTicket[]> {
  return serverFetch('/admin/support-tickets');
}

export function getBlockedMacsServer(): Promise<BlockedMac[]> {
  return serverFetch('/admin/blocked-macs');
}

export function getAuditLogServer(): Promise<{ entries: AuditLogEntry[]; total: number }> {
  return serverFetch('/admin/audit-log');
}

export function getReminderCountsServer(): Promise<{
  trialUpsellPending: number;
  paymentReminderPending: number;
}> {
  return serverFetch('/admin/customers/reminder-counts');
}

export function getPostsServer(): Promise<Post[]> {
  return serverFetch('/admin/journal/posts');
}

export function getPostServer(id: number): Promise<Post> {
  return serverFetch(`/admin/journal/posts/${id}`);
}

export function getCategoriesServer(): Promise<Category[]> {
  return serverFetch('/admin/journal/categories');
}

export function getMediaServer(): Promise<MediaAsset[]> {
  return serverFetch('/admin/media');
}

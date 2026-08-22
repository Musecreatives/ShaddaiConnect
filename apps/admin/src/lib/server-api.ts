import { cookies } from 'next/headers';
import type {
  AdminPaymentRow,
  AdminSettings,
  AdminStats,
  AdminUserRow,
  BlockedMac,
  CustomerRow,
  FraudSignal,
  NetworkOverview,
  Plan,
  SessionRow,
  SupportTicket,
  TrialFeedbackRow,
  Voucher,
  WaitlistRow,
} from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

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

export function getVouchersServer(): Promise<Voucher[]> {
  return serverFetch<Voucher[]>('/admin/vouchers');
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

export function getSupportTicketsServer(): Promise<SupportTicket[]> {
  return serverFetch('/admin/support-tickets');
}

export function getBlockedMacsServer(): Promise<BlockedMac[]> {
  return serverFetch('/admin/blocked-macs');
}

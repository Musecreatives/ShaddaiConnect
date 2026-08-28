const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface Plan {
  id: number;
  name: string;
  planType: 'hourly' | 'monthly';
  priceNaira: number;
  durationHours: number | null;
  validityDays: number | null;
  simultaneousUse: number;
  dataCapMb: number | null;
  bandwidthDownKbps: number | null;
  bandwidthUpKbps: number | null;
  active: boolean;
  createdAt: string;
}

export interface Voucher {
  id: number;
  code: string;
  planId: number;
  customerId: number | null;
  status: 'unused' | 'active' | 'expired' | 'disabled';
  simultaneousUseOverride: number | null;
  amountPaid: string | null;
  createdAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  plan: Plan;
}

export interface AdminStats {
  revenueToday: number;
  revenueYesterday: number;
  revenueLast7Days: number;
  revenueTrend: number[];
  activeSessions: number;
  vouchersIssuedToday: number;
  vouchersIssuedTotal: number;
  dataUsedTodayMb: number;
}

export interface AdminPaymentRow {
  id: number;
  reference: string;
  amountNaira: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  planName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface FraudSignal {
  customerId: number;
  email?: string;
  phone?: string;
  failedCount: number;
  lastAttemptAt: string;
}

export interface SessionRow {
  id: string;
  username: string;
  macAddress: string;
  ipAddress: string;
  nasIpAddress: string;
  startedAt: string | null;
  stoppedAt: string | null;
  durationSeconds: number | null;
  downloadBytes: number;
  uploadBytes: number;
  live: boolean;
  stale: boolean;
  signalRssi: number | null;
  apName: string | null;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Client-side helper — always sends the httpOnly admin_jwt cookie cross-origin. */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

export function login(email: string, password: string) {
  return apiFetch<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<{ loggedOut: true }>('/auth/logout', { method: 'POST' });
}

export function getStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats');
}

export function getPlans(): Promise<Plan[]> {
  return apiFetch<Plan[]>('/admin/plans');
}

export function createPlan(input: Partial<Plan>): Promise<Plan> {
  return apiFetch<Plan>('/admin/plans', { method: 'POST', body: JSON.stringify(input) });
}

export function updatePlan(id: number, input: Partial<Plan>): Promise<Plan> {
  return apiFetch<Plan>(`/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deletePlan(id: number): Promise<{ deleted: true }> {
  return apiFetch(`/admin/plans/${id}`, { method: 'DELETE' });
}

export interface VoucherFilter {
  status?: string;
  planId?: number;
}

export function getVouchers(filter: VoucherFilter = {}): Promise<Voucher[]> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.planId) params.set('planId', String(filter.planId));
  const qs = params.toString();
  return apiFetch<Voucher[]>(`/admin/vouchers${qs ? `?${qs}` : ''}`);
}

export function createVouchers(input: {
  planId: number;
  quantity?: number;
  customerId?: number;
}): Promise<Voucher | Voucher[]> {
  return apiFetch('/admin/vouchers', { method: 'POST', body: JSON.stringify(input) });
}

export function patchVoucher(
  id: number,
  input: { action: 'disable' | 'enable' | 'extend'; additionalDays?: number },
): Promise<Voucher> {
  return apiFetch<Voucher>(`/admin/vouchers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export interface PaymentFilter {
  status?: string;
  from?: string;
  to?: string;
}

export function getPayments(
  filter: PaymentFilter = {},
): Promise<{ payments: AdminPaymentRow[]; total: number }> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.from) params.set('from', filter.from);
  if (filter.to) params.set('to', filter.to);
  const qs = params.toString();
  return apiFetch(`/admin/payments${qs ? `?${qs}` : ''}`);
}

export function getSessions(
  status: 'live' | 'all' = 'live',
): Promise<{ sessions: SessionRow[]; total: number }> {
  return apiFetch(`/admin/sessions?status=${status}`);
}

export interface CustomerRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  voucherCount: number;
  totalPaidNaira: number;
}

export function getCustomers(): Promise<{ customers: CustomerRow[]; total: number }> {
  return apiFetch('/admin/customers');
}

export function getReminderCounts(): Promise<{
  trialUpsellPending: number;
  paymentReminderPending: number;
}> {
  return apiFetch('/admin/customers/reminder-counts');
}

export function notifyTrialUpsell(): Promise<{ notified: number }> {
  return apiFetch('/admin/customers/notify-trial-upsell', { method: 'POST' });
}

export function notifyFailedPayments(): Promise<{ notified: number }> {
  return apiFetch('/admin/customers/notify-failed-payments', { method: 'POST' });
}

export interface NasRow {
  id: number;
  nasname: string;
  shortname: string | null;
  type: string | null;
  description: string | null;
}

export interface CambiumBackhaulStatus {
  configured: boolean;
  rssiDbm: number | null;
  connectionStatus: string | null;
  ssid: string | null;
}

export interface TopBandwidthUser {
  code: string;
  totalMb: number;
}

export interface ManagedDeviceLink {
  name: string;
  url: string;
}

export interface AccessPointInfo {
  name: string;
  ssid: string;
  ipAddress: string;
  macAddress: string;
}

export interface NetworkOverview {
  nas: NasRow[];
  dailyUsage: { date: string; totalMb: number }[];
  totalDataAllTimeMb: number;
  cambiumBackhaul: CambiumBackhaulStatus;
  topBandwidthUsers: TopBandwidthUser[];
  managedDevices: ManagedDeviceLink[];
  knownAccessPoints: AccessPointInfo[];
}

export function getNetworkOverview(): Promise<NetworkOverview> {
  return apiFetch('/admin/network');
}

export interface AdminSettings {
  adminEmail: string | null;
  radiusInvertOctets: boolean;
  corsOrigins: string[];
  ntfyConfigured: boolean;
  pushConfigured: boolean;
}

export function getSettings(): Promise<AdminSettings> {
  return apiFetch('/admin/settings');
}

export interface AdminUserRow {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: string;
}

export function getAdmins(): Promise<AdminUserRow[]> {
  return apiFetch('/admin/admins');
}

export function createAdmin(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AdminUserRow> {
  return apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(input) });
}

export function setAdminActive(id: number, active: boolean): Promise<AdminUserRow> {
  return apiFetch(`/admin/admins/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
}

export interface WaitlistRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  locationNote: string | null;
  source: 'form' | 'import';
  confirmationSentAt: string | null;
  notifiedAt: string | null;
  createdAt: string;
}

export function getWaitlist(): Promise<WaitlistRow[]> {
  return apiFetch('/admin/waitlist');
}

export interface TrialFeedbackRow {
  id: number;
  voucherCode: string | null;
  signalQuality: 'excellent' | 'good' | 'weak' | 'no_connection' | null;
  wouldBuy: 'yes' | 'maybe' | 'no' | null;
  locationNote: string | null;
  comments: string | null;
  createdAt: string;
}

export function getTrialFeedback(): Promise<TrialFeedbackRow[]> {
  return apiFetch('/admin/trial-feedback');
}

export function notifyWaitlistLaunch(): Promise<{ notified: number }> {
  return apiFetch('/admin/waitlist/notify', { method: 'POST' });
}

export interface WaitlistImportSummary {
  added: number;
  skipped: number;
  errors: string[];
}

export async function importWaitlistCsv(file: File): Promise<WaitlistImportSummary> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/admin/waitlist/import`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

export function notifyImportedWaitlistSignups(): Promise<{ notified: number }> {
  return apiFetch('/admin/waitlist/notify-imported', { method: 'POST' });
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  tags: string[];
  time: number;
}

export function getNotifications(): Promise<AdminNotification[]> {
  return apiFetch('/admin/notifications');
}

export interface SupportTicket {
  id: number;
  customerName: string;
  customerEmail: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export function getSupportTickets(): Promise<SupportTicket[]> {
  return apiFetch('/admin/support-tickets');
}

export function updateSupportTicket(
  id: number,
  input: { status?: 'open' | 'resolved'; priority?: 'low' | 'medium' | 'high' },
): Promise<SupportTicket> {
  return apiFetch(`/admin/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export interface BlockedMac {
  id: number;
  macAddress: string;
  reason: string | null;
  blockedByAdminId: number | null;
  createdAt: string;
}

export function getBlockedMacs(): Promise<BlockedMac[]> {
  return apiFetch('/admin/blocked-macs');
}

export function blockMac(
  macAddress: string,
  reason?: string,
): Promise<BlockedMac & { disabledVoucherCount: number }> {
  return apiFetch('/admin/blocked-macs', {
    method: 'POST',
    body: JSON.stringify({ macAddress, reason }),
  });
}

export function unblockMac(id: number): Promise<{ unblocked: true }> {
  return apiFetch(`/admin/blocked-macs/${id}`, { method: 'DELETE' });
}

export interface AuditLogEntry {
  id: number;
  adminEmail: string;
  adminId: number | null;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: string;
}

export function getAuditLog(): Promise<{ entries: AuditLogEntry[]; total: number }> {
  return apiFetch('/admin/audit-log');
}

export function subscribeAdminPush(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ subscribed: true }> {
  return apiFetch('/admin/push/subscribe', { method: 'POST', body: JSON.stringify(input) });
}

export interface DisconnectResult {
  attempted: boolean;
  success: boolean;
  message: string;
}

export function disconnectVoucher(code: string): Promise<DisconnectResult> {
  return apiFetch(`/admin/vouchers/${encodeURIComponent(code)}/disconnect`, { method: 'POST' });
}

export { ApiError };

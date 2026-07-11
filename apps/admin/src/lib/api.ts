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

export { ApiError };

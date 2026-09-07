const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
/** Server-only (no NEXT_PUBLIC_ prefix, so it never reaches the browser bundle). */
const INTERNAL_API_URL = process.env.API_INTERNAL_URL;

/**
 * Server Components must not fetch the API through its public hostname. This app runs on the
 * same host as the API (`network_mode: host`), so a public-URL fetch leaves the box, crosses
 * Cloudflare and comes back — measured at **1.28s vs 1.7ms** on localhost, which was the entire
 * reason the buy page took ~1s to render (two sequential fetches ≈ two round trips).
 * The browser still needs the public URL, hence the split.
 */
function apiBase(): string {
  return typeof window === 'undefined' && INTERNAL_API_URL ? INTERNAL_API_URL : PUBLIC_API_URL;
}

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

export interface InitializePaymentResult {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  amountNaira: number;
  voucherCode?: string;
  planName?: string;
  expiresAt?: string | null;
}

export interface VoucherStatus {
  code: string;
  status: 'unused' | 'active' | 'expired' | 'disabled';
  planName: string;
  expiresAt: string | null;
  activatedAt: string | null;
  sessionTimeoutSeconds: number | null;
  connectedElsewhere: boolean;
  currentSession: { ipAddress: string | null; dataUsedMb: number } | null;
}

export interface VoucherNotification {
  id: number;
  voucherCode: string;
  title: string;
  body: string;
  sentAt: string;
}

export function getVoucherNotifications(code: string): Promise<VoucherNotification[]> {
  return apiFetch(`/vouchers/${encodeURIComponent(code)}/notifications`);
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
    throw new ApiError(message ?? `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

export function getPublicPlans(): Promise<Plan[]> {
  return apiFetch<Plan[]>('/plans/public');
}

export function initializePayment(input: {
  planId: number;
  fullName: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
}): Promise<InitializePaymentResult> {
  return apiFetch<InitializePaymentResult>('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getPaymentStatus(reference: string): Promise<PaymentStatus> {
  return apiFetch<PaymentStatus>(`/payments/${encodeURIComponent(reference)}/status`);
}

export function getVoucherStatus(code: string): Promise<VoucherStatus> {
  return apiFetch<VoucherStatus>(`/vouchers/${encodeURIComponent(code)}/status`);
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  voucherCode?: string;
  /** Used at checkout, before a voucher exists, so an abandoned payment can be nudged. */
  paymentReference?: string;
}

export function subscribePush(input: PushSubscriptionInput): Promise<{ subscribed: true }> {
  return apiFetch('/push/subscribe', { method: 'POST', body: JSON.stringify(input) });
}

export interface RequestTrialCodeInput {
  fullName: string;
  email: string;
  phone: string;
  locationNote: string;
}

export function getTrialAvailability(): Promise<{ available: boolean }> {
  return apiFetch('/trial/availability');
}

/** Admin-editable copy (announcement banner, trial-paused note, etc). Keys come from
 * SITE_SETTING_FIELDS on the API side; a key that's never been set comes back as ''. */
export type SiteSettings = Record<string, string>;

export function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch('/site-settings');
}

export function requestTrialCode(input: RequestTrialCodeInput): Promise<{ sent: true }> {
  return apiFetch('/trial/request-code', { method: 'POST', body: JSON.stringify(input) });
}

export function verifyTrialCode(email: string, code: string): Promise<{ code: string }> {
  return apiFetch('/trial/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export interface WaitlistSurvey {
  description?: string;
  workplace?: string;
  area?: string;
  hostelName?: string;
  houseNumber?: string;
  landmark?: string;
  walkingDistance?: string;
  mainUse?: string[];
  hoursDaily?: string;
  devices?: string;
  networks?: string[];
  challenges?: string[];
  monthlySubscriptionRange?: string;
  hourlyInterest?: string;
  voucherTypes?: string[];
  isBusinessInquiry?: boolean;
  businessDeviceCount?: string;
  bandwidthPreference?: string;
  referralCount?: string;
  wouldRefer?: string;
  readyImmediately?: string;
  wantsUpdates?: boolean;
  notes?: string;
}

export function joinWaitlist(input: {
  name?: string;
  phone?: string;
  email?: string;
  locationNote?: string;
  survey?: WaitlistSurvey;
}): Promise<{ joined: true }> {
  return apiFetch<{ joined: true }>('/waitlist', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function sendSupportContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ sent: true }> {
  return apiFetch<{ sent: true }>('/support/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface TrialFeedbackInput {
  signalQuality?: 'excellent' | 'good' | 'weak' | 'no_connection';
  wouldBuy?: 'yes' | 'maybe' | 'no';
  locationNote?: string;
  comments?: string;
}

export function submitTrialFeedback(code: string, input: TrialFeedbackInput): Promise<{ submitted: true }> {
  return apiFetch<{ submitted: true }>(`/trial/feedback/${encodeURIComponent(code)}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { ApiError };

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
  const res = await fetch(`${API_URL}${path}`, {
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
  email: string;
  phone?: string;
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

export function claimTrial(phone: string): Promise<{ code: string }> {
  return apiFetch<{ code: string }>('/trial', {
    method: 'POST',
    body: JSON.stringify({ phone }),
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

export { ApiError };

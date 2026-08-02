const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

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

export interface Plan {
  id: number;
  name: string;
  planType: 'hourly' | 'monthly';
  priceNaira: number;
  durationHours: number | null;
  validityDays: number | null;
  simultaneousUse: number;
  active: boolean;
}

export function getPublicPlans(): Promise<Plan[]> {
  return apiFetch<Plan[]>('/plans/public');
}

export function joinWaitlist(input: {
  name?: string;
  phone?: string;
  email?: string;
  locationNote?: string;
}): Promise<{ joined: true }> {
  return apiFetch<{ joined: true }>('/waitlist', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { ApiError };

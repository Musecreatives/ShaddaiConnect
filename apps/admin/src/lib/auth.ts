import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/**
 * Server Components don't automatically forward the browser's cookies to a cross-origin
 * fetch — read them explicitly via next/headers and attach as a Cookie header. Used at the
 * top of the (protected) layout so every admin page redirects to /login if the session is
 * missing or expired, without needing per-page checks.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) redirect('/login');
  return res.json();
}

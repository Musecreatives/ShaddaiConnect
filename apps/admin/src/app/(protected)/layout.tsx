import { AdminShell } from '@/components/AdminShell';
import { requireAdmin } from '@/lib/auth';

/** Server-side, so use the internal address — the public hostname routes out through Cloudflare
 * and back to reach an API on this same host, which added ~1.3s to every admin page load. */
const API_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [{ email }, apiHealthy] = await Promise.all([requireAdmin(), checkApiHealth()]);

  return (
    <AdminShell email={email} apiHealthy={apiHealthy}>
      {children}
    </AdminShell>
  );
}

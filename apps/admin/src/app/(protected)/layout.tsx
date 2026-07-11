import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { requireAdmin } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar email={email} apiHealthy={apiHealthy} />
        <main className="flex-1 bg-page p-7">{children}</main>
      </div>
    </div>
  );
}

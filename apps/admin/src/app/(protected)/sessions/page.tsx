import { SessionsClient } from '@/components/SessionsClient';
import { getSessionsServer } from '@/lib/server-api';

export default async function SessionsPage() {
  const { sessions, total } = await getSessionsServer('live');
  return <SessionsClient initialSessions={sessions} initialTotal={total} />;
}

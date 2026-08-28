import { AuditLogClient } from '@/components/AuditLogClient';
import { getAuditLogServer } from '@/lib/server-api';

export default async function AuditLogPage() {
  const { entries, total } = await getAuditLogServer();
  return <AuditLogClient initialEntries={entries} initialTotal={total} />;
}

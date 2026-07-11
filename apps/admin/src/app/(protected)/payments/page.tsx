import { PaymentsClient } from '@/components/PaymentsClient';
import { getPaymentsServer } from '@/lib/server-api';

export default async function PaymentsPage() {
  const { payments, total } = await getPaymentsServer();
  return <PaymentsClient initialPayments={payments} total={total} />;
}

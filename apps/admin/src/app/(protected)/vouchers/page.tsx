import { VouchersClient } from '@/components/VouchersClient';
import { getPlansServer, getVouchersServer } from '@/lib/server-api';

export default async function VouchersPage() {
  const [vouchers, plans] = await Promise.all([getVouchersServer(), getPlansServer()]);
  return <VouchersClient initialVouchers={vouchers} plans={plans} />;
}

import { CustomersTable } from '@/components/CustomersTable';
import { getCustomersServer } from '@/lib/server-api';

export default async function CustomersPage() {
  const { customers, total } = await getCustomersServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-muted">{total} total, from purchases and manual entries.</p>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}

import { NotifyCustomersButton } from '@/components/NotifyCustomersButton';
import { CustomersTable } from '@/components/CustomersTable';
import { getCustomersServer, getReminderCountsServer } from '@/lib/server-api';

export default async function CustomersPage() {
  const [{ customers, total }, reminderCounts] = await Promise.all([
    getCustomersServer(),
    getReminderCountsServer(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Customers</h1>
          <p className="mt-1 text-sm text-muted">{total} total, from purchases and manual entries.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NotifyCustomersButton
            pendingCount={reminderCounts.trialUpsellPending}
            label="Nudge trial-only"
            confirmText={`Email ${reminderCounts.trialUpsellPending} trial-only customer(s) about paid plans? Each gets this once.`}
            kind="trialUpsell"
          />
          <NotifyCustomersButton
            pendingCount={reminderCounts.paymentReminderPending}
            label="Nudge failed payments"
            confirmText={`Email ${reminderCounts.paymentReminderPending} customer(s) with a failed payment? Each gets this once.`}
            kind="failedPayments"
          />
        </div>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}

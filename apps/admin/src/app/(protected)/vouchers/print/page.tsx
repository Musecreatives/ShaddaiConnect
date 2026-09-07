import { PrintBatch } from '@/components/PrintBatch';
import type { Voucher } from '@/lib/api';
import { getSiteSettingsServer, getVouchersServer } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

/**
 * Printable voucher sheet. Takes `?ids=1,2,3` and loads that batch server-side, so a sheet can be
 * re-opened, bookmarked or shared — the earlier version read the batch from sessionStorage, which
 * meant a refresh (or printing from another tab) lost it. That's a poor fit for something you
 * print, run out of card stock halfway through, and need to print again.
 *
 * The sessionStorage path is kept as a fallback so an in-flight "create batch → print" flow from
 * an older tab still works.
 */
export default async function PrintBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;

  let vouchers: Voucher[] | null = null;
  if (ids && /^\d+(,\d+)*$/.test(ids)) {
    try {
      vouchers = await getVouchersServer({ ids });
    } catch {
      vouchers = [];
    }
  }

  // Printed on every card. Fail-soft: a missing support number just omits that part of the
  // footer rather than blocking the print.
  let supportPhone: string | undefined;
  try {
    const settings = await getSiteSettingsServer();
    supportPhone = settings.values.support_phone || undefined;
  } catch {
    /* leave undefined */
  }

  return <PrintBatch initialVouchers={vouchers} supportPhone={supportPhone} />;
}

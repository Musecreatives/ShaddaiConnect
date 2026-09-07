import { redirect } from 'next/navigation';
import { SuccessPoller } from '@/components/SuccessPoller';

export default async function SuccessPage({
  searchParams,
}: {
  // Flutterwave appends `?status=...&tx_ref=...&transaction_id=...` on redirect — `tx_ref` is
  // our own reference, the equivalent of what Paystack used to send back as `?reference=`.
  searchParams: Promise<{ tx_ref?: string | string[] }>;
}) {
  const { tx_ref: rawReference } = await searchParams;
  // Defensive: a repeated query key parses as an array — take the first value rather than let
  // it flow into a broken multi-value lookup downstream.
  const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;
  if (!reference) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <SuccessPoller reference={reference} />
    </main>
  );
}

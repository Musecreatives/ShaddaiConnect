import { redirect } from 'next/navigation';
import { SuccessPoller } from '@/components/SuccessPoller';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>;
}) {
  const { reference: rawReference } = await searchParams;
  // Defensive: a repeated query key (e.g. `?reference=X&reference=X`) parses as an array —
  // take the first value rather than let it flow into a broken multi-value lookup downstream.
  const reference = Array.isArray(rawReference) ? rawReference[0] : rawReference;
  if (!reference) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <SuccessPoller reference={reference} />
    </main>
  );
}

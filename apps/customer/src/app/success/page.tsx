import { redirect } from 'next/navigation';
import { SuccessPoller } from '@/components/SuccessPoller';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  if (!reference) redirect('/');

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <SuccessPoller reference={reference} />
    </main>
  );
}

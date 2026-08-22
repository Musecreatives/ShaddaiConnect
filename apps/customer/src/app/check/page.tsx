import { BackLink } from '@/components/BackLink';
import { BuyShell } from '@/components/BuyShell';
import { CheckVoucherForm } from '@/components/CheckVoucherForm';

export default async function CheckVoucherPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <BuyShell>
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6 lg:flex-none lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-sm">
      <BackLink href="/" label="Back to plans" />
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Check your voucher</h1>
        <p className="mt-1 text-sm text-muted">Enter the code from your ticket.</p>
      </div>
      <CheckVoucherForm initialCode={code} />
    </main>
    </BuyShell>
  );
}

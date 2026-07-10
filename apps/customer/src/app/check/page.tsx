import Link from 'next/link';
import { CheckVoucherForm } from '@/components/CheckVoucherForm';

export default function CheckVoucherPage() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <Link href="/" className="text-sm text-cyan-deep underline">
        ← Back to plans
      </Link>
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Check your voucher</h1>
        <p className="mt-1 text-sm text-muted">Enter the code from your ticket.</p>
      </div>
      <CheckVoucherForm />
    </main>
  );
}

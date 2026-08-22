import { TrialFeedbackForm } from '@/components/TrialFeedbackForm';

export default async function TrialFeedbackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">How was your free trial?</h1>
        <p className="mt-1 text-sm text-muted">
          Coverage is still being rolled out — this tells us exactly where to expand next. Takes
          under a minute.
        </p>
      </div>
      <TrialFeedbackForm code={code} />
    </main>
  );
}

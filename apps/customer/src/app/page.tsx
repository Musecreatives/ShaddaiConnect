import { Badge, PlanCard } from '@shaddai/ui';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-4 p-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Shaddai WiFi</h1>
      <p className="text-sm text-muted">Phase 0 scaffold — packages/ui wiring check.</p>
      <PlanCard name="1 Hour" meta="1 device" priceNaira={200} selected />
      <PlanCard name="30 Days" meta="Up to 3 devices" priceNaira={4000} popular />
      <div className="flex gap-2">
        <Badge status="unused" />
        <Badge status="active" />
        <Badge status="expired" />
        <Badge status="disabled" />
      </div>
    </main>
  );
}

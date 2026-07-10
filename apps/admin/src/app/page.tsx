import { Badge } from '@shaddai/ui';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Shaddai Admin</h1>
      <p className="text-sm text-muted">Phase 0 scaffold — packages/ui wiring check.</p>
      <div className="flex gap-2">
        <Badge status="unused" />
        <Badge status="active" />
        <Badge status="expired" />
        <Badge status="disabled" />
      </div>
    </main>
  );
}

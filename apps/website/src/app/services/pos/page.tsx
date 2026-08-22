import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';

export const metadata = { title: 'POS & Business Tools — Shaddai Communications' };

export default function PosServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="POS & business tools"
      title="A digital till for tracking sales and stock"
      icon={SERVICE_ICONS.pos}
      description="A simple digital point-of-sale for tracking sales, stock, and daily takings — built for shops and small businesses around the estate."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for a POS portal for my business."
      features={[
        { title: 'Sales tracking', body: 'Every sale recorded automatically — no more end-of-day guesswork.' },
        { title: 'Stock management', body: 'Know what you have, what’s running low, and what’s selling.' },
        { title: 'Daily takings', body: 'A clear daily summary of what came in, ready whenever you need it.' },
      ]}
    />
  );
}

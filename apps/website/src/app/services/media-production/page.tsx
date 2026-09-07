import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export const metadata = { title: 'Media Production — Shaddai Communications' };

export default function MediaProductionServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Media production"
      title="Podcast studio setup and motion graphics"
      imageSrc="/images/services/media-production.jpg"
      description="Podcast and recording studio setup — acoustic treatment, mic and interface configuration — plus motion graphics and video editing for your content."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for media production (podcast studio / motion graphics)."
      features={[
        { title: 'Podcast studio setup', body: 'Mic, interface, and acoustic treatment configured so your recordings actually sound clean.' },
        { title: 'Motion graphics', body: 'Animated intros, lower-thirds, and social-ready video edits for your content.' },
        { title: 'Ongoing production', body: 'Recurring editing and post-production support if you\'re publishing regularly.' },
      ]}
    />
  );
}

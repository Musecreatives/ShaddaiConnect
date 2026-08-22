import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';

export const metadata = { title: 'Website Development — Shaddai Communications' };

export default function WebsiteDevelopmentServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Website development"
      title="A professional website, built and hosted for you"
      icon={SERVICE_ICONS['website-development']}
      description="For your shop, school, church, or business — designed, built, and hosted for you. No technical know-how needed on your end."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for a website for my business."
      features={[
        { title: 'Custom design', body: 'Built around what your business actually needs, not a generic template.' },
        { title: 'Fully hosted', body: 'We handle hosting, domain setup, and keeping it online — one less thing for you to manage.' },
        { title: 'Mobile-friendly', body: 'Looks right on any phone or screen, since that’s how most of your visitors will find you.' },
      ]}
    />
  );
}

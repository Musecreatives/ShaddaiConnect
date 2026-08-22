import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';

const STARLINK_REFERRAL_URL = 'https://starlink.com/residential?referral=RC-DF-13407982-87554-9';

export const metadata = { title: 'Starlink Installation — Shaddai Communications' };

export default function StarlinkServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Satellite internet"
      title="Get Starlink installed — 1 month free"
      icon={SERVICE_ICONS.starlink}
      description="Want unlimited, high-speed satellite internet at home or your business? We handle the full setup — hardware, mounting, cabling, and configuration."
      ctaLabel="Get Starlink installed"
      quoteMessage="Hi, I'd like to get Starlink installed."
      primaryHref={STARLINK_REFERRAL_URL}
      stats={[
        { value: '200+', label: 'Mbps average speeds' },
        { value: '1 mo', label: 'Free with referral' },
        { value: '24hr', label: 'Install turnaround' },
      ]}
      features={[
        { title: 'Professional dish mounting', body: 'Correct alignment and secure mounting, indoors or outdoors, done right the first time.' },
        { title: 'Cable routing & configuration', body: 'Clean cable runs and full network setup so it just works from day one.' },
        { title: 'Referral signup', body: 'Sign up through our referral link and get your first month free.' },
      ]}
    />
  );
}

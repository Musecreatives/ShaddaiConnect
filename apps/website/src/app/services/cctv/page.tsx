import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';

export const metadata = { title: 'CCTV Installation — Shaddai Communications' };

export default function CctvServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="CCTV installation"
      title="Secure your home or business"
      icon={SERVICE_ICONS.cctv}
      description="Professional CCTV camera installation for homes, shops, offices, and estates. We handle site survey, camera placement, wiring, DVR/NVR setup, and mobile app configuration so you can monitor from anywhere."
      tags={['Indoor & outdoor cameras', 'Night vision', 'Remote monitoring', 'Motion alerts']}
      ctaLabel="Get a free site survey"
      quoteMessage="Hi, I'd like a free CCTV site survey."
      features={[
        { title: 'Site survey', body: 'We visit your property to plan camera placement and confirm coverage before any work begins.' },
        { title: 'Full installation', body: 'Camera mounting, wiring, and DVR/NVR setup included in the quote — no separate installer to find.' },
        { title: 'Remote monitoring', body: 'Mobile app configuration so you can check in on your property from anywhere.' },
      ]}
    />
  );
}

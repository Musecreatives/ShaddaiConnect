import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export const metadata = { title: 'Networking Services — Shaddai Communications' };

export default function NetworkingServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Networking services"
      title="Satellite internet and CCTV, installed properly"
      imageSrc="/images/services/starlink.jpg"
      description="Starlink installation for fast, unlimited satellite internet, and CCTV installation for homes, shops, and offices — the two things that keep a home or business connected and secure."
      tags={['Indoor & outdoor cameras', 'Night vision', 'Remote monitoring', 'Motion alerts']}
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for Starlink installation and/or CCTV."
      features={[
        { title: 'Professional dish mounting', body: 'Correct alignment and secure mounting, indoors or outdoors, done right the first time.' },
        { title: 'Cable routing & configuration', body: 'Clean cable runs and full network setup so your Starlink connection just works from day one. Sign up through our referral link for a free first month.' },
        { title: 'CCTV site survey', body: 'We visit your property to plan camera placement and confirm coverage before any work begins.' },
        { title: 'CCTV installation', body: 'Camera mounting, wiring, and DVR/NVR setup included in the quote — no separate installer to find.' },
        { title: 'Remote monitoring', body: 'Mobile app configuration for your cameras so you can check in on your property from anywhere.' },
      ]}
    />
  );
}

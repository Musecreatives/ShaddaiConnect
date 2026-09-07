import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export const metadata = { title: 'Brand Identity — Shaddai Communications' };

export default function BrandIdentityServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Brand identity"
      title="Look professional from day one"
      imageSrc="/images/services/brand-identity.jpg"
      description="Logo design, brand guidelines, and business cards — a cohesive visual identity that makes your business look established, not improvised."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for brand identity design for my business."
      features={[
        { title: 'Logo design', body: 'A distinct mark that works everywhere — signage, packaging, social media, print.' },
        { title: 'Brand guidelines', body: 'Colors, fonts, and usage rules so your brand stays consistent across everything you make.' },
        { title: 'Business cards & print', body: 'Print-ready materials that match your new identity, delivered alongside the files.' },
      ]}
    />
  );
}

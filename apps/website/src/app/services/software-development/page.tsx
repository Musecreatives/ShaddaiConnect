import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';

export const metadata = { title: 'Software Development — Shaddai Communications' };

export default function SoftwareDevelopmentServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Software development"
      title="Custom tools built around how you actually work"
      icon={SERVICE_ICONS['software-development']}
      description="Apps, management systems, and automation tools tailored to your business — web and mobile, not off-the-shelf software you have to bend around."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for custom software for my business."
      features={[
        { title: 'Custom apps', body: 'Web or mobile, built for exactly what your business needs to do.' },
        { title: 'Management systems', body: 'Track inventory, staff, customers, or operations in one place instead of spreadsheets.' },
        { title: 'Automation', body: 'Remove repetitive manual work with tools that do it for you.' },
      ]}
    />
  );
}

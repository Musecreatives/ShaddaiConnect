import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export const metadata = { title: 'Software Development — Shaddai Communications' };

export default function SoftwareDevelopmentServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Software development"
      title="Websites and custom software, built around how you work"
      imageSrc="/images/services/software-development.jpg"
      description="A professional website, or custom apps and management tools tailored to your business — web and mobile, fully hosted, not off-the-shelf software you have to bend around."
      ctaLabel="Get a quote"
      quoteMessage="Hi, I'd like a quote for a website or custom software for my business."
      features={[
        { title: 'Custom website design', body: 'Built around what your business actually needs, not a generic template.' },
        { title: 'Fully hosted', body: 'We handle hosting, domain setup, and keeping it online — one less thing for you to manage.' },
        { title: 'Mobile-friendly', body: 'Looks right on any phone or screen, since that\'s how most of your visitors will find you.' },
        { title: 'Custom apps', body: 'Web or mobile, built for exactly what your business needs to do.' },
        { title: 'Management systems', body: 'Track inventory, staff, customers, or operations in one place instead of spreadsheets.' },
        { title: 'Automation', body: 'Remove repetitive manual work with tools that do it for you.' },
      ]}
    />
  );
}

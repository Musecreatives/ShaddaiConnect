import { ServicePageTemplate } from '@/components/ServicePageTemplate';

export const metadata = { title: 'Musical Training — Shaddai Communications' };

export default function MusicalTrainingServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Musical training"
      title="Learn an instrument, taught properly"
      imageSrc="/images/services/musical-training.jpg"
      description="One-on-one and group lessons for piano, guitar, and voice — for beginners and returning players alike, taught by people who actually perform."
      ctaLabel="Book a lesson"
      quoteMessage="Hi, I'd like to book a musical training lesson."
      features={[
        { title: 'One-on-one lessons', body: 'Paced to you, whether you\'re starting from zero or picking a skill back up.' },
        { title: 'Group classes', body: 'Learn alongside others at a similar level, at a lower cost per session.' },
        { title: 'Instrument guidance', body: 'Advice on what to practice on at home, without overspending on gear you don\'t need yet.' },
      ]}
    />
  );
}

import { ServicePageTemplate } from '@/components/ServicePageTemplate';
import { SERVICE_ICONS } from '@/components/ServiceVisual';
import { COVERAGE_AREAS, COVERAGE_LANDMARKS } from '@/lib/coverage';

const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL ?? 'https://buy.shaddaicommunications.com';

export const metadata = { title: 'Community WiFi — Shaddai Communications' };

export default function WifiServicePage() {
  return (
    <ServicePageTemplate
      eyebrow="Community WiFi"
      title="Fast, affordable internet for the estate"
      icon={SERVICE_ICONS.wifi}
      description="No contracts, no fibre wait — buy a time-based voucher and you're online in under a minute. One of several ways Shaddai keeps Ugbowo BDPA Estate running, not the only one."
      tags={[...COVERAGE_AREAS, ...COVERAGE_LANDMARKS]}
      ctaLabel="Buy a voucher"
      quoteMessage="Hi, I have a question about Shaddai WiFi."
      primaryHref={BUY_URL}
      features={[
        {
          title: 'Pay as you go',
          body: 'Hourly and monthly vouchers — pay only for the time you need, no lock-in contract.',
        },
        {
          title: 'Instant activation',
          body: 'Vouchers activate the moment payment clears. No app to install, no account to create.',
        },
        {
          title: 'Built for the estate',
          body: 'A local community network, not a national ISP — support that actually knows your street.',
        },
      ]}
    />
  );
}

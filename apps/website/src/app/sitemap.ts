import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.shaddaicommunications.com';

const SERVICE_SLUGS = [
  'wifi',
  'starlink',
  'cctv',
  'brand-identity',
  'website-development',
  'software-development',
  'pos',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

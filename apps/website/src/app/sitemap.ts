import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/journal';
import { PROJECTS } from '@/lib/landing-data';

const SITE_URL = 'https://www.shaddaicommunications.com';

const SERVICE_SLUGS = [
  'networking',
  'brand-identity',
  'software-development',
  'pos',
  'musical-training',
  'media-production',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getPosts();
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...PROJECTS.map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    { url: `${SITE_URL}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    { url: `${SITE_URL}/audit`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
}

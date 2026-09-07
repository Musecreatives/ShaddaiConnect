import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { CATEGORIES, PROJECTS } from '@/lib/landing-data';

export const metadata = { title: 'Our Work — Shaddai Communications' };

const CATEGORY_IMAGE: Record<string, string> = {
  Networking: '/images/services/starlink.jpg',
  Software: '/images/services/software-development.jpg',
  Brand: '/images/services/brand-identity.jpg',
  Media: '/images/services/media-production.jpg',
};

export default function WorkIndexPage() {
  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-navy px-6 py-22 sm:px-16">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-normal leading-[1.02] text-white">
            Selected work
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-lg leading-relaxed text-white/55">
            A handful of the projects we&apos;ve worked on. Case studies are being written up as we go
            — some entries below are placeholders until then.
          </p>
        </div>
      </section>

      <section className="bg-page px-6 py-16 dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-9 flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full border border-line bg-surface px-4.5 py-2.5 font-sans text-sm font-semibold text-ink dark:border-line-dark dark:bg-surface-dark dark:text-white/85"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="group overflow-hidden rounded-frame border border-line bg-surface transition-colors hover:border-brand-blue/40 dark:border-line-dark dark:bg-surface-dark"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={CATEGORY_IMAGE[project.category]}
                    alt={project.category}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-lg font-bold text-ink dark:text-white">{project.name}</h3>
                  <p className="mt-1.5 font-sans text-sm text-muted dark:text-white/50">{project.scope}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

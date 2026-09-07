import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { PROJECTS } from '@/lib/landing-data';

const CATEGORY_IMAGE: Record<string, string> = {
  Networking: '/images/services/starlink.jpg',
  Software: '/images/services/software-development.jpg',
  Brand: '/images/services/brand-identity.jpg',
  Media: '/images/services/media-production.jpg',
};

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  return { title: project ? `${project.name} — Shaddai Communications` : 'Our Work' };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-navy px-6 pt-14 sm:px-16">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/work"
            className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4.5 py-2.5 font-sans text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            ‹ All work
          </Link>
          <h1 className="max-w-[22ch] font-display text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.05] text-white">
            {project.name}
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-lg leading-relaxed text-white/55">{project.scope}</p>
          <div className="relative mt-11 aspect-21/9 w-full overflow-hidden rounded-t-[20px]">
            <Image src={CATEGORY_IMAGE[project.category]} alt={project.category} fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-[#FBFCFD] px-6 py-20 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-5xl gap-14 sm:grid-cols-[1fr_320px] sm:items-start">
          <div className="flex flex-col gap-9">
            <div>
              <h2 className="mb-3.5 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">The brief</h2>
              <p className="font-sans text-lg leading-relaxed text-ink dark:text-white/80">{project.brief}</p>
            </div>
            <div>
              <h2 className="mb-3.5 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Our approach</h2>
              <p className="font-sans text-lg leading-relaxed text-ink dark:text-white/80">{project.approach}</p>
            </div>
            <div>
              <h2 className="mb-3.5 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Outcome</h2>
              <p className="font-sans text-lg leading-relaxed text-ink dark:text-white/80">{project.outcome}</p>
            </div>
          </div>
          <aside className="rounded-frame border border-line bg-surface p-8 dark:border-line-dark dark:bg-surface-dark">
            {project.facts.map((f) => (
              <div key={f.k} className="border-b border-line py-3.5 last:border-0 dark:border-line-dark">
                <div className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/40">{f.k}</div>
                <div className="font-sans text-[15px] font-semibold text-ink dark:text-white">{f.v}</div>
              </div>
            ))}
            <Link
              href="/contact"
              className="mt-6 block rounded-full bg-navy py-3.5 text-center font-sans text-sm font-bold text-white transition-colors hover:bg-brand-blue"
            >
              Discuss a similar project
            </Link>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

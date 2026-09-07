import Link from 'next/link';
import { PlaceholderVisual } from '@/components/PlaceholderVisual';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getCategoryNames, getPosts } from '@/lib/journal';

export const metadata = { title: 'Journal — Shaddai Communications' };

export default async function JournalIndexPage() {
  const [{ posts }, categories] = await Promise.all([getPosts(), getCategoryNames()]);
  const [featured, ...rest] = posts;

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-navy px-6 py-22 text-center sm:px-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-light">
            The Shaddai Journal
          </div>
          <h1 className="font-display text-[clamp(2.2rem,5.2vw,3.6rem)] font-normal leading-[1.05] text-white">
            Notes on the setups we install and support
          </h1>
        </div>
      </section>

      {featured && (
        <section className="grid grid-cols-1 bg-[#EEF4F8] dark:bg-surface-dark sm:grid-cols-2">
          <PlaceholderVisual className="min-h-[320px] w-full" label="Featured post image — pending" />
          <div className="flex flex-col justify-center px-8 py-14 sm:px-14">
            <div className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">{featured.tag}</div>
            <h2 className="mb-3 font-sans text-2xl font-bold leading-snug text-ink dark:text-white sm:text-[2rem]">
              {featured.title}
            </h2>
            <div className="mb-4 font-sans text-sm text-muted dark:text-white/50">{featured.date}</div>
            <p className="mb-6 max-w-md font-sans text-lg leading-relaxed text-muted dark:text-white/60">{featured.excerpt}</p>
            <Link href={`/journal/${featured.slug}`} className="self-start font-sans text-sm font-bold uppercase tracking-wide text-brand-blue hover:text-navy dark:hover:text-white">
              Read more →
            </Link>
          </div>
        </section>
      )}

      <section className="bg-page px-6 py-18 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-11 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-row flex-wrap gap-2.5 sm:flex-col sm:gap-2.5">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-[#E8F2F8] px-4.5 py-3 font-sans text-sm font-semibold text-ink dark:bg-surface-dark dark:text-white/85"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`} className="group block">
                <PlaceholderVisual className="mb-4 aspect-video w-full rounded-frame" />
                <div className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-brand-blue">{post.tag}</div>
                <h3 className="mb-1.5 font-sans text-lg font-bold text-ink group-hover:text-brand-blue dark:text-white">
                  {post.title}
                </h3>
                <div className="font-sans text-sm text-muted dark:text-white/45">{post.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

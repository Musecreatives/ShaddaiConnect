import { notFound } from 'next/navigation';
import { PlaceholderVisual } from '@/components/PlaceholderVisual';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getPostBySlug } from '@/lib/journal';
import { SHARES, TOC_PLACEHOLDER } from '@/lib/landing-data';
import { MarkdownLite } from '@/lib/markdown-lite';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);
  return { title: result ? `${result.post.title} — Shaddai Journal` : 'Journal' };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);
  if (!result) notFound();
  const { post } = result;
  const hasBody = Boolean(post.body?.trim());

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <PlaceholderVisual className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center" label="Post header image — pending">
        <div className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">{post.tag}</div>
        <h1 className="mx-auto max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-normal leading-[1.08] text-ink dark:text-white">
          {post.title}
        </h1>
        <div className="mt-3 font-sans text-sm text-muted dark:text-white/50">{post.date}</div>
      </PlaceholderVisual>

      <section className="bg-surface px-6 py-18 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-5xl gap-14 sm:grid-cols-[1fr_280px] sm:items-start">
          <div className="flex flex-col gap-5">
            {post.excerpt && <p className="font-sans text-lg leading-relaxed text-ink dark:text-white/85">{post.excerpt}</p>}
            {hasBody ? (
              <MarkdownLite body={post.body!} />
            ) : (
              <p className="font-sans text-lg leading-relaxed text-muted dark:text-white/60">
                The full write-up for this post is still being drafted. Once published from the
                admin Journal editor, this paragraph is replaced with the real article body.
              </p>
            )}
          </div>
          <aside className="flex flex-col gap-7">
            <div className="rounded-frame bg-[#EAF2F6] p-7 dark:bg-surface-dark">
              <div className="mb-4 font-sans text-base font-bold text-ink dark:text-white">On this page</div>
              {TOC_PLACEHOLDER.map((t) => (
                <div key={t} className="py-2 font-sans text-[15px] text-muted dark:text-white/55">
                  {t}
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="mb-3.5 font-sans text-sm font-semibold text-muted dark:text-white/50">Share</div>
              <div className="flex justify-center gap-2.5">
                {SHARES.map((s) => (
                  <span
                    key={s}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-sans text-xs font-bold text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { PlaceholderVisual } from '@/components/PlaceholderVisual';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { getPosts } from '@/lib/journal';
import { CLIENTS, PROJECTS, SERVICES, TESTIMONIALS, VALUES } from '@/lib/landing-data';
import { getSiteSettings } from '@/lib/site-settings';

const DEFAULT_HERO_SUBTEXT =
  'Shaddai designs, installs and supports the networking, branding, software, and media systems homes and businesses in Ugbowo BDPA Estate actually run on.';

const CATEGORY_IMAGE: Record<string, string> = {
  Networking: '/images/services/starlink.jpg',
  Software: '/images/services/software-development.jpg',
  Brand: '/images/services/brand-identity.jpg',
  Media: '/images/services/media-production.jpg',
};

export default async function Home() {
  const [settings, { posts }] = await Promise.all([getSiteSettings(), getPosts()]);
  const heroSubtext = settings.website_hero_subtext?.trim() || DEFAULT_HERO_SUBTEXT;
  const featuredProjects = PROJECTS.slice(0, 4);
  const featuredPosts = posts.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-linear-to-b from-navy to-[#0a3a58] pt-20 pb-0">
        <div className="relative mx-auto max-w-5xl px-6 sm:px-16">
          <h1 className="animate-fade-slide-in mx-auto max-w-[16ch] text-center font-display text-[clamp(2.75rem,7vw,4.5rem)] font-normal leading-[0.98] text-white text-balance">
            Everything your home and business runs on.
          </h1>

          <div
            className="animate-fade-slide-in mx-auto mt-11 max-w-2xl rounded-frame bg-white p-9 text-center sm:p-10"
            style={{ animationDelay: '80ms' }}
          >
            <p className="text-[clamp(1.05rem,1.6vw,1.35rem)] font-medium leading-relaxed text-[#123B55]">
              {heroSubtext}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <Link
                href="/services"
                className="rounded-full bg-navy px-8 py-4 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue"
              >
                See all services →
              </Link>
              <Link
                href="/work"
                className="rounded-full border border-line bg-page px-8 py-4 text-[15px] font-bold text-navy transition-colors hover:border-brand-blue-light hover:bg-brand-blue-light"
              >
                View our work
              </Link>
            </div>
          </div>
        </div>

        <div
          className="animate-fade-slide-in relative mx-auto mt-14 aspect-21/9 w-full max-w-5xl overflow-hidden rounded-t-[20px]"
          style={{ animationDelay: '140ms' }}
        >
          <Image
            src="/images/landing/hero-satellite.jpg"
            alt="Satellite dish installation — Shaddai's networking and Starlink work"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-navy/70 via-navy/10 to-transparent" />
        </div>
      </section>

      {/* ============ TRUSTED BY ============ */}
      <section className="bg-navy py-9">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-8 px-6 sm:px-16">
          <span className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-brand-blue-light">
            Selected work
          </span>
          {CLIENTS.map((client) => (
            <div key={client.name} className="flex h-14 w-32 items-center justify-center rounded-frame bg-white p-3">
              <Image
                src={client.image}
                alt={client.name}
                width={110}
                height={40}
                className="max-h-8 w-auto object-contain"
              />
            </div>
          ))}
          <span className="font-sans text-sm font-semibold text-white/55">
            + Synkk Africa, and Shaddai&apos;s own media brands
          </span>
        </div>
      </section>

      {/* ============ POSITIONING STATEMENT ============ */}
      <section className="bg-page px-6 py-24 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-14 sm:grid-cols-2">
          <h2 className="text-balance font-display text-[clamp(2rem,4.2vw,3.4rem)] font-normal leading-[1.06] text-ink dark:text-white">
            Most homes and businesses don&apos;t have one big problem. <em>They have six small ones, handled by six different vendors.</em>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-lg font-medium leading-relaxed text-muted dark:text-white/60">
              A network installer, a graphic designer, a developer, a POS vendor, a music tutor, a video guy — each one only sees their own slice, and nobody is coordinating the whole picture.
            </p>
            <p className="font-sans text-lg font-medium leading-relaxed text-muted dark:text-white/60">
              Shaddai runs those six disciplines as one team, out of one place, in Ugbowo BDPA Estate — so a project stays coordinated from first conversation to delivery.
            </p>
            <p className="font-sans text-lg font-medium leading-relaxed text-muted dark:text-white/60">
              No long contracts, no call centre. You deal directly with the people doing the work.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 w-full max-w-6xl text-center">
          <div className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-muted dark:text-white/40">
            What we stand for
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.name} className="rounded-frame border border-line bg-surface p-6 text-left dark:border-line-dark dark:bg-surface-dark">
                <div className="mb-2 font-display text-lg font-normal text-ink dark:text-white">{v.name}</div>
                <p className="font-sans text-sm leading-relaxed text-muted dark:text-white/55">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="scroll-mt-6 border-t border-line bg-[#FBFCFD] px-6 py-24 dark:border-line-dark dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-14 sm:grid-cols-[300px_1fr] sm:items-start">
          <div className="sm:sticky sm:top-28">
            <div className="mb-2 font-display text-xl italic text-brand-blue">Our Services</div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.06] text-ink dark:text-white">
              What we help you achieve
            </h2>
            <p className="mt-4 font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
              Six disciplines, engaged individually or together.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative overflow-hidden rounded-frame border border-line bg-surface p-8 transition-colors hover:border-brand-blue/40 dark:border-line-dark dark:bg-surface-dark"
              >
                <div className="pointer-events-none absolute right-6 top-2 font-display text-[7rem] leading-[0.8] text-brand-blue-light/30 dark:text-white/[0.06]">
                  {service.num}
                </div>
                <h3 className="relative max-w-[70%] font-display text-2xl font-normal text-ink dark:text-white sm:text-3xl">
                  {service.title}
                </h3>
                <p className="relative mt-2.5 max-w-lg font-sans text-[15px] leading-relaxed text-muted dark:text-white/50">
                  {service.blurb}
                </p>
                <ul className="relative mt-5 flex flex-col overflow-hidden rounded-lg bg-navy sm:max-w-xs">
                  {service.items.map((item) => (
                    <li key={item} className="border-b border-white/10 px-4 py-3 font-sans text-sm font-semibold text-white/90 last:border-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WORK HIGHLIGHTS ============ */}
      <section className="border-t border-line bg-navy px-6 py-24 sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-3 font-display text-xl italic text-brand-blue-light">Our Work</div>
          <h2 className="mb-2 font-display text-[clamp(2rem,4.4vw,3.6rem)] font-normal leading-[1.04] text-white">
            Highlights from our portfolio
          </h2>
          <p className="mb-12 font-sans text-[17px] leading-relaxed text-white/55">
            Selected engagements across networking, software, brand, and media work.
          </p>
          <div className="grid gap-7 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="group block overflow-hidden rounded-frame border border-white/10 bg-[#0E1E28] transition-colors hover:border-brand-blue-light/60"
              >
                <div className="relative aspect-3/2 w-full overflow-hidden">
                  <Image
                    src={CATEGORY_IMAGE[project.category]}
                    alt={project.category}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-xl font-bold text-white">{project.name}</h3>
                  <p className="mt-1.5 font-sans text-sm text-white/55">{project.scope}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/work"
            className="mt-9 block w-full rounded-full bg-linear-to-r from-brand-blue to-brand-blue-light py-6 text-center font-sans text-[17px] font-bold text-navy transition-opacity hover:opacity-90"
          >
            See more →
          </Link>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-page px-6 py-24 dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-12 text-center font-display text-[clamp(1.9rem,3.6vw,3rem)] font-normal leading-[1.1] text-ink dark:text-white">
            Our clients on our work
          </h2>
          <TestimonialCarousel quotes={TESTIMONIALS} />
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="bg-page px-6 pb-24 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-9 rounded-[22px] bg-linear-to-br from-navy to-brand-blue p-9 sm:grid-cols-2 sm:p-14">
          <div>
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-normal leading-[1.08] text-white">
              Let&apos;s get your setup right.
            </h2>
            <p className="mt-3.5 max-w-md font-sans text-[17px] leading-relaxed text-white/85">
              Tell us what you&apos;re working with, and we&apos;ll tell you plainly what it takes to fix it.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-block rounded-full bg-white px-8 py-4 text-[15px] font-bold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              Get in touch
            </Link>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/landing/cta-network.jpg"
              alt="Networking hardware Shaddai installs and configures"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 480px, 100vw"
            />
          </div>
        </div>
      </section>

      {/* ============ JOURNAL TEASER ============ */}
      <section className="border-t border-line bg-[#FBFCFD] px-6 py-24 dark:border-line-dark dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-normal leading-[1.08] text-ink dark:text-white">
                From the journal
              </h2>
              <p className="mt-2 font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
                Notes on the setups we install and support.
              </p>
            </div>
            <Link href="/journal" className="font-sans text-sm font-bold text-brand-blue hover:text-navy dark:hover:text-white">
              View all →
            </Link>
          </div>
          <div className="grid gap-7 sm:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`} className="group block">
                <PlaceholderVisual className="mb-4 aspect-video w-full rounded-frame" />
                <div className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-brand-blue">{post.tag}</div>
                <h3 className="font-sans text-lg font-bold text-ink group-hover:text-brand-blue dark:text-white">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

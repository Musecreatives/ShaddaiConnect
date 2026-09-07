import Image from 'next/image';

/** Real photography for each service's hero visual — downloaded into public/images/services/
 * (Unsplash License, free for commercial use) rather than hotlinked, so the site doesn't depend
 * on an external CDN staying up. Plain string src (not a static import) since these live under
 * public/, which Next.js serves by URL rather than treating as an importable module. */
export function ServiceVisual({ imageSrc, alt }: { imageSrc: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-frame border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <Image src={imageSrc} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 384px, 100vw" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,20,32,.55), transparent 55%)' }}
      />
    </div>
  );
}

/**
 * Deliberately not a full markdown implementation or a dependency (marked/remark) — just the
 * subset the admin post editor's toolbar (PostEditorClient.tsx) actually produces: bold, italic,
 * inline code, links, headings, lists, images, blockquotes. Renders straight to React elements
 * (no dangerouslySetInnerHTML), so there's no HTML-injection surface to sanitize even though
 * post bodies are admin-authored, not public-submitted.
 */

const INLINE_TOKEN = /(\*\*.+?\*\*|\*.+?\*|`.+?`|!\[.*?\]\(.*?\)|\[.+?\]\(.+?\))/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(INLINE_TOKEN).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-[#E8F2F8] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-surface-dark">
          {part.slice(1, -1)}
        </code>
      );
    }
    const image = /^!\[(.*?)\]\((.*?)\)$/.exec(part);
    if (image) {
      // eslint-disable-next-line @next/next/no-img-element -- inline body content, arbitrary admin-uploaded origin
      return <img key={key} src={image[2]} alt={image[1]} className="my-2 inline-block max-w-full rounded-frame align-middle" />;
    }
    const link = /^\[(.+?)\]\((.+?)\)$/.exec(part);
    if (link) {
      return (
        <a key={key} href={link[2]} className="font-bold text-brand-blue underline hover:text-navy dark:hover:text-white">
          {link[1]}
        </a>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function MarkdownLite({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim());

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim());
        const key = `block-${i}`;

        if (lines[0].startsWith('### ')) {
          return (
            <h3 key={key} className="font-sans text-xl font-bold text-ink dark:text-white">
              {renderInline(lines.join(' ').replace(/^###\s+/, ''), key)}
            </h3>
          );
        }
        if (lines[0].startsWith('## ')) {
          return (
            <h2 key={key} className="font-sans text-2xl font-bold text-ink dark:text-white">
              {renderInline(lines.join(' ').replace(/^##\s+/, ''), key)}
            </h2>
          );
        }
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-6 font-sans text-lg leading-relaxed text-muted dark:text-white/60">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^[-*]\s+/, ''), `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <ol key={key} className="list-decimal space-y-1.5 pl-6 font-sans text-lg leading-relaxed text-muted dark:text-white/60">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\.\s+/, ''), `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        if (lines.every((l) => l.startsWith('> '))) {
          return (
            <blockquote
              key={key}
              className="rounded-2xl bg-navy px-9 py-11 text-center font-display text-2xl font-normal leading-snug text-white"
            >
              {renderInline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '), key)}
            </blockquote>
          );
        }
        const soloImage = /^!\[.*?\]\(.*?\)$/.test(block.trim());
        if (soloImage) {
          return (
            <div key={key} className="text-center">
              {renderInline(block.trim(), key)}
            </div>
          );
        }

        return (
          <p key={key} className="font-sans text-lg leading-relaxed text-muted dark:text-white/60">
            {renderInline(lines.join(' '), key)}
          </p>
        );
      })}
    </>
  );
}

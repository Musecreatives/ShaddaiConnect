'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import {
  ApiError,
  createPost,
  deletePost,
  updatePost,
  uploadMedia,
  type Category,
  type Post,
  type PostStatus,
} from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const STATUSES: { value: PostStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Renders in one of two modes: `post` present = editing an existing row, absent = the /new
 * route creating one. Both share this component rather than a separate "create" screen since
 * the form is identical either way. */
export function PostEditorClient({ post, categories }: { post?: Post; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft');
  const [categoryId, setCategoryId] = useState<number | ''>(post?.categoryId ?? '');
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [authorName, setAuthorName] = useState(post?.authorName ?? '');
  const [publishAt, setPublishAt] = useState(post?.publishAt ? post.publishAt.slice(0, 16) : '');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? '');
  const [uploading, setUploading] = useState(false);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  /** Wraps/replaces the current textarea selection, then restores focus and puts the cursor
   * after the inserted text — the toolbar buttons below (matching the imported design's B / I /
   * H2 / H3 / list / link / code row) all funnel through this rather than each hand-rolling
   * selection math. Renders back out via MarkdownLite on the public site (apps/website/src/lib/
   * markdown-lite.tsx) — a small hand-written subset, not a markdown library, since this toolbar
   * is the only thing that ever needs to produce it. */
  function applyToSelection(transform: (selected: string) => string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const replacement = transform(body.slice(start, end));
    const next = body.slice(0, start) + replacement + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + replacement.length;
    });
  }

  function wrapWith(marker: string, placeholder: string) {
    applyToSelection((s) => `${marker}${s || placeholder}${marker}`);
  }

  function prefixLines(prefix: string | ((i: number) => string), placeholder: string) {
    applyToSelection((s) => {
      const lines = (s || placeholder).split('\n');
      return lines.map((line, i) => `${typeof prefix === 'function' ? prefix(i) : prefix}${line}`).join('\n');
    });
  }

  function insertLink() {
    const url = window.prompt('Link URL');
    if (!url) return;
    applyToSelection((s) => `[${s || 'link text'}](${url})`);
  }

  async function insertBodyImage(file: File | undefined) {
    if (!file) return;
    setBodyImageUploading(true);
    try {
      const asset = await uploadMedia(file);
      applyToSelection(() => `![${file.name.replace(/\.[^.]+$/, '')}](${asset.path})`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not upload image.');
    } finally {
      setBodyImageUploading(false);
    }
  }

  async function handleImageSelect(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file);
      setFeaturedImage(asset.path);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !slug.trim() || !body.trim()) {
      toast('Title, slug and body are required.');
      return;
    }
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        body,
        status,
        categoryId: categoryId === '' ? null : categoryId,
        featuredImage: featuredImage || null,
        featured,
        authorName: authorName.trim() || null,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
      };
      if (post) {
        await updatePost(post.id, input);
        toast('Post saved.', 'success');
      } else {
        const created = await createPost(input);
        toast('Post created.', 'success');
        router.push(`/journal/${created.id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not save post.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    const ok = await confirm(`Delete "${post.title}"? This cannot be undone.`, { danger: true });
    if (!ok) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      toast('Post deleted.', 'success');
      router.push('/journal');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not delete post.');
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/journal"
          className="rounded-btn border border-line px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-blue"
        >
          ‹ All posts
        </Link>
        <h1 className="font-display text-xl font-bold text-ink">{post ? 'Edit post' : 'New post'}</h1>
        <div className="ml-auto flex gap-2">
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-btn border border-line px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:border-danger disabled:opacity-40"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-btn bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Title</span>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[17px] font-semibold outline-none focus:border-brand-blue"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Slug</span>
            <div className="flex items-center rounded-btn border-[1.5px] border-line px-4 focus-within:border-brand-blue">
              <span className="font-mono text-[13px] text-muted">/journal/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                className="flex-1 py-3 font-mono text-sm outline-none"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between text-sm font-semibold text-ink">
              Excerpt <span className="text-[11px] font-normal text-muted">180 characters max</span>
            </span>
            <textarea
              rows={2}
              value={excerpt}
              maxLength={180}
              onChange={(e) => setExcerpt(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-brand-blue"
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Body</span>
            <div className="flex flex-wrap gap-1.5 rounded-t-btn border-[1.5px] border-b-0 border-line bg-page px-2.5 py-2">
              <button type="button" title="Bold" onClick={() => wrapWith('**', 'bold text')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                B
              </button>
              <button type="button" title="Italic" onClick={() => wrapWith('*', 'italic text')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold italic text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                I
              </button>
              <button type="button" title="Heading 2" onClick={() => prefixLines('## ', 'Heading')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                H2
              </button>
              <button type="button" title="Heading 3" onClick={() => prefixLines('### ', 'Heading')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                H3
              </button>
              <button type="button" title="Bulleted list" onClick={() => prefixLines('- ', 'List item')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                • List
              </button>
              <button type="button" title="Numbered list" onClick={() => prefixLines((i) => `${i + 1}. `, 'List item')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                1. List
              </button>
              <button type="button" title="Quote" onClick={() => prefixLines('> ', 'Quote')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                “ ”
              </button>
              <button type="button" title="Link" onClick={insertLink} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                Link
              </button>
              <button
                type="button"
                title="Image"
                disabled={bodyImageUploading}
                onClick={() => bodyImageInputRef.current?.click()}
                className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-40"
              >
                {bodyImageUploading ? '…' : 'Image'}
              </button>
              <input
                ref={bodyImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  insertBodyImage(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button type="button" title="Code" onClick={() => wrapWith('`', 'code')} className="min-w-8.5 rounded-btn border border-line bg-surface px-2.5 py-1.5 font-mono text-[13px] font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue">
                Code
              </button>
            </div>
            <textarea
              ref={bodyRef}
              rows={16}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the post here. Leave a blank line between paragraphs."
              className="rounded-b-btn border-[1.5px] border-line px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
            <div className="font-display text-base font-bold text-ink">Publishing</div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand-blue"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            {status === 'scheduled' && (
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted">
                Publish date
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand-blue"
                />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted">
              Author
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Shaddai Editorial"
                className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand-blue"
              />
            </label>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4.5 w-4.5 accent-brand-blue"
              />
              Feature at top of Journal
            </label>
          </div>

          <div className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
            <div className="font-display text-base font-bold text-ink">Featured image</div>
            {featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin tool, arbitrary uploaded origin
              <img
                src={`${API_ORIGIN}${featuredImage}`}
                alt=""
                className="aspect-video w-full rounded-btn border-[1.5px] border-line object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-btn border-[1.5px] border-dashed border-line text-xs text-muted">
                No image selected
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
              className="text-sm text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-brand-blue/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-blue"
            />
            {uploading && <span className="text-xs text-muted">Uploading…</span>}
          </div>

          <div className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
            <div className="font-display text-base font-bold text-ink">Category</div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand-blue"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

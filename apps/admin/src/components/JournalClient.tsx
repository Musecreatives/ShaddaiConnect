'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { ApiError, deletePost, type Post, type PostStatus } from '@/lib/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Draft',
  review: 'In review',
  scheduled: 'Scheduled',
  published: 'Published',
};

const STATUS_CLASS: Record<PostStatus, string> = {
  published: 'bg-[#E1EFF8] text-[#0A5A8C]',
  draft: 'bg-[#EEF2F5] text-muted',
  scheduled: 'bg-[#E6EDF2] text-ink',
  review: 'bg-[#F1E6D8] text-[#8A551C]',
};

const FILTERS = ['All', 'Published', 'Draft', 'Scheduled', 'In review'] as const;

export function JournalClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  const stats = useMemo(
    () => ({
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
      review: posts.filter((p) => p.status === 'review').length,
    }),
    [posts],
  );

  const shown = posts.filter((p) => {
    if (filter !== 'All' && STATUS_LABEL[p.status] !== filter) return false;
    if (search && !`${p.title} ${p.slug}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleDelete(post: Post) {
    const ok = await confirm(`Delete "${post.title}"? This cannot be undone.`, { danger: true });
    if (!ok) return;
    setBusyId(post.id);
    try {
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast('Post deleted.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not delete post.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Journal posts</h1>
          <p className="mt-1 text-sm text-muted">
            Everything published to shaddaicommunications.com/journal. Drafts stay invisible to
            the public site until scheduled or published.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="ml-auto rounded-btn bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
        >
          + New post
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['Published', stats.published],
            ['Drafts', stats.draft],
            ['Scheduled', stats.scheduled],
            ['In review', stats.review],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-card border border-line bg-surface p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
            <div className="mt-1.5 font-display text-2xl font-bold text-ink">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or slug…"
            className="min-w-[200px] flex-1 rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                  filter === f ? 'border-brand-blue text-brand-blue-deep' : 'border-line text-muted hover:border-brand-blue/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {shown.map((post) => (
                <tr key={post.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/journal/${post.id}`} className="font-semibold text-ink hover:text-brand-blue-deep">
                      {post.title}
                    </Link>
                    <div className="mt-0.5 font-mono text-[12px] text-muted">/journal/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_CLASS[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{post.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/journal/${post.id}`}
                        className="rounded-btn border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === post.id}
                        onClick={() => handleDelete(post)}
                        className="rounded-btn border border-line px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:border-danger disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                    No posts match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

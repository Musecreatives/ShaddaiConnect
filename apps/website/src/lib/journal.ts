import { CATEGORIES, POSTS, type Post as DummyPost } from './landing-data';

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface RemoteCategory {
  id: number;
  name: string;
  slug: string;
}

export interface RemotePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featured: boolean;
  featuredImage: string | null;
  authorName: string | null;
  publishAt: string | null;
  createdAt: string;
  category: RemoteCategory | null;
}

/** Every journal fetch fails soft to the bundled placeholder content (landing-data.ts) — the
 * CMS tables (`posts`/`categories`) may not exist yet on a given environment until the manual
 * migration (apps/api/prisma/manual-migrations/2026-09-06-add-journal-cms.sql) has been applied,
 * and even once they do, an empty Journal shouldn't blank the page. */
async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toDisplayPost(post: RemotePost): DummyPost {
  return {
    slug: post.slug,
    tag: post.category?.name ?? 'Journal',
    title: post.title,
    date: post.publishAt
      ? new Date(post.publishAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
    excerpt: post.excerpt ?? '',
  };
}

export async function getPosts(): Promise<{ posts: DummyPost[]; isLive: boolean }> {
  const remote = await fetchJson<RemotePost[]>('/journal/posts');
  if (remote && remote.length > 0) return { posts: remote.map(toDisplayPost), isLive: true };
  return { posts: POSTS, isLive: false };
}

export async function getCategoryNames(): Promise<string[]> {
  const remote = await fetchJson<RemoteCategory[]>('/journal/categories');
  if (remote && remote.length > 0) return ['All', ...remote.map((c) => c.name)];
  return CATEGORIES;
}

/** Full post detail — falls back to the dummy body copy (about-page-style "still being drafted"
 * paragraph) for a slug that only exists in the bundled placeholder set. */
export async function getPostBySlug(slug: string): Promise<{ post: DummyPost & { body?: string }; isLive: boolean } | null> {
  const remote = await fetchJson<RemotePost>(`/journal/posts/${encodeURIComponent(slug)}`);
  if (remote) return { post: { ...toDisplayPost(remote), body: remote.body }, isLive: true };
  const dummy = POSTS.find((p) => p.slug === slug);
  if (!dummy) return null;
  return { post: dummy, isLive: false };
}

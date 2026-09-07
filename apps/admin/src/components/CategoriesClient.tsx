'use client';

import { useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { ApiError, createCategory, deleteCategory, updateCategory, type Category } from '@/lib/api';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setCreating(true);
    try {
      const category = await createCategory({ name: name.trim(), slug: slug.trim() });
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setSlug('');
      setSlugTouched(false);
      toast('Category added.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not add category.');
    } finally {
      setCreating(false);
    }
  }

  function startRename(category: Category) {
    setRenamingId(category.id);
    setRenameValue(category.name);
  }

  async function handleRename(category: Category) {
    if (!renameValue.trim() || renameValue.trim() === category.name) {
      setRenamingId(null);
      return;
    }
    setBusyId(category.id);
    try {
      const updated = await updateCategory(category.id, { name: renameValue.trim() });
      setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
      toast('Category renamed.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not rename category.');
    } finally {
      setBusyId(null);
      setRenamingId(null);
    }
  }

  async function handleDelete(category: Category) {
    const ok = await confirm(
      `Delete "${category.name}"? Posts in this category will keep their content but show no category.`,
      { danger: true },
    );
    if (!ok) return;
    setBusyId(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast('Category deleted.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not delete category.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Categories &amp; tags</h1>
        <p className="mt-1 text-sm text-muted">
          Categories drive the filter rail on the public Journal. Keep the list short — five or
          fewer.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_320px] sm:items-start">
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3.5 border-b border-line px-5 py-4 last:border-0">
              <div className="min-w-0 flex-1">
                {renamingId === category.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(category)}
                    onBlur={() => handleRename(category)}
                    className="rounded-btn border-[1.5px] border-brand-blue px-2.5 py-1.5 text-sm font-bold outline-none"
                  />
                ) : (
                  <div className="font-display text-base font-bold text-ink">{category.name}</div>
                )}
                <div className="mt-0.5 font-mono text-[12px] text-muted">
                  /journal/{category.slug} · {category._count?.posts ?? 0} posts
                </div>
              </div>
              <button
                type="button"
                disabled={busyId === category.id}
                onClick={() => startRename(category)}
                className="rounded-btn border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-blue disabled:opacity-40"
              >
                Rename
              </button>
              <button
                type="button"
                disabled={busyId === category.id}
                onClick={() => handleDelete(category)}
                className="rounded-btn border border-line px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:border-danger disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted">No categories yet.</div>
          )}
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
          <div className="font-display text-base font-bold text-ink">Add a category</div>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Name"
            className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="slug"
            className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-btn bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue disabled:opacity-40"
          >
            {creating ? 'Adding…' : 'Add category'}
          </button>
        </form>
      </div>
    </div>
  );
}

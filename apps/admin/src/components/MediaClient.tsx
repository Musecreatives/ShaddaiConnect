'use client';

import { useRef, useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { ApiError, deleteMedia, uploadMedia, type MediaAsset } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

function formatSize(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}

export function MediaClient({ initialMedia }: { initialMedia: MediaAsset[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();
  const toast = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadMedia(file);
        setMedia((prev) => [asset, ...prev]);
      }
      toast(files.length > 1 ? `${files.length} files uploaded.` : 'File uploaded.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not upload file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(asset: MediaAsset) {
    const ok = await confirm(`Delete "${asset.filename}"? This cannot be undone.`, { danger: true });
    if (!ok) return;
    setBusyId(asset.id);
    try {
      await deleteMedia(asset.id);
      setMedia((prev) => prev.filter((m) => m.id !== asset.id));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not delete file.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Media library</h1>
          <p className="mt-1 text-sm text-muted">
            Upload once, reuse across posts and pages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="ml-auto rounded-btn bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue disabled:opacity-40"
        >
          {uploading ? 'Uploading…' : 'Upload files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-card border-2 border-dashed p-9 text-center transition-colors ${
          dragOver ? 'border-brand-blue bg-brand-blue/5' : 'border-line bg-surface'
        }`}
      >
        <div className="font-display text-base font-bold text-ink">Drop files here</div>
        <div className="mt-1.5 text-sm text-muted">JPG, PNG or WebP · up to 5 MB each</div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {media.map((asset) => (
          <div key={asset.id} className="group relative overflow-hidden rounded-card border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin tool, arbitrary uploaded origin */}
            <img src={`${API_ORIGIN}${asset.path}`} alt="" className="aspect-4/3 w-full object-cover" />
            <div className="p-3">
              <div className="truncate font-mono text-[12px] font-semibold text-ink">{asset.filename}</div>
              <div className="text-[11px] text-muted">{formatSize(asset.size)}</div>
            </div>
            <button
              type="button"
              disabled={busyId === asset.id}
              onClick={() => handleDelete(asset)}
              className="absolute right-2 top-2 rounded-btn bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-40"
            >
              Delete
            </button>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-muted">No files uploaded yet.</div>
        )}
      </div>
    </div>
  );
}

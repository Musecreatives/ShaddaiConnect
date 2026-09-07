'use client';

import { useState } from 'react';
import { useToast } from '@/components/DialogProvider';
import { ApiError, updateSiteSettings, uploadSiteSettingImage, type SiteSettingsPayload } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
// Uploaded images are served outside the /api prefix (see apps/api/src/main.ts) — strip it back
// off to get the origin a relative /uploads/... path resolves against.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Fields group into cards by key prefix rather than a separate backend grouping concept — the
 * full field list (SITE_SETTING_FIELDS in the API) is still the single source of truth for what
 * exists; this just decides which card a key's row renders under. */
const GROUPS: { title: string; note: string; match: (key: string) => boolean }[] = [
  {
    title: 'Buy site',
    note: 'Copy shown on the voucher buy site and printed on voucher cards.',
    match: (key) => !key.startsWith('website_'),
  },
  {
    title: 'Marketing site',
    note: 'Copy and imagery shown on shaddaicommunications.com.',
    match: (key) => key.startsWith('website_'),
  },
  {
    title: 'Social links',
    note: 'Shown as icons in the marketing site footer. Leave a field blank to hide that icon entirely — nothing fake is shown in its place.',
    match: (key) => key.startsWith('social_'),
  },
];

/** Renders itself from the field definitions the API returns, so adding editable copy is a
 * server-side change only — no edit needed here. */
export function SiteSettingsForm({ initial }: { initial: SiteSettingsPayload }) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>(initial.values);
  const [saved, setSaved] = useState<Record<string, string>>(initial.values);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function handleImageSelect(key: string, file: File | undefined) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const { url } = await uploadSiteSettingImage(file);
      setValues((v) => ({ ...v, [key]: url }));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not upload image.');
    } finally {
      setUploadingKey(null);
    }
  }

  const dirtyFields = initial.fields.filter((f) => (values[f.key] ?? '') !== (saved[f.key] ?? ''));
  const dirty = dirtyFields.length > 0;

  function handleDiscard() {
    setValues(saved);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Send only what actually changed, so two admins editing different fields don't clobber
      // each other's work.
      const patch: Record<string, string> = {};
      for (const field of dirtyFields) {
        patch[field.key] = values[field.key] ?? '';
      }
      const next = await updateSiteSettings(patch);
      setValues(next);
      setSaved(next);
      toast('Site content saved.', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not save site content.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      {GROUPS.map((group) => {
        const fields = initial.fields.filter((f) => group.match(f.key));
        if (fields.length === 0) return null;
        return (
          <section key={group.title} className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="border-b border-line bg-page px-5 py-4">
              <h2 className="font-display text-base font-bold text-ink">{group.title}</h2>
              <p className="mt-0.5 text-xs text-muted">{group.note}</p>
            </div>
            {fields.map((field) => {
              const value = values[field.key] ?? '';
              const remaining = field.maxLength - value.length;
              const isImage = field.key.endsWith('_image');
              return (
                <div
                  key={field.key}
                  className="grid grid-cols-1 gap-3 border-b border-line px-5 py-5 last:border-0 sm:grid-cols-[240px_1fr] sm:items-start"
                >
                  <div className="min-w-0">
                    <label htmlFor={field.key} className="text-sm font-bold text-ink">
                      {field.label}
                    </label>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{field.help}</p>
                  </div>
                  <div className="min-w-0">
                    {isImage ? (
                      <div className="flex flex-wrap items-center gap-4">
                        {value ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin tool, arbitrary uploaded origin, not worth next/image config here
                          <img
                            src={`${API_ORIGIN}${value}`}
                            alt=""
                            className="h-20 w-32 rounded-btn border-[1.5px] border-line object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-32 items-center justify-center rounded-btn border-[1.5px] border-dashed border-line text-[11px] text-muted">
                            No image
                          </div>
                        )}
                        <input
                          id={field.key}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => handleImageSelect(field.key, e.target.files?.[0])}
                          disabled={uploadingKey === field.key}
                          className="text-sm text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-brand-blue/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-blue"
                        />
                        {uploadingKey === field.key && <span className="text-xs text-muted">Uploading…</span>}
                      </div>
                    ) : field.multiline ? (
                      <textarea
                        id={field.key}
                        rows={3}
                        value={value}
                        onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        className="w-full rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-brand-blue"
                      />
                    ) : (
                      <input
                        id={field.key}
                        value={value}
                        onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        className="w-full rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
                      />
                    )}
                    {!isImage && (
                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-[11px] ${remaining < 0 ? 'text-danger' : 'text-muted'}`}>
                          {remaining} left
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 shadow-lg">
        <span className="text-sm font-semibold text-muted">
          {dirty ? `${dirtyFields.length} unsaved change${dirtyFields.length === 1 ? '' : 's'}` : 'All changes saved'}
        </span>
        <div className="ml-auto flex gap-2">
          {dirty && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="rounded-btn border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-btn bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

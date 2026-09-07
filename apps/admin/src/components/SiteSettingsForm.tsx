'use client';

import { useState } from 'react';
import { useToast } from '@/components/DialogProvider';
import { ApiError, updateSiteSettings, uploadSiteSettingImage, type SiteSettingsPayload } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
// Uploaded images are served outside the /api prefix (see apps/api/src/main.ts) — strip it back
// off to get the origin a relative /uploads/... path resolves against.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

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

  const dirty = initial.fields.some((f) => (values[f.key] ?? '') !== (saved[f.key] ?? ''));

  async function handleSave() {
    setSaving(true);
    try {
      // Send only what actually changed, so two admins editing different fields don't clobber
      // each other's work.
      const patch: Record<string, string> = {};
      for (const field of initial.fields) {
        if ((values[field.key] ?? '') !== (saved[field.key] ?? '')) {
          patch[field.key] = values[field.key] ?? '';
        }
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
    <div className="flex flex-col gap-5">
      {initial.fields.map((field) => {
        const value = values[field.key] ?? '';
        const remaining = field.maxLength - value.length;
        const isImage = field.key.endsWith('_image');
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={field.key} className="text-sm font-semibold text-ink">
                {field.label}
              </label>
              {!isImage && (
                <span className={`text-[11px] ${remaining < 0 ? 'text-danger' : 'text-muted'}`}>
                  {remaining} left
                </span>
              )}
            </div>
            {isImage ? (
              <div className="flex items-center gap-4">
                {value && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin tool, arbitrary uploaded origin, not worth next/image config here
                  <img
                    src={`${API_ORIGIN}${value}`}
                    alt=""
                    className="h-16 w-16 rounded-btn border-[1.5px] border-line object-cover"
                  />
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
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-brand-blue"
              />
            ) : (
              <input
                id={field.key}
                value={value}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
              />
            )}
            <p className="text-[11px] leading-relaxed text-muted">{field.help}</p>
          </div>
        );
      })}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-btn bg-brand-blue px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {dirty && !saving && <span className="text-xs text-muted">Unsaved changes</span>}
      </div>
    </div>
  );
}

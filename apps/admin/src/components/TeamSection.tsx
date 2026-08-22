'use client';

import { useState } from 'react';
import { ApiError, createAdmin, setAdminActive, type AdminUserRow } from '@/lib/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TeamSection({
  rootEmail,
  initialAdmins,
}: {
  rootEmail: string | null;
  initialAdmins: AdminUserRow[];
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const admin = await createAdmin({ email, password, name: name || undefined });
      setAdmins((prev) => [...prev, admin]);
      setShowForm(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create admin.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(admin: AdminUserRow) {
    setBusyId(admin.id);
    try {
      const updated = await setAdminActive(admin.id, !admin.active);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? updated : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update admin.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-ink">Team</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-semibold text-brand-blue-deep"
        >
          {showForm ? 'Cancel' : '+ Add admin'}
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-sm text-muted">Root (env-configured, always active)</span>
        <span className="font-mono text-sm text-ink">{rootEmail ?? '—'}</span>
      </div>

      {admins.map((admin) => (
        <div
          key={admin.id}
          className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0"
        >
          <div>
            <span className="text-sm text-ink">{admin.name || admin.email}</span>
            <span className="ml-2 text-xs text-muted">{admin.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">Since {formatDate(admin.createdAt)}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                admin.active ? 'bg-success-tint text-success' : 'bg-page text-muted'
              }`}
            >
              {admin.active ? 'Active' : 'Disabled'}
            </span>
            <button
              type="button"
              disabled={busyId === admin.id}
              onClick={() => handleToggleActive(admin)}
              className="text-xs font-semibold text-brand-blue-deep disabled:opacity-40"
            >
              {admin.active ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      ))}

      {admins.length === 0 && !showForm && (
        <div className="px-4 py-6 text-center text-sm text-muted">
          No other admin accounts yet.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-line p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
            <input
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Temporary password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-btn border-[1.5px] border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-btn bg-brand-blue py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            {submitting ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      )}
    </div>
  );
}

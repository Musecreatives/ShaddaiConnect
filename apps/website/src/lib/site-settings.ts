// Same internal-URL pattern as apps/customer and apps/admin's server-api.ts — avoids a slow
// public-URL round trip for server-side fetches (see this project's earlier site-speed work).
const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000/api';

/** Public, unauthenticated — the same content the buy site already reads its editable copy from
 * (apps/api/src/site-settings). Returns '' for anything never set. Never throws: if the API is
 * unreachable, every field just falls back to '' so page components can apply their own hardcoded
 * default text rather than the whole page failing to render. */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_URL}/site-settings`, { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

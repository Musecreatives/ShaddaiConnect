const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * FreeRADIUS `Expiration` (radcheck) expects a date string like "6 Feb 2027 00:00:00",
 * evaluated against the RADIUS server's own wall clock. The live host's MariaDB reports
 * `@@system_time_zone = UTC` (confirmed via `SELECT @@system_time_zone`), and FreeRADIUS runs
 * on the same host per CLAUDE.md, so this formats in UTC regardless of what timezone the API
 * process itself happens to run in (dev machine may be UTC+1 Africa/Lagos; deployed host is
 * UTC) — using local-time getters here would silently shift expiry by the API host's offset.
 */
export function formatRadiusExpiration(date: Date): string {
  const day = date.getUTCDate();
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${day} ${month} ${year} ${hh}:${mm}:${ss}`;
}

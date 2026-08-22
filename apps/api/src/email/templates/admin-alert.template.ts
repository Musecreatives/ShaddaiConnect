import { baseTemplate } from './base.template';

// Message text originates from ntfy publish() calls scattered across the codebase — some of
// which forward user-supplied content (support messages, voucher codes) — so escape before
// interpolating, same as supportContactTemplate.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function adminAlertTemplate(opts: { title: string; message: string }): string {
  const title = escapeHtml(opts.title);
  const message = escapeHtml(opts.message);
  return baseTemplate({
    preheader: title,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">${title}</p>
      <p style="margin:0;white-space:pre-wrap;">${message}</p>
    `,
  });
}

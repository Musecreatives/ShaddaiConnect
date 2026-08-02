import { baseTemplate } from './base.template';

// Message/name/email come straight from an unauthenticated public form — escape before
// interpolating into HTML so a submitted "<script>" or stray markup can't render as live HTML
// in the admin's mail client.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function supportContactTemplate(opts: { name: string; email: string; message: string }): string {
  const name = escapeHtml(opts.name);
  const email = escapeHtml(opts.email);
  const message = escapeHtml(opts.message);
  return baseTemplate({
    preheader: `New contact form message from ${name}`,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">New support message</p>
      <p style="margin:0 0 4px;"><strong>From:</strong> ${name} (${email})</p>
      <div style="margin:16px 0;padding:16px;background:#F3F6FA;border-radius:12px;white-space:pre-wrap;">${message}</div>
    `,
  });
}

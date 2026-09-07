import { baseTemplate, codeChip } from './base.template';

export function voucherTemplate(opts: {
  code: string;
  planName: string;
  expiresAt?: Date | null;
}): string {
  const expiry = opts.expiresAt
    ? new Date(opts.expiresAt).toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;
  return baseTemplate({
    preheader: `Your Shaddai WiFi voucher: ${opts.code}`,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">Your voucher is ready.</p>
      <p style="margin:0 0 8px;">Plan: <strong>${opts.planName}</strong></p>
      ${codeChip(opts.code)}
      <p style="margin:0 0 8px;color:#5B6478;">Enter this code as both username and password on the WiFi login page.</p>
      ${expiry ? `<p style="margin:0;color:#5B6478;">Valid until ${expiry} (WAT).</p>` : ''}
    `,
  });
}

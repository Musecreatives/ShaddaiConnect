// Inline styles only — email clients strip <style> blocks unpredictably (Gmail app, Outlook desktop).
// Logo is referenced by absolute HTTPS URL (not a data URI) — Gmail/Outlook don't reliably render
// embedded/base64 images, but a real hosted URL works everywhere. www.shaddaicommunications.com
// serves the same /logo.png as every app in this monorepo (single source of truth in
// packages/ui/src/assets/, copied into each app's public/ at build time — see DECISIONS.md).
const LOGO_URL = 'https://www.shaddaicommunications.com/logo.png';

export function baseTemplate(opts: { preheader?: string; bodyHtml: string }): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F6FA;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6FA;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E4E8F0;">
        <tr><td style="height:4px;background:linear-gradient(90deg,#2E75C4,#18C7D8);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="background:#0D1B33;padding:26px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img src="${LOGO_URL}" width="36" height="36" alt="Shaddai" style="display:block;border-radius:8px;" />
            </td>
            <td style="vertical-align:middle;">
              <div style="color:#FFFFFF;font-size:15px;font-weight:700;line-height:1.2;">Shaddai Communications</div>
              <div style="color:#8FC1E8;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;margin-top:2px;">Ugbowo BDPA Estate, Benin City</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:30px 28px;color:#0D1321;font-size:15px;line-height:1.65;">
          ${opts.bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #E4E8F0;background:#F9FAFC;color:#5B6478;font-size:12px;line-height:1.6;">
          Shaddai Comm Ventures · Ugbowo BDPA Estate, Benin City<br />
          <a href="mailto:support@shaddaicommunications.com" style="color:#0E9AA8;text-decoration:none;">support@shaddaicommunications.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#2E75C4;color:#FFFFFF;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:13px;font-size:14px;">${label}</a>`;
}

/** Turns a plain-text body (blank line = paragraph break) into the same styled paragraphs every
 * other template uses, wrapped in baseTemplate — the one place the admin Mailer's free-form
 * composer (apps/admin's Mailer page) needs, since admins type plain text there, not HTML. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function plainBodyTemplate(body: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const bodyHtml = paragraphs
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('');
  return baseTemplate({ bodyHtml });
}

export function codeChip(code: string): string {
  return `<div style="background:#0D1B33;border-radius:16px;padding:22px;text-align:center;margin:18px 0;">
    <div style="color:#18C7D8;font-family:'JetBrains Mono',ui-monospace,Consolas,monospace;font-size:24px;letter-spacing:0.08em;font-weight:700;">${code}</div>
  </div>`;
}

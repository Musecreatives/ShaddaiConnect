import { baseTemplate } from './base.template';

// name comes straight from an unauthenticated public form — escape before interpolating into
// HTML so a submitted "<script>" or stray markup can't render as live HTML in the recipient's
// mail client (same pattern as support-contact.template.ts).
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function waitlistConfirmationTemplate(name?: string): string {
  const safeName = name ? escapeHtml(name) : undefined;
  return baseTemplate({
    preheader: "You're on the Shaddai WiFi waitlist",
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">You're on the list${safeName ? `, ${safeName}` : ''}.</p>
      <p style="margin:0 0 12px;">Thanks for your interest in Shaddai Comm Ventures WiFi. We're setting up community hotspot coverage around Ugbowo BDPA Estate, and we'll email you the moment we're live near you.</p>
      <p style="margin:0 0 12px;">In the meantime, check your phone's WiFi list every so often for a network called <strong>"Shaddai WIFI"</strong> — if you can see it, you're already in range. It won't have internet access yet, so it may show as "no internet" until we officially launch, but seeing it there is a good sign.</p>
      <p style="margin:0;color:#5B6478;">Once we're live, everyone on this list gets <strong>20 minutes free</strong> to try it out before buying a voucher. No action needed for now — just sit tight.</p>
    `,
  });
}

// Deliberately NOT using baseTemplate() here — this is the one email most likely to get
// Gmail-classified as Promotions (it's a "buy now" announcement blasted to the whole waitlist
// at once). The branded header/logo/colored-button look is exactly the visual pattern Gmail's
// classifier associates with marketing mail. Kept plain — no logo, no button, a real inline
// text link — so it reads more like a personal note than a newsletter.
export function waitlistLaunchTemplate(opts: { name?: string; buyUrl: string }): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0D1321;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;padding:28px 20px;">
      <tr><td style="font-size:15px;line-height:1.7;">
        <p style="margin:0 0 14px;">Hi${opts.name ? ` ${opts.name}` : ''},</p>
        <p style="margin:0 0 14px;">Shaddai WiFi is live now in Ugbowo BDPA Estate. You signed up for the waitlist a while back, so wanted to let you know directly — you can buy a voucher and get connected today.</p>
        <p style="margin:0 0 14px;">Buy a voucher here: <a href="${opts.buyUrl}" style="color:#0E9AA8;">${opts.buyUrl}</a></p>
        <p style="margin:0 0 14px;">First time? There's a 20-minute free trial on that page before you buy, if you want to try it out first.</p>
        <p style="margin:0;">Thanks for waiting,<br />Shaddai Comm Ventures</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

import { baseTemplate, codeChip } from './base.template';

/**
 * Sent once a free-trial voucher is issued. Separate from voucherTemplate because the trial has
 * no expiry date — its limit is a fixed session length written as a RADIUS Session-Timeout — so
 * the generic "valid until <date>" wording doesn't apply and would read as an error.
 *
 * Matters more than the paid equivalent: a trial code is only shown on screen, so a customer who
 * closes the tab before writing it down has no other copy.
 */
export function trialVoucherTemplate(opts: {
  code: string;
  minutes: number;
  buyUrl?: string;
}): string {
  return baseTemplate({
    preheader: `Your free trial code: ${opts.code}`,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">Your free trial is ready.</p>
      ${codeChip(opts.code)}
      <p style="margin:0 0 8px;">Enter this code as <strong>both the username and password</strong> on the Shaddai WiFi login page.</p>
      <p style="margin:0 0 8px;color:#5B6478;">You get <strong>${opts.minutes} minutes</strong> of browsing from the moment you connect. The clock only starts when you first log in, so there's no rush.</p>
      <p style="margin:0 0 8px;color:#5B6478;">One trial per person. When it runs out, you can buy a plan and stay online.</p>
      ${
        opts.buyUrl
          ? `<p style="margin:16px 0 0;"><a href="${opts.buyUrl}" style="color:#0E9AA8;font-weight:600;">See our plans</a></p>`
          : ''
      }
    `,
  });
}

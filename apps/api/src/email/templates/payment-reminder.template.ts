import { baseTemplate, button } from './base.template';

export function paymentReminderTemplate(opts: { name?: string; buyUrl: string }): string {
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi${opts.name ? ` ${opts.name}` : ''},</p>
    <p style="margin:0 0 14px;">Looks like your last payment for Shaddai WiFi didn't go through — no charge was made. If it was a mistake or a network hiccup on your end, you can try again any time.</p>
    <div style="text-align:center;margin:22px 0;">${button('Try again', opts.buyUrl)}</div>
    <p style="margin:0;">Any trouble, just reply to this email and we'll sort it out.<br />Shaddai Comm Ventures</p>
  `;
  return baseTemplate({ preheader: 'Your last payment did not go through — no charge was made.', bodyHtml });
}

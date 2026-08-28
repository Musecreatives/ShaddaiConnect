import { baseTemplate, button } from './base.template';

export function trialUpsellTemplate(opts: { name?: string; buyUrl: string }): string {
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi${opts.name ? ` ${opts.name}` : ''},</p>
    <p style="margin:0 0 14px;">Hope the free trial gave you a good feel for Shaddai WiFi. Ready for more? Hourly and monthly plans are available any time — no queueing, connect in seconds.</p>
    <div style="text-align:center;margin:22px 0;">${button('Buy a plan', opts.buyUrl)}</div>
    <p style="margin:0;">Questions? Just reply to this email.<br />Shaddai Comm Ventures</p>
  `;
  return baseTemplate({ preheader: 'Your free trial ended — plans start whenever you are ready.', bodyHtml });
}

import { baseTemplate, button } from './base.template';

export function trialFeedbackTemplate(opts: { name?: string; feedbackUrl: string }): string {
  return baseTemplate({
    preheader: 'How was your free trial?',
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">How was your free trial${opts.name ? `, ${opts.name}` : ''}?</p>
      <p style="margin:0 0 20px;">We're still working out where to expand coverage next, and real feedback from people who've actually tried the connection is the best signal we have. It's three quick questions.</p>
      <div style="text-align:center;margin:20px 0;">${button('Give feedback', opts.feedbackUrl)}</div>
      <p style="margin:0;color:#5B6478;">Takes under a minute. Thanks for trying us out.</p>
    `,
  });
}

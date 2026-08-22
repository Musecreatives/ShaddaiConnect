import { baseTemplate } from './base.template';

export function trialVerificationCodeTemplate(code: string): string {
  return baseTemplate({
    preheader: `Your Shaddai WiFi verification code: ${code}`,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">Confirm your free trial</p>
      <p style="margin:0 0 20px;">Enter this code on the free trial page to activate your 20 minutes of free WiFi:</p>
      <p style="margin:0 0 20px;font-family:monospace;font-size:32px;font-weight:700;letter-spacing:0.1em;text-align:center;">${code}</p>
      <p style="margin:0;color:#5B6478;">This code expires in 10 minutes. If you didn't request a free trial, you can ignore this email.</p>
    `,
  });
}

import { baseTemplate } from './base.template';

/**
 * Sent the moment a customer starts checkout, before payment completes — so someone who gets
 * interrupted, loses signal mid-payment, or closes the Flutterwave tab still has a working link in
 * their inbox instead of having to start over.
 *
 * It deliberately says nothing that implies payment succeeded, and tells anyone who has already
 * paid to ignore it: this email and the real voucher email can arrive within seconds of each
 * other, and "your order" wording on both would read as a double charge.
 */
export function checkoutStartedTemplate(opts: {
  planName: string;
  amountNaira: number;
  paymentUrl: string;
}): string {
  const amount = `₦${opts.amountNaira.toLocaleString('en-NG')}`;
  return baseTemplate({
    preheader: `Finish paying for your ${opts.planName} plan`,
    bodyHtml: `
      <p style="font-size:17px;font-weight:700;margin:0 0 12px;">One step left.</p>
      <p style="margin:0 0 8px;">Plan: <strong>${opts.planName}</strong></p>
      <p style="margin:0 0 16px;">Amount: <strong>${amount}</strong></p>
      <p style="margin:0 0 16px;">Your voucher code is issued as soon as payment goes through.</p>
      <p style="margin:0 0 20px;">
        <a href="${opts.paymentUrl}"
           style="display:inline-block;background:#0D1B33;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px;">
          Complete payment
        </a>
      </p>
      <p style="margin:0;color:#5B6478;font-size:13px;">Already paid? You can ignore this — your voucher email is on its way separately.</p>
    `,
  });
}

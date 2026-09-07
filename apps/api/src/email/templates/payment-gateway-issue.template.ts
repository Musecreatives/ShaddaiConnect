import { baseTemplate } from './base.template';

/**
 * Ad-hoc admin-triggered notice — distinct from paymentReminderTemplate (which just says "no
 * charge was made, try again"). This is for when we already know *why* it failed on our end
 * (e.g. the Flutterwave business account pending verification) and telling someone to "just try
 * again" would send them straight back into the same wall. Sent one-off from Admin → Customers,
 * not tied to the automated failed-payment matching CustomersService already does.
 */
export function paymentGatewayIssueTemplate(opts: { name?: string; planName?: string }): string {
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi${opts.name ? ` ${opts.name}` : ''},</p>
    <p style="margin:0 0 14px;">Sorry about this — your attempt to buy${opts.planName ? ` the ${opts.planName} plan` : ' a plan'} didn't go through, and it wasn't anything on your side. Our payment provider is temporarily unable to process card payments while we finish a routine account verification with them. <strong>No charge was made to your card.</strong></p>
    <p style="margin:0 0 14px;">We're on it and expect this to be resolved shortly. We'll email you the moment payments are back up — or if you'd rather not wait, message us on WhatsApp and we can arrange your voucher manually in the meantime.</p>
    <p style="margin:0;">Thanks for your patience.<br />Shaddai Comm Ventures</p>
  `;
  return baseTemplate({
    preheader:
      'Your payment failed because of an issue on our end, not yours — no charge was made.',
    bodyHtml,
  });
}

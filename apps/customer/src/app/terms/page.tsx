import { BackLink } from '@/components/BackLink';

export const metadata = {
  title: 'Terms & Acceptable Use — Shaddai WiFi',
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <BackLink href="/" label="Back to plans" />

      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          Terms of Service &amp; Acceptable Use
        </h1>
        <p className="mt-1 text-sm text-muted">Last updated: 10 July 2026</p>
      </div>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink">
        <Section title="1. Agreement to these terms">
          By purchasing or using a Shaddai WiFi voucher, you agree to these Terms of Service and
          the Acceptable Use rules below. If you do not agree, do not purchase or use a voucher.
        </Section>

        <Section title="2. Who can use this service">
          You must be 18 or older, or have a parent or guardian&apos;s permission, to purchase a
          voucher.
        </Section>

        <Section title="3. What you're buying">
          A voucher is prepaid, time-limited internet access on the Shaddai WiFi network, for the
          duration and number of devices stated on the plan you purchased. Service is provided on
          a best-effort basis — we do not guarantee uninterrupted or error-free access, and speeds
          may vary with network conditions.
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to use the service to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Break any applicable law, or access or distribute illegal content;</li>
            <li>Harass, defraud, or attempt to harm any person or system;</li>
            <li>Attempt to bypass, tamper with, or overload the network or its security;</li>
            <li>Resell, sublicense, or transfer a voucher code for commercial gain without our
              written permission.</li>
          </ul>
          <p className="mt-2">
            We may suspend or disable a voucher immediately, without refund, if we reasonably
            believe it is being used to violate these terms.
          </p>
        </Section>

        <Section title="5. One voucher, one device limit — no sharing">
          <p>
            Each voucher is licensed for use on up to the number of devices stated on its plan (for
            example, &quot;1 device&quot; or &quot;up to 3 devices&quot;) at the same time. This
            limit is enforced automatically by the network — additional devices beyond that cap
            will simply be refused a connection.
          </p>
          <p className="mt-2">
            Sharing your code so that more people use it than your plan allows is against these
            terms, even though the network may prevent it technically before it becomes a dispute.
          </p>
        </Section>

        <Section title="6. Your responsibility for your own use">
          <p>
            You are solely responsible for everything done over the internet using your voucher —
            including content you access, send, or download, and any consequences of that use. We
            do not monitor your browsing and are not responsible for it.
          </p>
        </Section>

        <Section title="7. Payments and refunds">
          <p>
            Prices are shown in Naira (₦) and charged via Paystack at the time of purchase. Once a
            voucher code has been issued to you, the sale is final — we do not offer refunds,
            except where a payment was charged in error and no voucher was issued (contact us to
            resolve this).
          </p>
        </Section>

        <Section title="8. No warranty; limitation of liability">
          <p>
            The service is provided &quot;as is,&quot; without warranties of any kind. To the
            fullest extent permitted by law, Shaddai Comm Ventures is not liable for any indirect,
            incidental, or consequential damages, including loss of data, loss of business, or
            harm arising from your use of the internet access provided, or from content or actions
            of third parties encountered while using it.
          </p>
        </Section>

        <Section title="9. Changes to these terms">
          We may update these terms from time to time. Continued use of a voucher purchased after
          an update means you accept the revised terms.
        </Section>

        <Section title="10. Your information">
          We collect your email (and phone, if provided) only to deliver your voucher code, send
          payment receipts, and provide support. We do not sell your information to third parties.
        </Section>

        <Section title="11. Contact">
          Questions about these terms can be sent to the contact details on our landing page.
        </Section>
      </div>

      {/* <div className="rounded-card border border-amber/30 bg-amber-tint p-4 text-xs text-ink">
        <strong>Note for the site operator:</strong> this text was drafted to cover the common
        points (liability, no-sharing, no-refund, acceptable use) but has not been reviewed by a
        lawyer. Have it checked by counsel licensed in Nigeria before relying on it for real
        disputes — in particular the refund policy and liability limitation in sections 7 and 8.
      </div> */}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 font-display text-[15px] font-semibold text-ink">{title}</h2>
      <div className="text-muted">{children}</div>
    </section>
  );
}

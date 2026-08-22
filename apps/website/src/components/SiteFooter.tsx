import Image from 'next/image';

const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL ?? 'https://buy.shaddaicommunications.com';
const SUPPORT_EMAIL = 'support@shaddaicommunications.com';

export function SiteFooter() {
  return (
    <footer className="border-t border-line-dark px-6 py-9 text-[13px] text-white/30 sm:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shaddai Communications" width={20} height={20} />
          <span className="font-semibold text-white/50">Shaddai Communications</span>
          <span>· Ugbowo BDPA Estate, Benin City</span>
        </div>
        <div className="flex flex-wrap gap-5">
          <a href={BUY_URL} className="hover:text-white/70">Buy a voucher</a>
          <a href={`${BUY_URL}/business`} className="hover:text-white/70">For businesses</a>
          <a href={`${BUY_URL}/terms`} className="hover:text-white/70">Terms</a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white/70">Support</a>
        </div>
      </div>
    </footer>
  );
}

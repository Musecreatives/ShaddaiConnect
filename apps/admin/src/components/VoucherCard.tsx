import { VoucherQr } from '@/components/VoucherQr';

/**
 * Card geometry in real millimetres so a printed sheet matches physical card stock rather than
 * whatever the browser's screen layout happened to be. 95×68mm at 2×4 fills an A4 with 10mm
 * margins (2×95=190 of 190 usable, 4×68=272 of 277).
 */
export const CARD_W_MM = 95;
export const CARD_H_MM = 68;
export const CARD_COLS = 2;
export const CARDS_PER_PAGE = 8;

const NAVY = '#0D3B75';
const INK = '#0D1B33';
const BLUE = '#1F6FD0';
const CODE_BG = '#E8F1FC';
const MUTED = '#5B6478';

/**
 * Short badge for the card's top-right corner. Derived from the plan *name* rather than
 * `planType`, because planType only distinguishes hourly from monthly — it can't tell "Weekly"
 * from "Monthly (1 Device)" (both are stored as `monthly`, since both use RADIUS Expiration
 * rather than a session timeout).
 */
export function planBadge(planName: string, planType: string): string {
  const n = planName.toLowerCase();
  if (n.includes('trial')) return 'TRIAL';
  if (n.includes('week')) return 'WEEKLY';
  if (n.includes('month')) return 'MONTHLY';
  if (n.includes('day') || n.includes('daily')) return 'DAILY';
  if (n.includes('hour')) return 'HOURLY';
  return planType === 'monthly' ? 'MONTHLY' : 'HOURLY';
}

export function VoucherCard({
  code,
  planName,
  planType,
  priceNaira,
  dataCapMb,
  supportPhone,
  serial,
  cutGuides,
}: {
  code: string;
  planName: string;
  planType: string;
  priceNaira: number;
  dataCapMb: number | null;
  supportPhone?: string;
  serial: number;
  cutGuides: boolean;
}) {
  const badge = planBadge(planName, planType);
  const allowance = dataCapMb ? `${dataCapMb.toLocaleString('en-NG')} MB` : 'unlimited';
  const price = `₦${priceNaira.toLocaleString('en-NG')}`;

  return (
    <div
      className="voucher-card"
      style={{
        width: `${CARD_W_MM}mm`,
        height: `${CARD_H_MM}mm`,
        background: '#fff',
        color: INK,
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // Dashed edge doubles as the trim line — printers rarely register perfectly against
        // pre-cut stock, so printing on plain card and cutting is usually more reliable.
        border: cutGuides ? '0.2mm dashed #B9C4D4' : '0.2mm solid transparent',
      }}
    >
      {/* Header: brand + plan badge / price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '3mm' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={26} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '8.5pt', fontWeight: 800, color: INK, letterSpacing: '0.01em' }}>
              SHADDAI WIFI
            </div>
            <div style={{ fontSize: '6pt', fontWeight: 700, color: BLUE, letterSpacing: '0.06em' }}>
              ACCESS VOUCHER
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              display: 'inline-block',
              background: NAVY,
              color: '#fff',
              fontSize: '6.5pt',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '1mm 2.5mm',
              borderRadius: '1.2mm',
            }}
          >
            {badge}
          </div>
          <div style={{ fontSize: '6pt', color: MUTED, marginTop: '1mm', whiteSpace: 'nowrap' }}>
            {price} · {allowance}
          </div>
        </div>
      </div>

      {/* Code block */}
      <div style={{ background: CODE_BG, borderRadius: '1.5mm', padding: '2.5mm 3mm' }}>
        <div style={{ fontSize: '5.5pt', fontWeight: 800, color: BLUE, letterSpacing: '0.09em' }}>
          VOUCHER CODE
        </div>
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            fontSize: '15pt',
            fontWeight: 800,
            color: INK,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            marginTop: '0.5mm',
          }}
        >
          {code}
        </div>
      </div>

      {/* Instructions + QR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3mm' }}>
        <div style={{ fontSize: '7pt', lineHeight: 1.55, minWidth: 0 }}>
          <div>
            <strong>1.</strong> Connect to <strong>Shaddai WiFi</strong>
          </div>
          <div>
            <strong>2.</strong> Open buy.shaddaicommunications.com
          </div>
          <div>
            <strong>3.</strong> Enter this code to go online
          </div>
          <div style={{ fontSize: '5.5pt', color: MUTED, marginTop: '1mm' }}>
            {supportPhone ? `Support ${supportPhone} · ` : ''}No. {String(serial).padStart(3, '0')}
          </div>
        </div>
        <div style={{ flexShrink: 0, lineHeight: 0 }}>
          <VoucherQr value={code} size={72} />
        </div>
      </div>
    </div>
  );
}

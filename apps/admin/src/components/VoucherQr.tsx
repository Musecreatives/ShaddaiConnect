'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/**
 * QR for a printed voucher ticket. Encodes the bare code, which is what the captive portal's
 * login page parses (it accepts either the bare code or a `?code=` URL param) — so a customer
 * can scan instead of typing `SHADDAI-XXXXX` by hand, which is the main source of failed logins
 * on a printed card.
 *
 * `errorCorrectionLevel: 'M'` on purpose: printed cards get creased and smudged in wallets, and
 * the payload is short enough that the extra redundancy costs no meaningful size.
 */
export function VoucherQr({ value, size = 110 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: size, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        /* a missing QR shouldn't blank the ticket — the code is printed alongside it */
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="rounded-md bg-line/50" />;
  }
  // Plain <img>: next/image would try to optimise a data: URL through the image pipeline, which
  // is pointless here and breaks in a print context.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt={`QR code for ${value}`} width={size} height={size} />;
}

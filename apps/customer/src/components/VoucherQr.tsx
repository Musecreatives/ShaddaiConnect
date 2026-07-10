'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function VoucherQr({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: 160 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    return <div className="h-[160px] w-[160px] animate-pulse rounded-md bg-line" />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it
  return <img src={dataUrl} alt={`QR code for voucher ${value}`} width={160} height={160} />;
}

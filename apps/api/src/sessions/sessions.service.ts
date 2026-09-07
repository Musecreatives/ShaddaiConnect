import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RadAcct } from '@prisma/client';
import { OmadaClientService } from '../network/omada-client.service';
import { PfsenseService } from '../pfsense/pfsense.service';
import { PrismaService } from '../prisma/prisma.service';

export interface SessionDto {
  id: string;
  username: string;
  macAddress: string;
  ipAddress: string;
  nasIpAddress: string;
  startedAt: Date | null;
  stoppedAt: Date | null;
  durationSeconds: number | null;
  downloadBytes: number;
  uploadBytes: number;
  live: boolean;
  /** True only when `live` and the voucher this session's username points to is explicitly
   * `disabled`/`expired` — i.e. FreeRADIUS/pfSense never sent Accounting-Stop even though the
   * voucher itself should no longer be usable. Unmatched/unknown vouchers are left false to
   * avoid false positives. */
  stale: boolean;
  /** From the Omada Controller, matched by MAC — analytics/visibility only, never enforcement
   * (CLAUDE.md: MACs are never the enforcement mechanism). Null when unmatched or Omada isn't
   * configured/reachable. */
  signalRssi: number | null;
  apName: string | null;
}

export interface ListSessionsFilter {
  status?: 'live' | 'all';
  limit?: number;
  offset?: number;
}

/** RADIUS (colon-separated, e.g. "34:6f:24:fc:a5:2b") and Omada (often dash-separated or bare)
 * don't necessarily agree on MAC formatting — strip separators and lowercase before matching. */
function normalizeMac(mac: string): string {
  return mac.toLowerCase().replace(/[^0-9a-f]/g, '');
}

@Injectable()
export class SessionsService {
  /**
   * pfSense/FreeRADIUS accounting is well-documented to sometimes report Acct-Input/Output-Octets
   * from the NAS's perspective rather than the user's, which swaps which column is actually
   * "download" vs "upload" depending on the RADIUS client config. Toggle via env once you've
   * checked against a real known-direction transfer, rather than guessing here.
   */
  private readonly invertOctets: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly omada: OmadaClientService,
    private readonly pfsense: PfsenseService,
    config: ConfigService,
  ) {
    this.invertOctets = config.get('RADIUS_INVERT_OCTETS') === 'true';
  }

  async list(filter: ListSessionsFilter = {}): Promise<{ sessions: SessionDto[]; total: number }> {
    const [omadaClients, pfResult] = await Promise.all([
      this.omada.getConnectedClients(),
      this.pfsense.isEnabled ? this.pfsense.listSessions() : Promise.resolve(null),
    ]);
    const byMac = new Map(omadaClients.map((c) => [normalizeMac(c.mac), c]));
    const staleStatuses = new Set(['expired', 'disabled']);

    const pfSessions = pfResult?.ok ? (pfResult.data ?? []) : null;

    if (filter.status === 'live' && pfSessions) {
      return this.listLiveFromPfsense(pfSessions, byMac, staleStatuses, filter);
    }

    // History, or pfSense unreachable: fall back to radacct. `live` here is only as good as
    // radacct's accounting, which is exactly the thing that over-reports (see listLiveFromPfsense).
    const where = filter.status === 'live' ? { acctStopTime: null } : {};
    const [rows, total] = await Promise.all([
      this.prisma.radAcct.findMany({
        where,
        orderBy: { acctStartTime: 'desc' },
        take: filter.limit ?? 50,
        skip: filter.offset ?? 0,
      }),
      this.prisma.radAcct.count({ where }),
    ]);

    const liveCodes = rows.filter((r) => r.acctStopTime === null).map((r) => r.username);
    const vouchers =
      liveCodes.length > 0
        ? await this.prisma.voucher.findMany({
            where: { code: { in: liveCodes } },
            select: { code: true, status: true },
          })
        : [];
    const voucherStatusByCode = new Map(vouchers.map((v) => [v.code, v.status]));

    return {
      sessions: rows.map((row) => this.toDto(row, byMac, voucherStatusByCode, staleStatuses)),
      total,
    };
  }

  /**
   * pfSense's own captive-portal session table is the authority on who is actually online.
   * `radacct` is not: when pfSense/FreeRADIUS misses an Accounting-Stop the row stays open
   * forever, and a captive-portal re-login can open a *second* row for the same device instead
   * of continuing the first. On 2026-08-30 that had the admin Sessions page reporting 12
   * "connected" devices while pfSense knew about exactly one — with days-old rows still counting
   * up, and blank AP/Signal columns because Omada (which only knows currently-online clients)
   * had nothing to match those ghosts against.
   *
   * So build the live list from pfSense and use radacct only to enrich it with byte counters.
   */
  private async listLiveFromPfsense(
    pfSessions: {
      sessionid: string;
      username: string | null;
      ip: string | null;
      mac: string | null;
    }[],
    omadaByMac: Map<string, { rssi: number | null; apName: string | null }>,
    staleStatuses: Set<string>,
    filter: ListSessionsFilter,
  ): Promise<{ sessions: SessionDto[]; total: number }> {
    const codes = [...new Set(pfSessions.map((s) => s.username).filter((u): u is string => !!u))];
    const rows: RadAcct[] =
      codes.length > 0
        ? await this.prisma.radAcct.findMany({
            where: { username: { in: codes } },
            orderBy: { acctStartTime: 'desc' },
          })
        : [];
    const vouchers: { code: string; status: string }[] =
      codes.length > 0
        ? await this.prisma.voucher.findMany({
            where: { code: { in: codes } },
            select: { code: true, status: true },
          })
        : [];
    const voucherStatusByCode = new Map<string, string>(vouchers.map((v) => [v.code, v.status]));

    const sessions: SessionDto[] = pfSessions.map((s) => {
      const mac = s.mac ?? '';
      const username = s.username ?? '';
      // Newest matching accounting row wins — `rows` is already sorted newest-first, so among
      // duplicate open rows for one device this picks the one for the current connection.
      const row =
        rows.find(
          (r) => r.username === username && normalizeMac(r.callingStationId) === normalizeMac(mac),
        ) ?? rows.find((r) => r.username === username);

      const rawIn = Number(row?.acctInputOctets ?? 0);
      const rawOut = Number(row?.acctOutputOctets ?? 0);
      const startedAt = row?.acctStartTime ?? null;
      const durationSeconds = startedAt
        ? Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000))
        : null;
      const omadaMatch = omadaByMac.get(normalizeMac(mac));
      const voucherStatus = voucherStatusByCode.get(username);

      return {
        id: row?.acctUniqueId ?? s.sessionid,
        username,
        macAddress: mac,
        ipAddress: s.ip ?? row?.framedIpAddress ?? '',
        nasIpAddress: row?.nasIpAddress ?? '',
        startedAt,
        stoppedAt: null,
        durationSeconds,
        downloadBytes: this.invertOctets ? rawIn : rawOut,
        uploadBytes: this.invertOctets ? rawOut : rawIn,
        live: true,
        stale: !!voucherStatus && staleStatuses.has(voucherStatus),
        signalRssi: omadaMatch?.rssi ?? null,
        apName: omadaMatch?.apName ?? null,
      };
    });

    const offset = filter.offset ?? 0;
    return {
      sessions: sessions.slice(offset, offset + (filter.limit ?? 50)),
      total: sessions.length,
    };
  }

  private toDto(
    row: RadAcct,
    omadaByMac: Map<string, { rssi: number | null; apName: string | null }>,
    voucherStatusByCode: Map<string, string>,
    staleStatuses: Set<string>,
  ): SessionDto {
    const rawIn = Number(row.acctInputOctets ?? 0);
    const rawOut = Number(row.acctOutputOctets ?? 0);
    const live = row.acctStopTime === null;

    let durationSeconds: number | null = null;
    if (row.acctSessionTime !== null) {
      durationSeconds = row.acctSessionTime;
    } else if (row.acctStartTime) {
      const end = row.acctStopTime ?? new Date();
      durationSeconds = Math.max(
        0,
        Math.floor((end.getTime() - row.acctStartTime.getTime()) / 1000),
      );
    }

    // Omada only reports currently-online clients — there's no historical AP/RSSI store. Only
    // attach a match to still-open sessions; a stopped session showing "live" signal data just
    // because that MAC happens to be online again right now (a different, later connection) is
    // misleading, not a real reading of what that past session actually experienced.
    const omadaMatch = live ? omadaByMac.get(normalizeMac(row.callingStationId)) : undefined;
    const voucherStatus = live ? voucherStatusByCode.get(row.username) : undefined;
    const stale = live && !!voucherStatus && staleStatuses.has(voucherStatus);

    return {
      id: row.acctUniqueId,
      username: row.username,
      macAddress: row.callingStationId,
      ipAddress: row.framedIpAddress,
      nasIpAddress: row.nasIpAddress,
      startedAt: row.acctStartTime,
      stoppedAt: row.acctStopTime,
      durationSeconds,
      downloadBytes: this.invertOctets ? rawIn : rawOut,
      uploadBytes: this.invertOctets ? rawOut : rawIn,
      live,
      stale,
      signalRssi: omadaMatch?.rssi ?? null,
      apName: omadaMatch?.apName ?? null,
    };
  }
}

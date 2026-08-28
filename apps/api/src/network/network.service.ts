import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CambiumSnmpService, type CambiumBackhaulStatus } from './cambium-snmp.service';

export interface ManagedDeviceLink {
  name: string;
  url: string;
}

/** Static registry for wireless APs that aren't Omada-managed (e.g. a plain TP-Link relay) and
 * so have no API this app can poll for live clients/signal — name/SSID/IP/MAC only, entered by
 * hand, not refreshed automatically. */
export interface AccessPointInfo {
  name: string;
  ssid: string;
  ipAddress: string;
  macAddress: string;
}

export interface NasRow {
  id: number;
  nasname: string;
  shortname: string | null;
  type: string | null;
  description: string | null;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  totalMb: number;
}

export interface TopBandwidthUser {
  code: string;
  totalMb: number;
}

export interface NetworkOverview {
  nas: NasRow[];
  dailyUsage: DailyUsage[]; // last 14 days, oldest first
  totalDataAllTimeMb: number;
  cambiumBackhaul: CambiumBackhaulStatus;
  /** Real all-time usage ranking (radacct octets grouped by voucher code) — not a fabricated
   * stat, but also not filtered by "this device is still an active customer," so a one-time
   * heavy trial user can outrank a light but current subscriber. Good enough for "who's using
   * the most data," not a billing-grade report. */
  topBandwidthUsers: TopBandwidthUser[];
  /** Quick-access links into each device's own web UI (reverse-proxied via Caddy over
   * Tailscale — see docker/docker-compose.portal.yml Caddyfile) — admin console never talks to
   * these devices directly, this is just a bookmark list for jumping into their native UIs. */
  managedDevices: ManagedDeviceLink[];
  /** Wireless APs outside Omada's reach — see AccessPointInfo. */
  knownAccessPoints: AccessPointInfo[];
}

function startOfDay(daysAgo: number): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - daysAgo);
  return d;
}

const TREND_DAYS = 14;

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);
  private readonly managedDevices: ManagedDeviceLink[];
  private readonly knownAccessPoints: AccessPointInfo[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly cambium: CambiumSnmpService,
    config: ConfigService,
  ) {
    this.managedDevices = this.parseJsonEnv(config, 'MANAGED_DEVICE_LINKS');
    this.knownAccessPoints = this.parseJsonEnv(config, 'KNOWN_ACCESS_POINTS');
  }

  private parseJsonEnv<T>(config: ConfigService, key: string): T[] {
    const raw = config.get<string>(key);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      this.logger.warn(`${key} is not valid JSON — ignoring.`);
      return [];
    }
  }

  async getOverview(): Promise<NetworkOverview> {
    // Never select `secret` — it's the live RADIUS shared secret (CLAUDE.md: never expose it).
    const [nas, dailyAggs, totalAgg, cambiumBackhaul, topUsersRaw] = await Promise.all([
      this.prisma.nas.findMany({
        select: { id: true, nasname: true, shortname: true, type: true, description: true },
        orderBy: { id: 'asc' },
      }),
      Promise.all(
        Array.from({ length: TREND_DAYS }, (_, i) => {
          const from = startOfDay(TREND_DAYS - 1 - i);
          const to = startOfDay(TREND_DAYS - 2 - i);
          const isToday = i === TREND_DAYS - 1;
          return this.prisma.radAcct.aggregate({
            _sum: { acctInputOctets: true, acctOutputOctets: true },
            where: { acctStartTime: isToday ? { gte: from } : { gte: from, lt: to } },
          });
        }),
      ),
      this.prisma.radAcct.aggregate({
        _sum: { acctInputOctets: true, acctOutputOctets: true },
      }),
      this.cambium.getBackhaulStatus(),
      this.prisma.radAcct.groupBy({
        by: ['username'],
        _sum: { acctInputOctets: true, acctOutputOctets: true },
        orderBy: { _sum: { acctInputOctets: 'desc' } },
        take: 5,
      }),
    ]);

    const dailyUsage: DailyUsage[] = dailyAggs.map((agg, i) => {
      const date = startOfDay(TREND_DAYS - 1 - i);
      const bytes = Number(agg._sum.acctInputOctets ?? 0) + Number(agg._sum.acctOutputOctets ?? 0);
      return { date: date.toISOString().slice(0, 10), totalMb: bytes / 1_000_000 };
    });

    const totalBytes =
      Number(totalAgg._sum.acctInputOctets ?? 0) + Number(totalAgg._sum.acctOutputOctets ?? 0);

    const topBandwidthUsers: TopBandwidthUser[] = topUsersRaw
      .map((row) => ({
        code: row.username,
        totalMb:
          (Number(row._sum.acctInputOctets ?? 0) + Number(row._sum.acctOutputOctets ?? 0)) / 1_000_000,
      }))
      .sort((a, b) => b.totalMb - a.totalMb);

    return {
      nas,
      dailyUsage,
      totalDataAllTimeMb: totalBytes / 1_000_000,
      cambiumBackhaul,
      topBandwidthUsers,
      managedDevices: this.managedDevices,
      knownAccessPoints: this.knownAccessPoints,
    };
  }
}

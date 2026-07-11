import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RadAcct } from '@prisma/client';
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
}

export interface ListSessionsFilter {
  status?: 'live' | 'all';
  limit?: number;
  offset?: number;
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
    config: ConfigService,
  ) {
    this.invertOctets = config.get('RADIUS_INVERT_OCTETS') === 'true';
  }

  async list(filter: ListSessionsFilter = {}): Promise<{ sessions: SessionDto[]; total: number }> {
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

    return { sessions: rows.map((row) => this.toDto(row)), total };
  }

  private toDto(row: RadAcct): SessionDto {
    const rawIn = Number(row.acctInputOctets ?? 0);
    const rawOut = Number(row.acctOutputOctets ?? 0);
    const live = row.acctStopTime === null;

    let durationSeconds: number | null = null;
    if (row.acctSessionTime !== null) {
      durationSeconds = row.acctSessionTime;
    } else if (row.acctStartTime) {
      const end = row.acctStopTime ?? new Date();
      durationSeconds = Math.max(0, Math.floor((end.getTime() - row.acctStartTime.getTime()) / 1000));
    }

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
    };
  }
}

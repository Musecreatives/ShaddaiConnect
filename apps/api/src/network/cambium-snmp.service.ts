import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as snmp from 'net-snmp';

export interface CambiumBackhaulStatus {
  configured: boolean;
  rssiDbm: number | null;
  connectionStatus: string | null;
  ssid: string | null;
}

// OIDs mapped empirically against the real device (a Cambium ePMP1000 Subscriber Module,
// management IP 192.168.1.2) via `snmpwalk` — see .docs/DECISIONS.md. Not taken from Cambium's
// docs/community posts alone, since those turned out incomplete/scattered.
const OID_DOWNLINK_RSSI = '1.3.6.1.4.1.17713.21.1.2.3.0';
const OID_CONNECTION_STATUS = '1.3.6.1.4.1.17713.21.1.4.33.0';
const OID_SSID = '1.3.6.1.4.1.17713.21.1.2.8.0';

/**
 * The ePMP unit is a point-to-point wireless backhaul link (subscriber module bridging to an AP
 * elsewhere), not something with per-customer "sessions" the way Omada's client list is — so this
 * surfaces as a single link-status/signal reading, not a list. Analytics only, per CLAUDE.md —
 * never an enforcement mechanism, and this has no bearing on voucher/RADIUS auth at all.
 */
@Injectable()
export class CambiumSnmpService {
  private readonly logger = new Logger(CambiumSnmpService.name);
  private readonly host: string | undefined;
  private readonly community: string;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.host = config.get<string>('CAMBIUM_SNMP_HOST');
    this.community = config.get<string>('CAMBIUM_SNMP_COMMUNITY') ?? 'public';
    this.enabled = Boolean(this.host);
    if (!this.enabled) {
      this.logger.warn('CAMBIUM_SNMP_HOST not set — Cambium backhaul status disabled.');
    }
  }

  async getBackhaulStatus(): Promise<CambiumBackhaulStatus> {
    if (!this.enabled) {
      return { configured: false, rssiDbm: null, connectionStatus: null, ssid: null };
    }

    const session = snmp.createSession(this.host, this.community, { timeout: 3000 });
    try {
      // Queried independently, not as one batched get() — a single OID net-snmp can't resolve
      // (e.g. connectionStatus, which doesn't exist on a Force180; the OIDs here were originally
      // mapped against a different Cambium model, an ePMP1000 Subscriber Module) errors the
      // *entire* batched request, which was blanking out RSSI/SSID too even though those two
      // resolve fine. One bad OID should degrade just that field, not the whole reading.
      const [rssiDbm, connectionStatus, ssid] = await Promise.all([
        this.getOne(session, OID_DOWNLINK_RSSI, Number),
        this.getOne(session, OID_CONNECTION_STATUS, String),
        this.getOne(session, OID_SSID, String),
      ]);

      return { configured: true, rssiDbm, connectionStatus, ssid };
    } finally {
      session.close();
    }
  }

  private getOne<T>(
    session: snmp.Session,
    oid: string,
    parse: (raw: unknown) => T,
  ): Promise<T | null> {
    return new Promise((resolve) => {
      session.get([oid], (error, varbinds) => {
        const vb = varbinds?.[0];
        if (error || !vb || snmp.isVarbindError(vb)) {
          if (error) this.logger.debug(`Cambium SNMP get failed for ${oid}: ${error.message}`);
          resolve(null);
          return;
        }
        resolve(parse(vb.value));
      });
    });
  }
}

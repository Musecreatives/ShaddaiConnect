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

    const session = snmp.createSession(this.host!, this.community, { timeout: 3000 });
    try {
      const varbinds = await new Promise<snmp.Varbind[]>((resolve, reject) => {
        session.get(
          [OID_DOWNLINK_RSSI, OID_CONNECTION_STATUS, OID_SSID],
          (error, varbinds) => {
            if (error) reject(error);
            else resolve(varbinds ?? []);
          },
        );
      });

      const [rssi, status, ssid] = varbinds;
      const isError = (vb: snmp.Varbind | undefined) =>
        !vb || snmp.isVarbindError(vb);

      return {
        configured: true,
        rssiDbm: isError(rssi) ? null : Number(rssi.value),
        connectionStatus: isError(status) ? null : String(status.value),
        ssid: isError(ssid) ? null : String(ssid.value),
      };
    } catch (err) {
      this.logger.warn(`Cambium SNMP query failed: ${(err as Error).message}`);
      return { configured: true, rssiDbm: null, connectionStatus: null, ssid: null };
    } finally {
      session.close();
    }
  }
}

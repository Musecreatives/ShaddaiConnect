import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSocket } from 'node:dgram';
import * as radius from 'radius';
import { PrismaService } from '../prisma/prisma.service';

export interface DisconnectResult {
  attempted: boolean;
  success: boolean;
  message: string;
}

const DEFAULT_COA_PORT = 3799;
const RESPONSE_TIMEOUT_MS = 5000;

/**
 * RADIUS Dynamic Authorization (RFC 3576/5176) — sends a real Disconnect-Request to the NAS
 * (pfSense) to drop an already-open session, not just prevent the next reconnect (that's what
 * the blocklist/trial-abuse guard already do via radcheck removal). Uses the same shared secret
 * already stored in the `nas` table for normal RADIUS auth — never logged, read fresh from the
 * DB on each call, never cached in memory or written to a log line.
 *
 * pfSense's captive portal doesn't expose an explicit "enable CoA" toggle in its UI; it's
 * expected to listen on the standard port (3799) using the same RADIUS server credentials
 * already configured for auth. This has NOT been confirmed working against the live pfSense
 * instance as of first deploy — treat the first real call as the test, and check the returned
 * `message` for whether it actually got a Disconnect-ACK vs timed out vs got a NAK.
 */
@Injectable()
export class CoaService {
  private readonly logger = new Logger(CoaService.name);
  private readonly port: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.port = Number(config.get<string>('RADIUS_COA_PORT')) || DEFAULT_COA_PORT;
  }

  /** Disconnects the currently-open session for a voucher code, if any. No-op (not an error) if
   * nothing is currently connected under that code. When a voucher has more than one open
   * session (see VoucherActivationService's duplicate-session cleanup), this always targets the
   * *most recent* one — callers that need to kick a specific older/superseded session instead
   * must use disconnectSession(). */
  async disconnectVoucher(code: string): Promise<DisconnectResult> {
    const session = await this.prisma.radAcct.findFirst({
      where: { username: code, acctStopTime: null },
      select: {
        nasIpAddress: true,
        callingStationId: true,
        framedIpAddress: true,
        acctSessionId: true,
      },
      orderBy: { acctStartTime: 'desc' },
    });

    if (!session) {
      return { attempted: false, success: false, message: 'No open session for this voucher.' };
    }

    return this.disconnectSession(session, code);
  }

  /** Disconnects one specific open session (as opposed to disconnectVoucher(), which always
   * picks the most recent). Needed when a voucher has multiple open radacct rows and the
   * *older* one(s) — not the current one — need to be kicked. */
  async disconnectSession(
    session: {
      nasIpAddress: string;
      callingStationId: string;
      framedIpAddress: string;
      acctSessionId: string;
    },
    code: string,
  ): Promise<DisconnectResult> {
    // radacct's recorded nasIpAddress for a given session isn't reliable — pfSense and
    // FreeRADIUS have been observed logging different source addresses for the same physical
    // NAS across sessions (LAN IP, the KVM host's NAT interface, a public IP, a Tailscale IP),
    // so an exact match against it is too fragile. There is only ever one physical NAS in this
    // deployment (CLAUDE.md), so with exactly one configured `nas` row, use it regardless of
    // what this particular session happened to log — only fall back to exact matching if a
    // second NAS is ever added and the row genuinely needs picking out.
    const nasRows = await this.prisma.nas.findMany();
    const nas =
      nasRows.length === 1 ? nasRows[0] : nasRows.find((n) => n.nasname === session.nasIpAddress);
    if (!nas) {
      return {
        attempted: false,
        success: false,
        message: `No configured NAS entry for ${session.nasIpAddress} — can't send Disconnect-Request.`,
      };
    }

    const attributes: Array<[string, unknown]> = [
      ['User-Name', code],
      ['NAS-IP-Address', session.nasIpAddress],
    ];
    if (session.acctSessionId) attributes.push(['Acct-Session-Id', session.acctSessionId]);
    if (session.callingStationId) attributes.push(['Calling-Station-Id', session.callingStationId]);
    if (session.framedIpAddress) attributes.push(['Framed-IP-Address', session.framedIpAddress]);

    return this.sendDisconnect(nas.nasname, nas.secret, attributes, code);
  }

  private sendDisconnect(
    nasIp: string,
    secret: string,
    attributes: Array<[string, unknown]>,
    code: string,
  ): Promise<DisconnectResult> {
    return new Promise((resolve) => {
      const socket = createSocket('udp4');
      let settled = false;

      const finish = (result: DisconnectResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.close();
        resolve(result);
      };

      const timer = setTimeout(() => {
        finish({
          attempted: true,
          success: false,
          message: `No response from ${nasIp} within ${RESPONSE_TIMEOUT_MS / 1000}s (timed out — CoA may not be listening on port ${this.port}).`,
        });
      }, RESPONSE_TIMEOUT_MS);

      socket.on('message', (msg) => {
        try {
          const response = radius.decode({ packet: msg, secret });
          if (response.code === 'Disconnect-ACK') {
            finish({ attempted: true, success: true, message: `${code} disconnected.` });
          } else {
            finish({
              attempted: true,
              success: false,
              message: `NAS rejected the disconnect (Disconnect-NAK) — session may already be gone, or attributes didn't match.`,
            });
          }
        } catch (err) {
          finish({
            attempted: true,
            success: false,
            message: `Got a response but couldn't decode it (wrong shared secret?): ${(err as Error).message}`,
          });
        }
      });

      socket.on('error', (err) => {
        finish({ attempted: true, success: false, message: `Socket error: ${err.message}` });
      });

      try {
        const packet = radius.encode({ code: 'Disconnect-Request', secret, attributes });
        socket.send(packet, 0, packet.length, this.port, nasIp, (err) => {
          if (err)
            finish({ attempted: true, success: false, message: `Send failed: ${err.message}` });
        });
      } catch (err) {
        this.logger.warn(
          `Failed to build Disconnect-Request for ${code}: ${(err as Error).message}`,
        );
        finish({
          attempted: true,
          success: false,
          message: `Failed to build packet: ${(err as Error).message}`,
        });
      }
    });
  }
}

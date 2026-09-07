import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface CpSession {
  sessionid: string;
  username: string | null;
  ip: string | null;
  mac: string | null;
  allow_time: number | null;
}

export interface PfsenseResult<T> {
  ok: boolean;
  data: T | null;
  message: string;
}

export interface FirewallRule {
  interface: string;
  action: string;
  disabled: boolean;
  protocol: string;
  source: string;
  destination: string;
  port: string;
  gateway: string;
  description: string;
}

export interface FirewallStatus {
  rules: FirewallRule[];
  nat: {
    interface: string;
    protocol: string;
    destination_port: string;
    target: string;
    local_port: string;
    disabled: boolean;
    description: string;
  }[];
  gateways: {
    name: string;
    status: string;
    substatus: string;
    delay: string;
    loss: string;
    monitor: string;
  }[];
  wireguard: {
    packageInstalled: boolean;
    tunnels: { name: string; enabled: boolean; address: string; description: string }[];
  };
  openvpnClients: { description: string; server: string; disabled: boolean }[];
}

/** Hard ceiling on any single pfSense call. A piped one-liner into pfSsh.php was once observed
 * pinning pfSense at 100% CPU / 1.9GB RAM for 13+ minutes (2026-08-30) — every invocation is
 * timeout-wrapped on both sides so a hung call can never do that again. */
const SSH_TIMEOUT_MS = 25_000;
const REMOTE_TIMEOUT_S = 20;
/** Short enough that a just-kicked device stops showing as connected almost immediately, long
 * enough to absorb a burst of portal login attempts without an SSH call each. */
const SESSION_CACHE_MS = 5_000;

/**
 * Drives pfSense's captive portal over SSH, via `pfSsh.php playback` scripts installed at
 * /etc/phpshellsessions/ on the firewall (shaddai_cp_list / shaddai_cp_disconnect /
 * shaddai_cp_mac). Those scripts call pfSense's own internal functions —
 * captiveportal_disconnect_client() and the passthrumac config — which is the same path its web
 * UI uses.
 *
 * Why not RADIUS CoA: pfSense's captive portal has never implemented RFC 3576 (open feature
 * request, pfSense Redmine #13625). CoaService's Disconnect-Requests to 192.168.1.1:3799 always
 * time out; the audit log is full of them. Disabling a voucher only stops its *next* login —
 * this is what actually kicks a device that's already online.
 *
 * Per CLAUDE.md's updated Infra boundaries (2026-08-30, user-approved): scoped to captive-portal
 * device management only — never WAN/firewall rules, VPN, or other pfSense services.
 */
@Injectable()
export class PfsenseService implements OnModuleInit {
  private readonly logger = new Logger(PfsenseService.name);
  private readonly host: string | undefined;
  private readonly user: string;
  private readonly keyB64: string | undefined;
  private keyPath: string | null = null;
  private enabled = false;
  private sessionCache: { at: number; data: CpSession[] } | null = null;

  constructor(config: ConfigService) {
    this.host = config.get<string>('PFSENSE_HOST');
    this.user = config.get<string>('PFSENSE_SSH_USER') ?? 'admin';
    this.keyB64 = config.get<string>('PFSENSE_SSH_KEY_B64');
  }

  /** The key arrives base64-encoded in env rather than as a mounted file: the container runs as
   * root while the host key file is owned by another uid, and ssh refuses a key whose owner is
   * neither root nor the calling user. Writing it ourselves at 0600 sidesteps that entirely. */
  onModuleInit(): void {
    if (!this.host || !this.keyB64) {
      this.logger.warn(
        'PFSENSE_HOST / PFSENSE_SSH_KEY_B64 not set — pfSense captive-portal control disabled.',
      );
      return;
    }
    try {
      const dir = mkdtempSync(join(tmpdir(), 'pfsense-'));
      const path = join(dir, 'id_key');
      let pem = Buffer.from(this.keyB64, 'base64').toString('utf8');
      if (!pem.endsWith('\n')) pem += '\n';
      writeFileSync(path, pem, { mode: 0o600 });
      chmodSync(path, 0o600);
      this.keyPath = path;
      this.enabled = true;
      this.logger.log(`pfSense captive-portal control enabled (${this.user}@${this.host}).`);
    } catch (err) {
      this.logger.error(`Failed to prepare pfSense SSH key: ${(err as Error).message}`);
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Lists live captive-portal sessions. */
  async listSessions(): Promise<PfsenseResult<CpSession[]>> {
    const res = await this.playback<{ sessions: CpSession[] }>('shaddai_cp_list', []);
    return { ok: res.ok, data: res.data?.sessions ?? null, message: res.message };
  }

  /**
   * Same as listSessions() but memoised for a few seconds. The public voucher-status endpoint
   * calls this on every captive-portal login attempt to decide "is this code already connected
   * somewhere?", and an SSH round trip per keystroke-driven request would be both slow (the
   * portal page gives up after 2.5s) and needlessly hard on the firewall. Returns null rather
   * than throwing when pfSense can't be reached, so callers can fall back.
   */
  async listSessionsCached(): Promise<CpSession[] | null> {
    if (this.sessionCache && Date.now() - this.sessionCache.at < SESSION_CACHE_MS) {
      return this.sessionCache.data;
    }
    const res = await this.listSessions();
    if (!res.ok || !res.data) return null;
    this.sessionCache = { at: Date.now(), data: res.data };
    return res.data;
  }

  /** Drops the memoised session list — call after anything that changes who is online, so the
   * next status check doesn't report a device we just kicked as still connected. */
  invalidateSessionCache(): void {
    this.sessionCache = null;
  }

  /** Disconnects every live session whose voucher code OR MAC matches `target`. */
  async disconnect(target: string): Promise<PfsenseResult<{ disconnected: number }>> {
    const res = await this.playback<{ disconnected: number }>('shaddai_cp_disconnect', [target]);
    this.invalidateSessionCache();
    if (res.ok && res.data) {
      return {
        ok: true,
        data: res.data,
        message:
          res.data.disconnected > 0
            ? `Disconnected ${res.data.disconnected} session(s) for ${target}.`
            : `No live session found for ${target}.`,
      };
    }
    return { ok: false, data: null, message: res.message };
  }

  /** Adds a captive-portal block for this MAC and kills any session it currently holds. Unlike
   * disabling a voucher, this stops the device regardless of which code it later obtains. */
  async blockMac(
    mac: string,
  ): Promise<PfsenseResult<{ changed: boolean; sessions_killed?: number }>> {
    const res = await this.playback<{ changed: boolean; sessions_killed?: number }>(
      'shaddai_cp_mac',
      ['block', mac.toLowerCase()],
    );
    this.invalidateSessionCache(); // blocking also kills that device's session
    return res;
  }

  async unblockMac(mac: string): Promise<PfsenseResult<{ changed: boolean }>> {
    return this.playback('shaddai_cp_mac', ['unblock', mac.toLowerCase()]);
  }

  async listMacs(): Promise<PfsenseResult<{ entries: { mac: string; action: string }[] }>> {
    return this.playback('shaddai_cp_mac', ['list']);
  }

  /** Read-only firewall/NAT/gateway/VPN snapshot for the admin Firewall page. Deliberately has
   * no write counterpart: per CLAUDE.md's Infra boundaries the pfSense integration is scoped to
   * captive-portal device management, and firewall rules stay web-UI only — a bad rule takes the
   * whole network down, and there's no undo here the way there is in the pfSense UI. */
  async firewallStatus(): Promise<PfsenseResult<FirewallStatus>> {
    return this.playback('shaddai_fw_status', []);
  }

  /** Runs one playback script. Never throws — callers get {ok:false,message} so a firewall that's
   * unreachable degrades the feature instead of failing the whole request/cron. */
  private async playback<T>(script: string, args: string[]): Promise<PfsenseResult<T>> {
    if (!this.enabled || !this.keyPath || !this.host) {
      return { ok: false, data: null, message: 'pfSense control is not configured.' };
    }
    // Args reach pfSsh.php as separate argv entries, never through a shell on this side —
    // execFile does not spawn one. The remote side is a fixed `pfSsh.php playback` invocation.
    const remote = ['timeout', String(REMOTE_TIMEOUT_S), 'pfSsh.php', 'playback', script, ...args];
    try {
      const { stdout } = await execFileAsync(
        'ssh',
        [
          '-o',
          'BatchMode=yes',
          '-o',
          'StrictHostKeyChecking=accept-new',
          '-o',
          'ConnectTimeout=8',
          '-i',
          this.keyPath,
          `${this.user}@${this.host}`,
          ...remote,
        ],
        { timeout: SSH_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      );

      // pfSsh.php prints a banner around playback output; our scripts emit a single JSON object.
      const line = stdout
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('{') && l.endsWith('}'))
        .pop();
      if (!line) {
        return { ok: false, data: null, message: 'No JSON returned by pfSense.' };
      }
      const parsed = JSON.parse(line) as T & { error?: string };
      if (parsed.error) {
        return { ok: false, data: null, message: `pfSense: ${parsed.error}` };
      }
      return { ok: true, data: parsed, message: 'ok' };
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.warn(`pfSense playback ${script} failed: ${msg}`);
      return { ok: false, data: null, message: `pfSense call failed: ${msg}` };
    }
  }
}

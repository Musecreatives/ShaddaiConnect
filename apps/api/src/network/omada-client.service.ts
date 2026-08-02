import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosInstance } from 'axios';
import { Agent } from 'node:https';

export interface OmadaClientDevice {
  mac: string;
  name: string | null;
  ssid: string | null;
  apName: string | null;
  rssi: number | null;
  wireless: boolean;
  ip: string | null;
}

interface TokenResponse {
  errorCode: number;
  msg: string;
  result?: { accessToken: string; expiresIn: number };
}

interface SitesResponse {
  errorCode: number;
  result?: { data: { siteId: string; name: string }[] };
}

interface ClientsResponse {
  errorCode: number;
  result?: {
    data: {
      mac: string;
      name?: string;
      ssid?: string;
      apName?: string;
      rssi?: number;
      wireless: boolean;
      ip?: string;
    }[];
  };
}

/**
 * The Omada Controller runs on this same server with a self-signed cert (local-only,
 * loopback access via network_mode: host) — TLS verification is disabled for this client
 * specifically, not globally, since we're talking to 127.0.0.1, not a public endpoint.
 */
@Injectable()
export class OmadaClientService {
  private readonly logger = new Logger(OmadaClientService.name);
  private readonly client: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly omadacId: string;
  private readonly enabled: boolean;

  private accessToken: string | null = null;
  private tokenExpiresAt = 0;
  private siteId: string | null = null;

  constructor(private readonly config: ConfigService) {
    const baseURL = this.config.get<string>('OMADA_BASE_URL');
    this.clientId = this.config.get<string>('OMADA_CLIENT_ID') ?? '';
    this.clientSecret = this.config.get<string>('OMADA_CLIENT_SECRET') ?? '';
    this.omadacId = this.config.get<string>('OMADA_OMADAC_ID') ?? '';
    this.enabled = Boolean(baseURL && this.clientId && this.clientSecret && this.omadacId);

    this.client = axios.create({
      baseURL,
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    });

    if (!this.enabled) {
      this.logger.warn('Omada credentials not fully configured — device visibility disabled.');
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.enabled) return null;
    if (this.accessToken && Date.now() < this.tokenExpiresAt) return this.accessToken;

    const { data } = await this.client.post<TokenResponse>(
      '/openapi/authorize/token',
      { omadacId: this.omadacId, client_id: this.clientId, client_secret: this.clientSecret },
      { params: { grant_type: 'client_credentials' } },
    );
    if (data.errorCode !== 0 || !data.result) {
      throw new Error(`Omada token request failed: ${data.msg}`);
    }
    this.accessToken = data.result.accessToken;
    // Refresh a minute early rather than exactly on expiry.
    this.tokenExpiresAt = Date.now() + (data.result.expiresIn - 60) * 1000;
    return this.accessToken;
  }

  private async getSiteId(token: string): Promise<string | null> {
    if (this.siteId) return this.siteId;
    const { data } = await this.client.get<SitesResponse>(`/openapi/v1/${this.omadacId}/sites`, {
      headers: { Authorization: `AccessToken=${token}` },
      params: { page: 1, pageSize: 10 },
    });
    if (data.errorCode !== 0 || !data.result?.data.length) return null;
    this.siteId = data.result.data[0].siteId;
    return this.siteId;
  }

  /** Returns [] (not an error) when Omada isn't configured or unreachable — this is a nice-to-have
   * visibility layer on top of RADIUS-based session data, never a hard dependency. */
  async getConnectedClients(): Promise<OmadaClientDevice[]> {
    if (!this.enabled) return [];
    try {
      const token = await this.getAccessToken();
      if (!token) return [];
      const siteId = await this.getSiteId(token);
      if (!siteId) return [];

      const { data } = await this.client.get<ClientsResponse>(
        `/openapi/v1/${this.omadacId}/sites/${siteId}/clients`,
        {
          headers: { Authorization: `AccessToken=${token}` },
          params: { page: 1, pageSize: 200 },
        },
      );
      if (data.errorCode !== 0 || !data.result) return [];

      return data.result.data.map((c) => ({
        mac: c.mac,
        name: c.name ?? null,
        ssid: c.ssid ?? null,
        apName: c.apName ?? null,
        rssi: c.rssi ?? null,
        wireless: c.wireless,
        ip: c.ip ?? null,
      }));
    } catch (err) {
      this.logger.warn(`Omada client fetch failed: ${(err as Error).message}`);
      return [];
    }
  }
}

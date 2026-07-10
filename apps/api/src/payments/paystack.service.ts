import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosInstance } from 'axios';
import { createHmac, timingSafeEqual } from 'node:crypto';

interface InitializeTransactionParams {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl?: string;
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
  };
}

@Injectable()
export class PaystackService {
  private readonly client: AxiosInstance;
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY');
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
  }

  async initializeTransaction(params: InitializeTransactionParams) {
    const { data } = await this.client.post<InitializeTransactionResponse>(
      '/transaction/initialize',
      {
        email: params.email,
        amount: Math.round(params.amountNaira * 100), // kobo
        reference: params.reference,
        callback_url: params.callbackUrl,
      },
    );
    if (!data.status) throw new InternalServerErrorException('Paystack initialize failed');
    return data.data;
  }

  async verifyTransaction(reference: string) {
    const { data } = await this.client.get<VerifyTransactionResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    return data.data;
  }

  /** HMAC-SHA512 of the RAW request body against the secret key — CLAUDE.md non-negotiable. */
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    const expected = createHmac('sha512', this.secretKey).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(signatureHeader, 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  }
}

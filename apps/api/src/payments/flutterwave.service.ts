import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosInstance } from 'axios';
import { timingSafeEqual } from 'node:crypto';

interface InitializeTransactionParams {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl?: string;
}

interface InitializeTransactionResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    link: string;
  };
}

interface TransactionData {
  id: number;
  tx_ref: string;
  status: 'successful' | 'failed' | 'pending';
  amount: number;
  currency: string;
}

interface VerifyTransactionResponse {
  status: 'success' | 'error';
  message: string;
  data: TransactionData;
}

interface ListTransactionsResponse {
  status: 'success' | 'error';
  message: string;
  data: TransactionData[];
}

@Injectable()
export class FlutterwaveService {
  private readonly client: AxiosInstance;
  private readonly secretKey: string;
  /** A value WE choose and paste into the Flutterwave dashboard (Settings > Webhooks > Secret
   * Hash) — not derived from the secret/public keys, and not an HMAC input. Flutterwave just
   * echoes it back verbatim in the `verif-hash` header on every webhook call. */
  private readonly webhookSecretHash: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.getOrThrow<string>('FLUTTERWAVE_SECRET_KEY');
    this.webhookSecretHash = this.config.getOrThrow<string>('FLUTTERWAVE_WEBHOOK_SECRET_HASH');
    this.client = axios.create({
      baseURL: 'https://api.flutterwave.com/v3',
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
  }

  async initializeTransaction(params: InitializeTransactionParams) {
    const { data } = await this.client.post<InitializeTransactionResponse>('/payments', {
      tx_ref: params.reference,
      amount: params.amountNaira,
      currency: 'NGN',
      redirect_url: params.callbackUrl,
      customer: { email: params.email },
    });
    if (data.status !== 'success') {
      throw new InternalServerErrorException('Flutterwave initialize failed');
    }
    // Named authorization_url, not link, so callers (payments.service.ts) don't need to know
    // which provider is behind this — same shape PaystackService used to return.
    return { authorization_url: data.data.link };
  }

  /**
   * By Flutterwave's numeric transaction id, not by our tx_ref — this is Flutterwave's own
   * documented recommendation (verify by the id echoed in the webhook/redirect, not by the
   * reference we sent them) and is what the webhook handler and status-poll fallback both need
   * to independently confirm status/amount rather than trusting the webhook body alone.
   */
  async verifyTransactionById(transactionId: number) {
    const { data } = await this.client.get<VerifyTransactionResponse>(
      `/transactions/${transactionId}/verify`,
    );
    return data.data;
  }

  /**
   * Used only by the status-poll fallback (customer's success page, if the webhook hasn't landed
   * yet) — that path only has our own tx_ref, not Flutterwave's numeric id, which only arrives
   * via the webhook/redirect. verifyTransactionById is the primary, better-documented path; this
   * is the belt-and-braces one.
   *
   * `/transactions/verify_by_ref` does NOT exist — confirmed live 2026-09-03, it 404s with an
   * HTML error page, not JSON, which crashed every call to this method with an unhandled
   * TypeError and left successful payments stuck at `pending` with no voucher ever issued. The
   * real, working equivalent is the List Transactions endpoint filtered by tx_ref (verified
   * against the live API); it returns an array, not a single object, and an unmatched reference
   * returns an empty array rather than a 404.
   */
  async verifyTransactionByReference(reference: string): Promise<TransactionData | null> {
    const { data } = await this.client.get<ListTransactionsResponse>('/transactions', {
      params: { tx_ref: reference },
    });
    return data.data[0] ?? null;
  }

  /** Webhook auth is a plain string comparison against a secret hash configured in the
   * Flutterwave dashboard — NOT an HMAC (unlike Paystack's HMAC-SHA512 of the raw body).
   * Confirmed against Flutterwave's own webhook documentation, 2026-09-02. Still timing-safe
   * despite being a plain comparison, since a timing side-channel on string equality is exactly
   * what timingSafeEqual exists to close. */
  verifyWebhookSignature(signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    const expectedBuf = Buffer.from(this.webhookSecretHash, 'utf8');
    const actualBuf = Buffer.from(signatureHeader, 'utf8');
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  }
}

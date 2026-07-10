#!/usr/bin/env node
/**
 * Sends a locally-signed Paystack `charge.success` webhook to a running dev API, computing the
 * HMAC-SHA512 `x-paystack-signature` the same way Paystack does. Useful because Paystack's
 * hosted webhook can't reach localhost — this is the "manual curl with computed signature"
 * approach from docs/TODO.md Phase 2, wrapped in a script instead of copy-pasted each time.
 *
 * Usage:
 *   node scripts/test-webhook.js <paystack_reference> [--bad-signature]
 *
 * Requires PAYSTACK_SECRET_KEY in apps/api/.env and the api dev server running on PORT (3000).
 */
const crypto = require('node:crypto');
const http = require('node:http');
require('dotenv').config();

const reference = process.argv[2];
if (!reference) {
  console.error('Usage: node scripts/test-webhook.js <paystack_reference> [--bad-signature]');
  process.exit(1);
}

const secret = process.env.PAYSTACK_SECRET_KEY;
if (!secret) {
  console.error('PAYSTACK_SECRET_KEY not set — check apps/api/.env');
  process.exit(1);
}

const body = JSON.stringify({
  event: 'charge.success',
  data: { reference, amount: 10000, status: 'success' },
});
const signature = crypto.createHmac('sha512', secret).update(body).digest('hex');
const useBadSignature = process.argv.includes('--bad-signature');

const req = http.request(
  {
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/api/payments/paystack/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'x-paystack-signature': useBadSignature ? 'deadbeef'.repeat(16) : signature,
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => console.log(res.statusCode, data));
  },
);
req.write(body);
req.end();

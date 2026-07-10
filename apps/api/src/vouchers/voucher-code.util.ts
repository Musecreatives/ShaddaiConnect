import { randomInt } from 'node:crypto';

// No O/0, I/1, L — avoids visual ambiguity on printed tickets.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;
const PREFIX = 'SHADDAI-';

export function generateVoucherCode(): string {
  let suffix = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${PREFIX}${suffix}`;
}

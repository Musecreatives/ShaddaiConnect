/** Minimal quoted-CSV line parser — handles commas inside quoted fields (e.g. Google Forms
 * checkbox answers like "Online Classes;Research;Remote Work"), which a naive split(',') breaks. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export interface ParsedWaitlistRow {
  email?: string;
  name?: string;
  phone?: string;
  locationNote?: string;
  rowNumber: number;
}

// Flexible header matching — the real Google Forms export uses its own question text as column
// headers ("Email Address", "WhatsApp Phone Number", ...), not generic field names. Matched
// case-insensitively against likely aliases so the actual exported file works without the user
// having to rename columns first.
const EMAIL_HEADERS = ['email', 'email address'];
const NAME_HEADERS = ['name', 'full name'];
const PHONE_HEADERS = ['phone', 'whatsapp phone number', 'phone number'];
// These are concatenated together (space-separated) into one locationNote field, since our
// schema has a single free-text location column, not one per survey question.
const LOCATION_HEADERS = [
  'location',
  'location note',
  'which area do you currently stay',
  'which area do you currently stay?',
  'hostel/lodge name',
  'house number / lodge number',
  'closest landmark',
];

function findColumnIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h.trim().toLowerCase()));
}

export function parseWaitlistCsv(content: string): ParsedWaitlistRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const emailIdx = findColumnIndex(headers, EMAIL_HEADERS);
  const nameIdx = findColumnIndex(headers, NAME_HEADERS);
  const phoneIdx = findColumnIndex(headers, PHONE_HEADERS);
  const locationIndices = headers
    .map((h, i) => ({ h: h.trim().toLowerCase(), i }))
    .filter(({ h }) => LOCATION_HEADERS.includes(h))
    .map(({ i }) => i);

  const rows: ParsedWaitlistRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const email = emailIdx >= 0 ? fields[emailIdx]?.trim() : undefined;
    const name = nameIdx >= 0 ? fields[nameIdx]?.trim() : undefined;
    const phone = phoneIdx >= 0 ? fields[phoneIdx]?.trim() : undefined;
    const locationNote = locationIndices
      .map((idx) => fields[idx]?.trim())
      .filter((v) => v && v.toLowerCase() !== 'nil' && v.toLowerCase() !== 'none')
      .join(', ');

    rows.push({
      email: email || undefined,
      name: name || undefined,
      phone: phone || undefined,
      locationNote: locationNote || undefined,
      rowNumber: i + 1, // 1-indexed, +1 for the header row already consumed
    });
  }
  return rows;
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SiteSettingField {
  key: string;
  label: string;
  help: string;
  multiline: boolean;
  maxLength: number;
}

/**
 * The complete set of editable strings. Adding copy to the buy site means adding an entry here
 * plus reading it wherever it renders — the admin page builds itself from this list, so no admin
 * UI work is needed per field. Keeping it a fixed allow-list (rather than free-form keys) means
 * the admin page can't accumulate orphaned junk and a typo'd key can't silently do nothing.
 */
export const SITE_SETTING_FIELDS: SiteSettingField[] = [
  {
    key: 'announcement',
    label: 'Announcement banner',
    help: 'Shown across the top of the buy site. Leave blank to hide it entirely.',
    multiline: true,
    maxLength: 300,
  },
  {
    key: 'trial_paused_note',
    label: 'Free trial paused message',
    help: 'Shown on the trial page when the Free Trial plan is set inactive on the Plans page.',
    multiline: true,
    maxLength: 300,
  },
  {
    key: 'support_hours',
    label: 'Support hours',
    help: 'Shown on the support page, e.g. "Mon–Sat, 8am–8pm".',
    multiline: false,
    maxLength: 120,
  },
  {
    key: 'support_phone',
    label: 'Support phone number',
    help: 'Printed on voucher cards, e.g. "0702 529 6409". Leave blank to omit it from cards.',
    multiline: false,
    maxLength: 40,
  },
  {
    key: 'coverage_note',
    label: 'Coverage note',
    help: 'Shown under the plan list — useful for setting expectations about which streets are live.',
    multiline: true,
    maxLength: 300,
  },
  {
    key: 'website_hero_subtext',
    label: 'Marketing site hero subtext',
    help: 'Shown under the headline on the main landing page (shaddaicommunications.com). Leave blank to use the default wording.',
    multiline: true,
    maxLength: 300,
  },
  {
    key: 'website_about_body',
    label: 'About page text',
    help: 'The main paragraph(s) on the About page. Leave blank to use the default wording.',
    multiline: true,
    maxLength: 2000,
  },
  {
    key: 'website_about_image',
    label: 'About page image',
    help: 'Photo shown on the About page.',
    multiline: false,
    maxLength: 300,
  },
  {
    key: 'social_facebook',
    label: 'Facebook',
    help: 'Full page URL, e.g. https://facebook.com/shaddaicommunications. Leave blank to hide the icon.',
    multiline: false,
    maxLength: 300,
  },
  {
    key: 'social_instagram',
    label: 'Instagram',
    help: 'Full profile URL. Leave blank to hide the icon.',
    multiline: false,
    maxLength: 300,
  },
  {
    key: 'social_x',
    label: 'X (Twitter)',
    help: 'Full profile URL. Leave blank to hide the icon.',
    multiline: false,
    maxLength: 300,
  },
  {
    key: 'social_linkedin',
    label: 'LinkedIn',
    help: 'Full company/page URL. Leave blank to hide the icon.',
    multiline: false,
    maxLength: 300,
  },
  {
    key: 'social_tiktok',
    label: 'TikTok',
    help: 'Full profile URL. Leave blank to hide the icon.',
    multiline: false,
    maxLength: 300,
  },
];

const FIELD_BY_KEY = new Map(SITE_SETTING_FIELDS.map((f) => [f.key, f]));

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every known key, with '' for anything never set — so callers never deal with undefined and
   * the admin form always renders the full list. */
  async getAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteSetting.findMany();
    const stored = new Map(rows.map((r) => [r.key, r.value]));
    const out: Record<string, string> = {};
    for (const field of SITE_SETTING_FIELDS) {
      out[field.key] = stored.get(field.key) ?? '';
    }
    return out;
  }

  /** Partial update — only the keys present are touched. Unknown keys are rejected rather than
   * silently ignored, so a typo surfaces instead of looking like a save that didn't stick. */
  async update(patch: Record<string, string>): Promise<Record<string, string>> {
    const entries = Object.entries(patch);
    for (const [key, value] of entries) {
      const field = FIELD_BY_KEY.get(key);
      if (!field) throw new BadRequestException(`Unknown setting: ${key}`);
      if (typeof value !== 'string') throw new BadRequestException(`${key} must be a string`);
      if (value.length > field.maxLength) {
        throw new BadRequestException(`${field.label} is too long (max ${field.maxLength})`);
      }
    }

    for (const [key, value] of entries) {
      const trimmed = value.trim();
      await this.prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: trimmed },
        update: { value: trimmed },
      });
    }

    return this.getAll();
  }
}

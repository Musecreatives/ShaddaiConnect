/** Real icons for real links only — admin-configured via Site Content → Social links
 * (apps/api/src/site-settings/site-settings.service.ts's social_* fields). A platform with no
 * URL set is simply omitted, never shown with a placeholder/dead link. */

const ICON_PROPS = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'currentColor' } as const;

function FacebookIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.5.44a5 5 0 0 1 1.8 1.2 5 5 0 0 1 1.2 1.8c.2.5.4 1.3.4 2.5.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.44 2.5a5.1 5.1 0 0 1-2.99 3 6.4 6.4 0 0 1-2.5.43c-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07a6.4 6.4 0 0 1-2.5-.44 5.1 5.1 0 0 1-2.99-2.99 6.4 6.4 0 0 1-.43-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .44-2.5A5.1 5.1 0 0 1 5.7 1.6c.5-.2 1.3-.4 2.5-.44C9.5 1.1 9.9 1.1 12 1.1Zm0 3.1a5.7 5.7 0 1 0 0 11.4 5.7 5.7 0 0 0 0-11.4Zm0 9.4a3.7 3.7 0 1 1 0-7.4 3.7 3.7 0 0 1 0 7.4Zm5.9-9.6a1.3 1.3 0 1 1-2.7 0 1.3 1.3 0 0 1 2.7 0Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18.9 2H22l-7.6 8.6L23 22h-6.6l-5.1-6.7L5.4 22H2.3l8.2-9.2L2 2h6.8l4.6 6.1L18.9 2Zm-1.2 18h1.7L7.5 4H5.7L17.7 20Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8.3 18.5H5.7V9.7h2.6v8.8ZM7 8.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11.5 9.9h-2.6v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.4H10V9.7h2.5v1.2h.03c.35-.66 1.2-1.36 2.5-1.36 2.7 0 3.2 1.76 3.2 4.05v4.9Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M16.7 2h-3.3v13.6a2.8 2.8 0 1 1-2-2.7v-3.4a6.2 6.2 0 1 0 5.3 6.1V9c1.2 1 2.8 1.6 4.6 1.6V7.3c-2.5 0-4.6-2-4.6-4.5V2Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

const PLATFORMS = [
  { key: 'social_facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'social_instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'social_x', label: 'X', Icon: XIcon },
  { key: 'social_linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'social_tiktok', label: 'TikTok', Icon: TikTokIcon },
] as const;

export function hasAnySocialLink(settings: Record<string, string>, whatsappNumber?: string): boolean {
  return Boolean(whatsappNumber) || PLATFORMS.some((p) => settings[p.key]?.trim());
}

export function SocialLinks({
  settings,
  whatsappNumber,
  className = '',
}: {
  settings: Record<string, string>;
  whatsappNumber?: string;
  className?: string;
}) {
  const links = PLATFORMS.filter((p) => settings[p.key]?.trim());
  if (links.length === 0 && !whatsappNumber) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {links.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={settings[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand-blue hover:text-brand-blue dark:border-line-dark dark:text-white dark:hover:border-brand-blue-light dark:hover:text-brand-blue-light"
        >
          <Icon />
        </a>
      ))}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand-blue hover:text-brand-blue dark:border-line-dark dark:text-white dark:hover:border-brand-blue-light dark:hover:text-brand-blue-light"
        >
          <WhatsAppIcon />
        </a>
      )}
    </div>
  );
}

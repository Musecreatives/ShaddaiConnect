# Shaddai Design System

One visual language across three surfaces: the pfSense portal login page (static), the customer buy site (Next.js), and the admin console (Next.js). The customer surfaces are warm and simple; admin is denser but uses the same tokens.

---

## 1. Brand essence

- **Voice:** direct, warm, zero jargon. Customers are students/residents on phones. Short sentences. Naira always as ₦.
- **Signature motifs:**
  - **Voucher ticket** — dark card with perforated edge (side notches + dashed line), code in mono type. Used wherever a voucher is displayed.
  - **Signal meter** — 4 ascending bars; grey when idle, cyan when live. Used as status/decoration.

## 2. Color tokens

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#0D1B33` | Primary surface-dark, buttons, ticket background |
| `--navy-2` | `#12244A` | Navy hover/gradient partner |
| `--cyan` | `#18C7D8` | Brand accent, live states, focus rings |
| `--cyan-deep` | `#0E9AA8` | Accent text on light bg (contrast-safe) |
| `--cyan-tint` | `#E4F8FA` | Selected/hover fills |
| `--ink` | `#0D1321` | Body text |
| `--muted` | `#5B6478` | Secondary text |
| `--line` | `#E4E8F0` | Borders, dividers |
| `--bg` | `#F3F6FA` | App background |
| `--surface` | `#FFFFFF` | Cards |
| `--amber` | `#C9821F` | "Popular" badges, warnings |
| `--amber-tint` | `#FBF0DE` | Badge fill |
| `--danger` | `#D8455F` | Errors, destructive |
| `--danger-tint` | `#FBE7EB` | Error fill |
| `--success` | `#149E7C` | Paid/active states |
| `--success-tint` | `#E2F5EF` | Success fill |

Rules: cyan on navy or as accents only — never cyan body text on white (fails contrast; use `--cyan-deep`). One accent per component.

## 3. Typography

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headings | **Space Grotesk** | 500/600/700 | h1 23–28px, tight line-height 1.25 |
| Body / UI | **Inter** | 400/500/600/700 | 13.5–15px body |
| Codes / data / money | **JetBrains Mono** | 500/700 | Voucher codes, prices, MACs, timers |

- Voucher codes: mono, 19–22px, `letter-spacing: 0.1em+`, uppercase, centered.
- Web apps: self-host via `next/font/local` (also avoids external requests). Portal login page: system fallbacks only (no internet pre-auth).
- Eyebrow labels: mono 10.5px uppercase `letter-spacing: 0.09em`, `--cyan-deep`.

## 4. Spacing, radius, elevation

- Spacing scale: 4 / 8 / 12 / 16 / 22 / 28 / 36 px.
- Radius: inputs & buttons **13px**, cards **16px**, page cards/phone frame **22–28px**, pills **99px**.
- Shadow (cards): `0 1px 2px rgba(13,19,33,.04), 0 22px 44px -14px rgba(13,19,33,.20)`.
- Borders: `1.5px solid var(--line)`; dashed for secondary/affordance rows.

## 5. Core components

**Buttons**
- Primary: navy bg, white text, 700, radius 13, full-width on mobile; hover → navy-2; active scale .985; disabled opacity .35.
- Ghost: 1.5px `--line` border, ink text; hover border-cyan.
- Destructive: danger bg only for irreversible actions with confirm.

**Inputs** — 13–15px padding, radius 12–13, border `--line`, focus border `--cyan` (no default outline). Code entry variant: mono, centered, uppercase, letter-spaced.

**Plan card** — bordered row: mini signal bars + name/meta left, mono price right; selected = cyan border + `--cyan-tint` fill; optional amber "Popular" pill.

**Voucher ticket** — navy card, radius 16; top: label + mono code + live signal meter; perforation: dashed divider with `--bg`-colored side notches (::before/::after circles); bottom: plan/expiry + QR (white tile).

**Status badges** — pill, 9.5–10.5px, 700, uppercase: unused=muted/line, active=success, expired=amber, disabled=danger.

**Summary card** — `--bg` fill, radius 14, label/value rows, total row separated by dashed line, mono values.

**Tables (admin)** — surface bg, `--line` row dividers, mono for codes/amounts/MACs, sticky header, 13px cells.

## 6. Layout

- Customer: single column, max-width 400–430px, centered; generous padding (22–28px); one primary action per screen, pinned near bottom.
- Admin: sidebar (navy, cyan active indicator) + content on `--bg`; stat cards row → tables/charts below.

## 7. Tailwind mapping (paste into `tailwind.config.ts` theme.extend)

```ts
colors: {
  navy: { DEFAULT: '#0D1B33', 2: '#12244A' },
  cyan: { DEFAULT: '#18C7D8', deep: '#0E9AA8', tint: '#E4F8FA' },
  ink: '#0D1321',
  muted: '#5B6478',
  line: '#E4E8F0',
  page: '#F3F6FA',
  amber: { DEFAULT: '#C9821F', tint: '#FBF0DE' },
  danger: { DEFAULT: '#D8455F', tint: '#FBE7EB' },
  success: { DEFAULT: '#149E7C', tint: '#E2F5EF' },
},
fontFamily: {
  display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
},
borderRadius: { btn: '13px', card: '16px', frame: '22px' },
```

Shared UI (ticket, plan card, badges, signal meter) lives in `packages/ui` and is imported by both Next.js apps so customer and admin never drift.

## 8. Content rules

- Prices: `₦700` (mono). Durations: "30 minutes", "24 hours", "7 days".
- Time display: Africa/Lagos; relative where helpful ("Expires in 3 h 12 m").
- Errors: say what happened + what to do ("That code isn't valid. Check the dashes, or buy a new plan below.").
- Never expose internals (RADIUS, NAS, SQL) in customer-facing text.

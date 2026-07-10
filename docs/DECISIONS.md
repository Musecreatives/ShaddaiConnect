# Decisions log

Chronological record of non-obvious technical choices. Add an entry whenever a choice isn't
forced by the spec in CLAUDE.md / docs/*.

## Phase 0 — Repo & tooling

**Monorepo tool: pnpm workspaces.**
`pnpm-workspace.yaml` at root lists `apps/*` and `packages/*`. Chosen over npm workspaces for
faster installs and stricter node_modules (catches phantom dependencies). No Turborepo/Nx yet —
three apps don't need a build-graph tool; add one later if `pnpm -r build` gets slow.

**Package names: `@shaddai/api`, `@shaddai/customer`, `@shaddai/admin`, `@shaddai/ui`.**
Nest CLI and create-next-app both default to unscoped names (`api`, `customer`, `admin`); renamed
to a shared scope so `pnpm --filter @shaddai/x` is unambiguous and matches `@shaddai/ui`.

**Dev ports: api `3000`, customer `3001`, admin `3002`.**
create-next-app defaults both Next apps to 3000, which collides with Nest's default. Ports are
pinned in each app's `dev`/`start` script rather than left to `next dev`'s auto-increment, so the
port is predictable in docs/scripts/`.env` files.

**ESLint: kept each app's generated flat config, not a hand-unified one.**
Nest CLI generates `typescript-eslint` + `eslint-plugin-prettier`; create-next-app generates
`eslint-config-next` (which bundles its own TS rules). Both are already strict and idiomatic for
their framework; forcing a single shared flat config across Nest and Next App Router fights both
tools for no real benefit at this stage. What *is* shared: a single root `.prettierrc.json` —
removed the per-app `.prettierrc` Nest generated so there's one source of truth for formatting.

**Tailwind v4, CSS-first theme (not `tailwind.config.ts`).**
create-next-app scaffolded Tailwind v4, which configures via CSS `@theme` rather than a JS config
file. DESIGN-SYSTEM.md §7 shows a v3-style `theme.extend` object — translated 1:1 into
`packages/ui/src/theme.css` (see below) using v4 `@theme` syntax. Same tokens, different syntax.

**Shared design tokens: `packages/ui/src/theme.css`, imported via `@import "@shaddai/ui/theme.css"`.**
Both apps' `globals.css` do `@import "tailwindcss"; @import "@shaddai/ui/theme.css";`. Works
because pnpm workspaces symlink `@shaddai/ui` into each app's `node_modules`, and Tailwind v4
resolves `@import` through normal Node resolution. Each app's `next.config.ts` sets
`transpilePackages: ['@shaddai/ui']` so Next compiles the shared package's TSX instead of treating
it as pre-built.

**Fonts: `next/font/google`, not `next/font/local` — TEMPORARY, needs revisiting.**
DESIGN-SYSTEM.md §3 specifies self-hosting via `next/font/local` with vendored font files
(Space Grotesk, Inter, JetBrains Mono). No font binaries are checked into the repo. Using
`next/font/google` in `packages/ui/src/fonts.ts` instead: still build-time self-hosted with zero
runtime requests to Google, so it satisfies the *behavioral* requirement, but it's not what the
doc says to do. **Follow-up:** source the actual font files (open licenses — OFL) and swap
`fonts.ts` to `localFont()`, keeping the same `variable` names (`--font-space-grotesk`,
`--font-inter`, `--font-jetbrains`) so `theme.css` doesn't need to change.

**`packages/ui` exports both CSS tokens and React components.**
`Badge`, `SignalMeter`, `PlanCard`, `Ticket` are functional stubs (not empty placeholders) per
DESIGN-SYSTEM.md §5, exported from `src/index.ts` alongside the font instances. `Ticket`'s QR is a
`qrSlot` ReactNode prop, not baked in — the `qrcode` lib integration is Phase 3 scope.

**Nest API: global prefix `/api`, health check at `GET /api/health`.**
Matches the "API prefix `/api`" convention in CLAUDE.md. `AppController`'s default `getHello()`
was replaced with `getHealth()` returning `{ status: 'ok' }` (was Hello World boilerplate).

**Dev DB access: not yet decided.**
Phase 0 has no DB code (no ORM entities yet — that's Phase 1). SSH tunnel vs. local MariaDB
decision deferred to the start of Phase 1, when there's actually something to connect to.

## How to read this file
Newest entries go at the bottom, grouped under the phase they belong to. Don't retroactively edit
old entries when a decision is superseded — add a new entry noting the change and why.

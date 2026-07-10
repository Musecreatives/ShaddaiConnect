# Repo structure

pnpm workspace monorepo. See docs/DECISIONS.md for why things are set up this way.

```
shaddai-portal/
├── apps/
│   ├── api/            NestJS — voucher issuance, Paystack webhook, admin ops (port 3000)
│   │   ├── prisma/schema.prisma   Introspected from the live DB — see docs/DECISIONS.md
│   │   └── src/
│   │       ├── prisma/            PrismaService/PrismaModule (global)
│   │       ├── auth/              Admin JWT login (single env-configured admin user)
│   │       ├── plans/             GET /api/plans/public + /api/admin/plans CRUD
│   │       ├── vouchers/          VoucherService.issue/disable/enable/extend + admin routes
│   │       └── payments/          Paystack initialize/webhook/status
│   ├── customer/       Next.js App Router — public buy site (port 3001)
│   └── admin/          Next.js App Router — admin console (port 3002)
├── packages/
│   └── ui/             Shared design tokens (theme.css), fonts, stub components
│                       (Badge, SignalMeter, PlanCard, Ticket) — imported by both Next apps
├── docs/
│   ├── DESIGN-SYSTEM.md   Visual language spec — source of truth for tokens/components
│   ├── DECISIONS.md       Decision log, chronological, by phase
│   ├── STRUCTURE.md       This file
│   └── TODO.md            Build plan, phase by phase
├── docker/             (Phase 6) deployment compose files — not created yet
├── CLAUDE.md           Project context for Claude Code
├── pnpm-workspace.yaml
├── package.json        Root scripts: dev (all 3 apps via concurrently), build, lint, format
├── tsconfig.base.json  Shared strict TS compiler options — extended by each app/package
├── .prettierrc.json    Single shared Prettier config
└── .env.example        Root-level dev env vars (each app also has its own .env.example)
```

## Workspace package names

| Path | package.json name |
|---|---|
| `apps/api` | `@shaddai/api` |
| `apps/customer` | `@shaddai/customer` |
| `apps/admin` | `@shaddai/admin` |
| `packages/ui` | `@shaddai/ui` |

Run a single app's script with `pnpm --filter @shaddai/<name> <script>`.

## Adding a new domain module to the API

NestJS modules live under `apps/api/src/<domain>` (e.g. `vouchers`, `plans`, `payments`,
`sessions`, `auth`), one module per business domain per CLAUDE.md conventions. Use
`nest g module <domain>` from `apps/api`.

## Working with the Prisma schema

`apps/api/prisma/schema.prisma` is introspected, not hand-written — the live DB is the source of
truth. After a schema change lands on the server:

```
cd apps/api
pnpm db:pull      # re-introspects; preserves the @@map/@map renames already in the file
pnpm db:generate  # regenerates the Prisma Client (also runs automatically via postinstall)
```

Dev DB access is an SSH tunnel over Tailscale to the live server (see CLAUDE.md dev environment
notes) — `apps/api/.env`'s `DATABASE_URL` points at the forwarded `localhost:3306`.

## Adding a shared UI piece

Add the component to `packages/ui/src/components/`, export it from `packages/ui/src/index.ts`.
Both `customer` and `admin` already depend on `@shaddai/ui` as a workspace package and have
`transpilePackages: ['@shaddai/ui']` set — no build step needed, changes are picked up live in dev.

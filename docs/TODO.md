# Shaddai Portal — Build TODO

> Work top-to-bottom. Each phase ends with a testable milestone. Check items off as you go; add discovered tasks under the right phase rather than a new list.
>
> ✅ Already done (infra): MariaDB + schema live · FreeRADIUS auth working · pfSense captive portal zone + RADIUS tested end-to-end · portal login page HTML built · architecture plan + design system written.

---

## Phase 0 — Repo & tooling (½ day)
- [x] Init monorepo per `docs/STRUCTURE.md` (pnpm workspaces or npm workspaces — record choice in DECISIONS.md)
- [x] Move `CLAUDE.md`, `docs/*` into repo root; commit
- [x] `.gitignore` (node_modules, .env*, .next, dist), `.env.example` at root and per app
- [x] Prettier + ESLint shared config; TypeScript strict base tsconfig
- [x] Scaffold `apps/api` (Nest CLI), `apps/customer` + `apps/admin` (create-next-app, App Router, Tailwind)
- [x] `packages/ui`: tokens from DESIGN-SYSTEM §7 + fonts via next/font/local; export Ticket, PlanCard, Badge, SignalMeter stubs (fonts use next/font/google for now — see DECISIONS.md follow-up)
- [x] Dev DB access decided & working: SSH tunnel over Tailscale (`ssh -L 3306:127.0.0.1:3306 server@<tailscale-ip>`) OR local MariaDB seeded with `init.sql` — record in DECISIONS.md
- [x] **Milestone:** `pnpm dev` runs all three apps; api `/health` returns ok

## Phase 1 — API core: plans & voucher engine (2–3 days)
- [x] Pick ORM (Prisma or TypeORM) → DECISIONS.md; map existing tables EXACTLY (no destructive migrations — schema is live)
- [x] Entities/models: Plan, Voucher, Payment, Customer, Device, RadCheck, RadReply, RadAcct (radacct READ-ONLY) — introspected via `prisma db pull`, not hand-written
- [x] `GET /api/plans/public` (active plans)
- [x] Admin plans CRUD: `GET/POST/PATCH /api/admin/plans`
- [x] **VoucherService.issue(planId, opts)** — THE core:
  - [x] Code generator: `SHADDAI-` + 5 chars from safe alphabet; uniqueness check + retry
  - [x] Single transaction: vouchers row + radcheck (Cleartext-Password, Simultaneous-Use) + Expiration (monthly) / Session-Timeout radreply (hourly) + optional WISPr bandwidth
  - [x] Rollback-all on any failure; unit tests for both plan types
- [x] VoucherService.disable/enable/extend (keep radcheck in sync) — extend() is monthly-only, see DECISIONS.md
- [x] `POST /api/admin/vouchers` (single + `quantity` batch), `GET /api/admin/vouchers` (filter: status/plan/date), `PATCH /api/admin/vouchers/:id`
- [x] Admin auth: JWT login guard on `/api/admin/*` (single admin user via env for now)
- [ ] **Milestone:** issue a voucher via API → authenticate with it through pfSense Diagnostics → Access-Accept — verified radcheck/radreply rows are written correctly end-to-end against the live DB; the actual pfSense Diagnostics auth test needs the AP hardware and hasn't been run from here

## Phase 2 — Paystack (1–2 days)
- [x] Paystack TEST keys in `.env`; typed config module
- [x] `POST /api/payments/initialize` — create pending payment row → Paystack init → return authorization_url + reference
- [x] `POST /api/payments/paystack/webhook`:
  - [x] Raw-body capture (Nest: disable default JSON parse on this route) + HMAC-SHA512 `x-paystack-signature` verify — reject mismatches — used Nest's built-in `rawBody: true` instead of disabling the parser, see DECISIONS.md
  - [x] Idempotent on reference (unique constraint + upsert guard) — conditional `updateMany` claim, see DECISIONS.md
  - [x] On charge.success: mark payment success → VoucherService.issue → link voucher → store raw_payload
  - [x] Fast 200; log failures for replay
- [x] `GET /api/payments/:reference/status` (customer success-page polling) — also actively re-verifies with Paystack as a fallback if still pending
- [x] Local webhook testing route documented (Paystack CLI or manual curl with computed signature) — `apps/api/scripts/test-webhook.js`, run via `pnpm test:webhook <reference>`
- [ ] **Milestone:** test-mode payment → webhook → voucher exists → works via pfSense auth test — webhook → voucher flow verified end-to-end (incl. idempotent replay) with real Paystack TEST keys; the pfSense auth test needs the AP hardware

## Phase 3 — Customer buy site (2–3 days)
- [ ] Layout + fonts + tokens from packages/ui
- [ ] Landing: plan cards from `/api/plans/public` (design-system PlanCard, amber Popular badge)
- [ ] Checkout: optional phone/email → initialize → Paystack redirect/inline
- [ ] Success: poll status → render voucher Ticket (code + QR via `qrcode` lib) + "how to connect" steps + copy button
- [ ] (Optional) `GET /api/vouchers/:code/status` + "check my voucher" page
- [ ] Error/failed-payment states per content rules
- [ ] Mobile QA at 360–430px widths
- [ ] **Milestone:** full test purchase on phone browser → voucher on screen → code redeems

## Phase 4 — Admin console (2–3 days)
- [ ] Auth: login page → JWT (httpOnly cookie), guard all routes
- [ ] Shell: navy sidebar (Dashboard, Vouchers, Plans, Payments, Sessions)
- [ ] Dashboard: `GET /api/admin/stats` — active sessions (radacct acctstoptime IS NULL), today/week revenue, vouchers issued, data used
- [ ] Vouchers: table (code mono, plan, status badge, created/expires) + create modal (plan, qty) + disable/extend actions + printable batch view (tickets grid for agent sales)
- [ ] Plans: CRUD forms (price, type, duration, devices, caps)
- [ ] Payments: table from payments (+ Paystack reference deep-link)
- [ ] Sessions: `GET /api/admin/sessions` — live (stop IS NULL) + history; show user, MAC, IP, start, duration, in/out octets (invert per pfSense setting)
- [ ] **Milestone:** admin creates a batch of 5 vouchers, prints tickets, monitors a live session

## Phase 5 — pfSense integration polish (½–1 day)
- [ ] Replace `BUYSITE_URL` in portal login page with real domain; re-upload to pfSense
- [ ] Walled garden — Captive Portal → Allowed Hostnames: buy-site domain + Paystack domains (verify current list from Paystack docs: paystack.com, api.paystack.co, checkout.paystack.com, js.paystack.co, + asset/CDN hosts) + SMS provider if used
- [ ] Enable HTTPS login on portal (cert) before real launch
- [ ] Upload custom Auth Error page (must include `$PORTAL_MESSAGE$`) styled to match
- [ ] **Milestone (needs AP hardware):** unauthenticated phone → portal → tap Buy → pays → returns → enters code → online

## Phase 6 — Deployment (1–2 days)
- [ ] Dockerfiles: api (node:22-alpine multi-stage), customer + admin (Next standalone output)
- [ ] `docker/docker-compose.portal.yml`: 3 services, env_file, mem_limits, restart unless-stopped; join existing host setup (API reaches MariaDB at 127.0.0.1:3306 → use network_mode host for api OR publish and use host-gateway — decide & record)
- [ ] Public exposure of buy site — decide: Cloudflare Tunnel (recommended under Starlink CGNAT) vs port-forward; wire domain + TLS
- [ ] Paystack webhook URL updated to public endpoint (still TEST keys)
- [ ] Backups: nightly `mariadb-dump` of radius DB to dated file (cron on host); test a restore once
- [ ] Uptime/monitoring hooks into existing Grafana/Prometheus if desired
- [ ] **Milestone:** everything runs as containers on the server; laptop closed, system still works

## Phase 7 — Hardening & launch prep (ongoing)
- [ ] Rate-limit public endpoints (initialize, voucher status)
- [ ] Input validation everywhere (class-validator DTOs); no raw SQL string interp
- [ ] Voucher expiry sweeper: cron marking expired vouchers + cleaning stale radcheck (status sync)
- [ ] Audit log for admin actions (who disabled/extended what)
- [ ] Switch Paystack to LIVE keys; real tier prices from survey into plans table
- [ ] Load sanity: 30–50 concurrent portal auths (matches hostel scale)
- [ ] Runbook: docs/RUNBOOK.md — restart order, common failures (bridge, hotspot-era notes), backup/restore
- [ ] **Milestone:** first paying customer on launch day 🎉

---

## Parking lot (not now)
- SMS delivery of codes (provider + walled-garden domain)
- Customer accounts / repeat-purchase wallet
- Reseller/agent portal with commission tracking
- Multi-site support (FriendZone node stats per AP via Called-Station-Id)
- Data-cap plans (pfSense-Max-Total-Octets reply attribute)

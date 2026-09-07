# CLAUDE.md — Shaddai Portal Project Context

This file gives Claude Code the context it needs to work on this project effectively. Read this before making changes.

## What this project is

Voucher management portal for **Shaddai Comm Ventures**, a community WiFi hotspot business in Ugbowo BDPA Estate, Benin City, Nigeria. Customers buy time-based internet vouchers (Flutterwave), redeem them on a pfSense captive portal, and are authenticated via FreeRADIUS backed by MariaDB.

Three apps in this monorepo:
- `apps/api` — **NestJS** API (voucher issuance, Flutterwave webhook, admin ops)
- `apps/customer` — **Next.js** public buy site (plan selection → Flutterwave → voucher code + QR)
- `apps/admin` — **Next.js** admin console (manual vouchers, sessions, revenue, plans)

## Infrastructure that ALREADY EXISTS (do not recreate)

Running on an Ubuntu server (KVM host, Docker). All tested end-to-end:

| Component | Detail |
|---|---|
| MariaDB 11.4 | Docker container `shaddai-mariadb`, bound to `127.0.0.1:3306` on the server. DB `radius`, user `radius`. Schema below is LIVE. |
| FreeRADIUS 3.2 | Docker container `shaddai-freeradius`, `network_mode: host`. Auths vouchers from MariaDB. `require_message_authenticator = no` for pfSense client. |
| pfSense CE 2.7.2 | VM. Captive portal zone `shaddai` on LAN (192.168.1.1), RADIUS auth + accounting against FreeRADIUS at 192.168.1.10:1812/1813, protocol PAP. |
| Portal login page | Custom HTML (voucher code + QR + buy link) uploaded to pfSense. Voucher code goes into BOTH `auth_user` and `auth_pass`. |

## Database schema (LIVE — source of truth)

FreeRADIUS standard tables: `radcheck`, `radreply`, `radgroupcheck`, `radgroupreply`, `radusergroup`, `radacct`, `radpostauth`, `nas`.

Business tables:
- `plans(id, name, plan_type enum('hourly','monthly'), price_naira, duration_hours, validity_days, simultaneous_use, data_cap_mb, bandwidth_down_kbps, bandwidth_up_kbps, active, created_at)`
- `vouchers(id, code UNIQUE, plan_id FK, customer_id, status enum('unused','active','expired','disabled'), simultaneous_use_override, amount_paid, created_at, activated_at, expires_at)`
- `payments(id, reference UNIQUE, voucher_id, plan_id, customer_id, amount_naira, status enum('pending','success','failed'), raw_payload, created_at)` — `reference` is OUR OWN generated id (`SHDI-<uuid>`), sent to the payment provider as its transaction reference; the provider never issues it. Renamed from `paystack_reference` 2026-09-02 when the provider switched to Flutterwave — the column was never conceptually Paystack-specific.
- `devices(id, voucher_id, mac_address, first_seen, last_seen)` — analytics only, NOT enforcement
- `customers(id, phone, email, name, created_at)`

## The core invariant: voucher == RADIUS user

A voucher is usable ONLY when its RADIUS rows exist. Issuing a voucher MUST be one DB transaction that writes:
1. `vouchers` row
2. `radcheck`: `(code, 'Cleartext-Password', ':=', code)` — username == password == code
3. `radcheck`: `(code, 'Simultaneous-Use', ':=', plan.simultaneous_use or override)`
4. Monthly plans: `radcheck` `(code, 'Expiration', ':=', '<formatted expiry>')`
5. Hourly plans: `radreply` `(code, 'Session-Timeout', ':=', seconds)` (or Max-All-Session for cumulative)
6. Optional shaping: `radreply` WISPr-Bandwidth-Max-Down/Up (bits per second)

Rollback ALL on any failure. Never leave a vouchers row without radcheck rows or vice versa. Disabling a voucher = delete/neutralize its radcheck rows AND set status.

## Voucher code format

`SHADDAI-XXXXX` — 5 chars from alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no O/0/I/1/L). Check DB uniqueness on insert; retry on collision. QR encodes the bare code or `?code=SHADDAI-XXXXX` URL param (portal page parses both).

## Flutterwave rules (non-negotiable)

**Switched from Paystack 2026-09-02** — different auth model, don't assume Paystack's rules carry over:
- Webhook handler MUST verify the `verif-hash` header against `FLUTTERWAVE_WEBHOOK_SECRET_HASH` — a **plain string comparison** (still timing-safe), NOT an HMAC. This is a value *we* choose and paste into Flutterwave's dashboard (Settings → Webhooks → Secret Hash); Flutterwave just echoes it back verbatim. Confirmed against Flutterwave's own webhook docs — don't "fix" this into an HMAC by analogy with Paystack, that would be wrong for this provider.
- Signature check alone is NOT sufficient to trust amount/status — Flutterwave's own guidance is to independently re-verify server-side via `GET /transactions/{id}/verify` (by Flutterwave's numeric id from the webhook payload, not by our `reference`) before issuing anything. `PaymentsService.handleWebhookEvent` does this.
- MUST be idempotent on `reference` — Flutterwave retries; never mint two vouchers for one reference.
- Respond 200 quickly; do heavy work after ack if needed.
- Secret key server-side only (NestJS env, `FLUTTERWAVE_SECRET_KEY`). This project uses the Standard/hosted checkout flow (API initializes server-side, hands back a redirect URL) — no public key is needed client-side, unlike Flutterwave's inline/widget checkout mode.
- Redirect query params differ from Paystack: Flutterwave appends `?status=...&tx_ref=...&transaction_id=...`, not `?reference=...` — the customer app's `/success` page reads `tx_ref`.
- Use Flutterwave TEST keys until launch.

## Dev environment notes (Windows + Claude Code)

- Dev machine is Windows; server is remote. MariaDB is bound to `127.0.0.1` on the SERVER, so local dev needs an SSH tunnel over Tailscale: `ssh -L 3306:127.0.0.1:3306 server@<tailscale-ip>` then connect to `localhost:3306`.
- Alternative: run a local MariaDB with the same schema for dev; point staging/prod at the server.
- Never commit `.env` files or secrets. `.env.example` documents required vars.
- Target deployment: Docker containers on the same Ubuntu host (compose file in `docker/`).

## Conventions

- TypeScript strict everywhere. NestJS modules per domain: `vouchers`, `plans`, `payments`, `sessions`, `auth`.
- DB access: TypeORM or Prisma (pick once in Phase 1, document in docs/DECISIONS.md).
- API prefix `/api`. Admin routes under `/api/admin/*`, guarded (JWT).
- Money: store as DECIMAL naira; display with ₦. Never float arithmetic on money.
- Design tokens in `docs/DESIGN-SYSTEM.md` — use them; don't invent new colors.
- Currency/locale: en-NG, Africa/Lagos timezone for display; store UTC.

## Infra boundaries

**Updated 2026-08-30, user-approved:** pfSense (192.168.1.1) integration is now in scope,
specifically to solve real-time device blocking — RADIUS CoA/Disconnect-Request is confirmed
**not implemented** by pfSense's Captive Portal (pfSense Redmine #13625, still open), so the
API's existing CoA-based disconnect (`CoaService`) can never actually kick an active session; it
only prevents a disabled voucher's *next* reconnect. The two mechanisms that do work, because
they're pfSense acting on its own state rather than an external RADIUS client asking it to:
- The captive portal's own MAC pass-through/deny list (Services → Captive Portal → zone → MACs) —
  enforced at the firewall level continuously, not just at login.
- The captive portal's native session table + disconnect action (Status → Captive Portal), which
  is what powers pfSense's own "Concurrent user logins: Last login" behavior.

Building on these from the API requires talking to pfSense itself — via its REST API package if
installed, or SSH otherwise. This is now allowed, but stay conservative: prefer the REST API over
raw SSH/config-file edits when both are possible, never touch pfSense's WAN-facing rules or
anything outside the captive portal / MACs scope without asking first, and treat any pfSense
change as live-production (same caution as a docker deploy — confirm before anything that could
disconnect real users or misconfigure the portal). The prior blanket "web UI only, never touch it"
rule is superseded for this purpose; it still applies to anything outside captive-portal device
management (e.g. don't touch WAN/firewall rules, VPN, or other services on pfSense).

The API's other infra dependency, MariaDB, is still only reached via the documented SSH tunnel —
unchanged.

## What NOT to do

- Do not modify the FreeRADIUS or MariaDB container configs from this repo — infra is managed on the server (`~/shaddai-billing`).
- Do not write to `radacct` (FreeRADIUS owns it; API reads only).
- MAC-based enforcement was historically restricted to RADIUS-level effects (disabling a voucher's radcheck rows) with one scoped exception (`VoucherActivationService.blockRepeatTrialDevices`, added 2026-08-06 — disables a newly-activated Free Trial voucher on MAC reuse). **Extended 2026-08-30, user-approved:** the admin "Block device" action (and the trial-reuse guard) may now also push the MAC to pfSense's captive portal deny list (see Infra boundaries above), since that's the only mechanism that actually blocks a device in real time rather than just preventing the next voucher reconnect. This is still narrowly scoped to abuse/blocklist enforcement, not a general license to key access control off MAC anywhere else.
- Do not put the Flutterwave secret key/webhook secret hash, DB passwords, or RADIUS shared secret in code or docs.

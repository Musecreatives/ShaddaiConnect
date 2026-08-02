# CLAUDE.md — Shaddai Portal Project Context

This file gives Claude Code the context it needs to work on this project effectively. Read this before making changes.

## What this project is

Voucher management portal for **Shaddai Comm Ventures**, a community WiFi hotspot business in Ugbowo BDPA Estate, Benin City, Nigeria. Customers buy time-based internet vouchers (Paystack), redeem them on a pfSense captive portal, and are authenticated via FreeRADIUS backed by MariaDB.

Three apps in this monorepo:
- `apps/api` — **NestJS** API (voucher issuance, Paystack webhook, admin ops)
- `apps/customer` — **Next.js** public buy site (plan selection → Paystack → voucher code + QR)
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
- `payments(id, paystack_reference UNIQUE, voucher_id, plan_id, customer_id, amount_naira, status enum('pending','success','failed'), raw_payload, created_at)`
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

## Paystack rules (non-negotiable)

- Webhook handler MUST verify `x-paystack-signature` (HMAC-SHA512 of RAW request body with secret key) before trusting anything.
- MUST be idempotent on `paystack_reference` — Paystack retries; never mint two vouchers for one reference.
- Respond 200 quickly; do heavy work after ack if needed.
- Secret key server-side only (NestJS env). Frontend gets public key only.
- Use Paystack TEST keys until launch.

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

Never attempt to SSH into, reconfigure, or enable services on the pfSense VM
(192.168.1.1). pfSense is managed manually via its web UI only. The API's
only infra dependency is MariaDB via the documented SSH tunnel.

## What NOT to do

- Do not modify the FreeRADIUS or MariaDB container configs from this repo — infra is managed on the server (`~/shaddai-billing`).
- Do not write to `radacct` (FreeRADIUS owns it; API reads only).
- Do not use MAC addresses for enforcement (Simultaneous-Use is the mechanism; MACs are analytics).
- Do not put the Paystack secret key, DB passwords, or RADIUS shared secret in code or docs.

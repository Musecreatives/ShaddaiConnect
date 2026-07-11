-- APPLIED to the live DB on 2026-07-11, after showing this exact SQL to the user and getting
-- explicit confirmation. Kept here as a record of what ran and why, not a proposal anymore.
--
-- Adds support for multiple admin logins (previously a single hardcoded admin via
-- ADMIN_EMAIL/ADMIN_PASSWORD env vars — see docs/DECISIONS.md Phase 1/4 entries).
--
-- Design:
--   - Additive only: does not touch any existing table, no data migration needed.
--   - The env-configured admin keeps working as a permanent "root" account after this lands —
--     AuthService will accept EITHER the env credentials OR a matching active admin_users row,
--     so there's no lockout risk if this table is ever empty or misconfigured.
--   - Passwords hashed with bcrypt (bcryptjs — pure JS, no native build step on Windows dev).
--   - No roles/permissions tiers — every admin_users row has equal access, matching the current
--     single-admin model (all endpoints already guarded the same way for the one admin).
--     Add roles later only if actually needed; not building it speculatively now.
--
-- Follow-up work, all done and verified (see docs/DECISIONS.md):
--   1. Re-introspected via `prisma db pull`, renamed admin_users -> AdminUser/passwordHash/etc.
--      via @@map/@map (confirmed renames survive re-pull, same as every other model).
--   2. AuthService.login checks admin_users (bcryptjs.compare) in addition to the env fallback.
--   3. POST/GET /api/admin/admins + PATCH .../:id (activate/deactivate) — guarded like every
--      other /api/admin/* route.
--   4. Admin Settings > Team section: list of admins, "+ Add admin" form.
-- All verified end-to-end against the live DB: created a real admin, logged in as it, wrong
-- password rejected, disabled it and confirmed login then failed, duplicate email rejected,
-- short password rejected by validation. Test rows cleaned up afterward.

CREATE TABLE admin_users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(128) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(128) DEFAULT NULL,
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PROPOSAL — NOT YET APPLIED. Do not run this against the live DB without explicit sign-off.
--
-- Adds support for multiple admin logins (currently a single hardcoded admin via
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
-- After this runs, the plan is:
--   1. `pnpm --filter @shaddai/api db:pull` to introspect this table into schema.prisma
--      (apply the usual @@map/@map PascalCase/camelCase renames — see docs/DECISIONS.md
--      on why re-introspection preserves those).
--   2. Add bcryptjs, update AuthService.login to check admin_users (bcrypt.compare) in addition
--      to the env fallback.
--   3. Add POST /api/admin/admins (create), GET /api/admin/admins (list), PATCH .../:id
--      (deactivate) — guarded the same as every other /api/admin/* route.
--   4. Admin Settings > Team page: list of admins, "+ Add admin" form (email + temp password).

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

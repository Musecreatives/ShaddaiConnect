-- Journal/Media CMS tables (Categories, Posts, Media Library) — 2026-09-06.
--
-- This project applies schema changes directly to the live MariaDB (see package.json:
-- db:pull/db:generate — there is no `prisma migrate` history), and the dev machine only reaches
-- the DB through the SSH tunnel documented in CLAUDE.md. Run this by hand against the server:
--
--   ssh -L 3306:127.0.0.1:3306 server@<tailscale-ip>   # from a separate terminal, kept open
--   mysql -h 127.0.0.1 -u radius -p radius < apps/api/prisma/manual-migrations/2026-09-06-add-journal-cms.sql
--
-- Then run `pnpm --filter @shaddai/api db:generate` to regenerate the Prisma Client (already
-- done once against the schema alone in this change, but re-run after applying this against a
-- real database to confirm `prisma db pull` agrees with schema.prisma).

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL,
  `excerpt` VARCHAR(300) NULL,
  `body` TEXT NOT NULL,
  `status` ENUM('draft','review','scheduled','published') NOT NULL DEFAULT 'draft',
  `category_id` INT UNSIGNED NULL,
  `featured_image` VARCHAR(300) NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `author_name` VARCHAR(128) NULL,
  `publish_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `status` (`status`),
  CONSTRAINT `fk_post_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(255) NOT NULL,
  `path` VARCHAR(300) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size` INT UNSIGNED NOT NULL,
  `width` INT UNSIGNED NULL,
  `height` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

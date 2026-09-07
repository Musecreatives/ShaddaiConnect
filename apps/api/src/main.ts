import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

/**
 * `JSON.stringify` throws on BigInt, and this schema has several BigInt columns —
 * `plans.data_cap_mb` plus radacct's octet counters — so any endpoint returning one of those rows
 * raw dies with "Do not know how to serialize a BigInt". That stayed hidden while every plan had
 * a NULL data cap; the moment a real cap was set, GET /api/admin/vouchers (which does
 * `include: { plan: true }`) started 500ing and took the whole admin dashboard down (2026-08-31).
 *
 * Serialising as Number rather than String keeps the JSON shape the admin/customer apps already
 * expect for these fields. Precision is a non-issue here: the largest of them is a byte counter,
 * and Number stays exact to 9 petabytes.
 */
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (this: bigint) {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  // Uploaded images (site-settings CMS fields) — served at /uploads, deliberately outside the
  // /api prefix so it reads as a plain static asset path, not a JSON endpoint. Global prefix only
  // applies to controller routes, not this Express static middleware. multer's diskStorage
  // (site-settings.controller.ts) doesn't create its destination directory itself, and this needs
  // to survive container recreates, hence the docker-compose volume mount at this same path.
  const uploadsDir = join(__dirname, '..', 'uploads');
  mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });
  // contentSecurityPolicy is meaningful for HTML responses; this is a pure JSON API, so it's
  // disabled rather than left to produce a header no browser here ever acts on. The rest of
  // helmet's defaults (X-Content-Type-Options, X-Frame-Options, etc.) still apply.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Client components in the customer/admin apps fetch this API directly from the browser
  // (Server Components fetching server-side aren't subject to this — only the browser-side
  // calls need it). Defaults cover local dev; override via CORS_ORIGINS for staging/prod.
  // credentials: true is required for the admin app's httpOnly JWT cookie to be sent/received
  // cross-origin (different port = different origin, even though the cookie itself is
  // host-scoped and shared across ports on localhost).
  const origins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [
    'http://localhost:3001',
    'http://localhost:3002',
  ];
  app.enableCors({ origin: origins, credentials: true });

  // Nest doesn't log per-request access by default — only route registration at startup.
  // Added to make CORS/network issues (silently-blocked browser requests never reach the
  // handler at all) visible from the server side instead of guesswork.
  const logger = new Logger('HTTP');
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms — Origin: ${req.headers.origin ?? '(none)'}`,
      );
    });
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

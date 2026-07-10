import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
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
  const origins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [
    'http://localhost:3001',
    'http://localhost:3002',
  ];
  app.enableCors({ origin: origins });

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

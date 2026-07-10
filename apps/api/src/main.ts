import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

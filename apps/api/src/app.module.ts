import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlansModule } from './plans/plans.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { StatsModule } from './stats/stats.module';
import { SessionsModule } from './sessions/sessions.module';
import { CustomersModule } from './customers/customers.module';
import { NetworkModule } from './network/network.module';
import { SettingsModule } from './settings/settings.module';
import { TrialModule } from './trial/trial.module';
import { EmailModule } from './email/email.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Baseline for every route; individual public-facing endpoints (login, payment
    // initialize, voucher/payment status lookups) set a stricter @Throttle override —
    // see docs/DECISIONS.md for which ones and why.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    PlansModule,
    VouchersModule,
    PaymentsModule,
    StatsModule,
    SessionsModule,
    CustomersModule,
    NetworkModule,
    SettingsModule,
    TrialModule,
    EmailModule,
    WaitlistModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

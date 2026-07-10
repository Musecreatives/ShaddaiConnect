import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const CONNECT_RETRY_ATTEMPTS = 5;
const CONNECT_RETRY_DELAY_MS = 2000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Dev DB access is an SSH tunnel that can drop and take a moment to notice/reconnect (see
   * docs/DECISIONS.md). Without a retry here, catching the tunnel down at the exact moment the
   * API boots crashes the whole process instead of just waiting a few seconds and trying again.
   */
  async onModuleInit() {
    for (let attempt = 1; attempt <= CONNECT_RETRY_ATTEMPTS; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Connected to database');
        return;
      } catch (err) {
        if (attempt === CONNECT_RETRY_ATTEMPTS) throw err;
        this.logger.warn(
          `Database connection attempt ${attempt}/${CONNECT_RETRY_ATTEMPTS} failed, retrying in ${CONNECT_RETRY_DELAY_MS}ms…`,
        );
        await new Promise((resolve) => setTimeout(resolve, CONNECT_RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

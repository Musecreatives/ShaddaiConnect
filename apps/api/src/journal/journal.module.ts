import { Module } from '@nestjs/common';
import { AdminJournalController } from './admin-journal.controller';
import { PublicJournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  controllers: [PublicJournalController, AdminJournalController],
  providers: [JournalService],
})
export class JournalModule {}

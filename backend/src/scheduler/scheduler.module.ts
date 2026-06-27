import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [ContactModule],
  providers: [CleanupService],
})
export class SchedulerModule {}

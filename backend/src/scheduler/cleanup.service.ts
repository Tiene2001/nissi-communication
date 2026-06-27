import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private contactService: ContactService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredMessages() {
    this.logger.log('Cron: démarrage nettoyage des messages expirés');
    await this.contactService.deleteExpired();
  }
}

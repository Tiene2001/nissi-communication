import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController, AdminClientsController } from './clients.controller';

@Module({
  controllers: [ClientsController, AdminClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}

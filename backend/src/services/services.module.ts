import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController, AdminServicesController } from './services.controller';

@Module({
  controllers: [ServicesController, AdminServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}

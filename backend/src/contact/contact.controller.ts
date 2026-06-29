import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, SendOtpDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SseJwtGuard } from '../auth/guards/sse-jwt.guard';
import { Observable, map } from 'rxjs';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.contactService.sendOtp(dto.email);
  }

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @UseGuards(SseJwtGuard)
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.contactService.messageStream$.pipe(
      map((data) => ({ data: JSON.stringify(data) } as MessageEvent)),
    );
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/contact')
export class AdminContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}

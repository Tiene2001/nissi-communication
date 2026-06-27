import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get(':section')
  findOne(@Param('section') section: string) {
    return this.contentService.findBySection(section);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  findAll() {
    return this.contentService.findAll();
  }

  @Patch(':section')
  update(@Param('section') section: string, @Body() dto: UpdateContentDto) {
    return this.contentService.upsert(section, dto);
  }
}

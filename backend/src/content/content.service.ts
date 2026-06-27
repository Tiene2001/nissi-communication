import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pageContent.findMany({ orderBy: { section: 'asc' } });
  }

  async findBySection(section: string) {
    const content = await this.prisma.pageContent.findUnique({ where: { section } });
    if (!content) throw new NotFoundException(`Section "${section}" non trouvée`);
    return content;
  }

  async upsert(section: string, dto: UpdateContentDto) {
    return this.prisma.pageContent.upsert({
      where: { section },
      update: { data: dto.data },
      create: { section, data: dto.data },
    });
  }
}

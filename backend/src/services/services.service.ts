import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const last = await this.prisma.service.findFirst({ orderBy: { order: 'desc' } });
    return this.prisma.service.create({ data: { ...dto, order: (last?.order ?? 0) + 1 } });
  }

  async update(id: string, dto: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}

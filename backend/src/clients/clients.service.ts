import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client non trouvé');
    return client;
  }

  async create(dto: CreateClientDto) {
    const last = await this.prisma.client.findFirst({ orderBy: { order: 'desc' } });
    return this.prisma.client.create({ data: { ...dto, order: (last?.order ?? 0) + 1 } });
  }

  async update(id: string, dto: UpdateClientDto) {
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}

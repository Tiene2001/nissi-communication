import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email déjà utilisé');

    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, password: hash, role: dto.role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const dtoAny = dto as any;
    const data: any = { ...dto };
    if (dtoAny.password) {
      data.password = await bcrypt.hash(dtoAny.password as string, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }
}

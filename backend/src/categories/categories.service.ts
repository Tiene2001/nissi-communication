import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        _count: {
          projects: await this.prisma.project.count({ where: { category: cat.name } }),
        },
      })),
    );
  }

  async create(dto: { name: string; slug: string }) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: { name?: string; slug?: string }) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Catégorie non trouvée');
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Catégorie non trouvée');
    return this.prisma.category.delete({ where: { id } });
  }
}

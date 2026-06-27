import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublished() {
    return this.prisma.project.findMany({
      where: { published: true },
      include: { media: { orderBy: { order: 'asc' } } },
      orderBy: { date: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: { media: { orderBy: { order: 'asc' } } },
    });
    if (!project) throw new NotFoundException('Projet non trouvé');
    return project;
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: { media: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateProjectDto) {
    const slug = slugify(dto.title);
    return this.prisma.project.create({
      data: { ...dto, slug, date: new Date(dto.date) },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const dtoAny = dto as any;
    const data: any = { ...dto };
    if (dtoAny.title) data.slug = slugify(dtoAny.title);
    if (dtoAny.date) data.date = new Date(dtoAny.date);
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async addMedia(projectId: string, url: string, type: string, order: number) {
    return this.prisma.media.create({
      data: { url, type: type as any, order, projectId },
    });
  }

  async removeMedia(mediaId: string) {
    return this.prisma.media.delete({ where: { id: mediaId } });
  }

  async replaceMedia(projectId: string, items: { url: string; type: string; order: number }[]) {
    await this.prisma.media.deleteMany({ where: { projectId } });
    if (items.length === 0) return [];
    return this.prisma.media.createMany({
      data: items.map(m => ({ ...m, type: m.type as any, projectId })),
    });
  }
}

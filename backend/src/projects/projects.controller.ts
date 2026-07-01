import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAllPublished();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/media')
  addMedia(
    @Param('id') id: string,
    @Body() body: { url: string; type: string; order: number },
  ) {
    return this.projectsService.addMedia(id, body.url, body.type, body.order);
  }

  @Post(':id/media/replace')
  @HttpCode(HttpStatus.OK)
  replaceMedia(
    @Param('id') id: string,
    @Body() body: { items: { url: string; type: string; order: number }[] },
  ) {
    return this.projectsService.replaceMedia(id, body.items ?? []);
  }

  @Delete(':id/media/:mediaId')
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.projectsService.removeMedia(mediaId);
  }
}

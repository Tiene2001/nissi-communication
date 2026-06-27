import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'];
const MAX_FILE_SIZE_MB = 50;

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private config: ConfigService) {}

  saveFile(file: Express.Multer.File): { url: string } {
    const uploadDir = this.config.get('UPLOAD_DIR', './uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `Type de fichier non autorisé. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new BadRequestException(`Taille max : ${MAX_FILE_SIZE_MB}MB`);
    }

    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    this.logger.log(`Fichier uploadé : ${filename}`);

    return { url: `/uploads/${filename}` };
  }

  deleteFile(filename: string): void {
    const uploadDir = this.config.get('UPLOAD_DIR', './uploads');
    const filepath = path.join(uploadDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`Fichier supprimé : ${filename}`);
    }
  }
}

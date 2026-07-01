import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './dto/create-contact.dto';
import { Subject } from 'rxjs';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns/promises';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private messageSubject = new Subject<any>();
  public messageStream$ = this.messageSubject.asObservable();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Vérification MX (arrière-plan, invisible) ──────────────────────────────

  private async hasValidMx(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1];
      const records = await dns.resolveMx(domain);
      return records.length > 0;
    } catch {
      return false;
    }
  }

  // ── Contact ────────────────────────────────────────────────────────────────

  async create(dto: CreateContactDto) {
    const valid = await this.hasValidMx(dto.email);
    if (!valid) {
      throw new BadRequestException("L'adresse email fournie n'est pas valide.");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const message = await this.prisma.contactMessage.create({
      data: { ...dto, expiresAt },
    });

    this.messageSubject.next({
      type: 'new_message',
      data: { id: message.id, name: message.name, createdAt: message.createdAt },
    });

    this.sendEmailWithRetry(dto, 3).catch((err) =>
      this.logger.error('Échec définitif envoi email SMTP', err),
    );

    return { success: true };
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async markAsRead(id: string) {
    return this.prisma.contactMessage.update({ where: { id }, data: { read: true } });
  }

  async delete(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  async deleteExpired() {
    const result = await this.prisma.contactMessage.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Supprimé ${result.count} messages expirés`);
    return result;
  }

  // ── Email SMTP ─────────────────────────────────────────────────────────────

  private async sendEmailWithRetry(dto: CreateContactDto, maxRetries: number): Promise<void> {
    let lastError: Error = new Error('Aucune tentative effectuée');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendEmailNotification(dto);
        return;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Tentative SMTP ${attempt}/${maxRetries} échouée : ${(err as Error).message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }

  private async resolveNotifyEmails(): Promise<string[]> {
    try {
      const settings = await this.prisma.pageContent.findUnique({ where: { section: 'settings' } });
      const data = settings?.data as any;
      const emails = [
        data?.notificationEmail,
        data?.notificationEmail2,
        data?.notificationEmail3,
      ].filter((e): e is string => typeof e === 'string' && e.includes('@'));
      if (emails.length > 0) return emails;
    } catch { /* fallback */ }
    const fallback = this.config.get('NOTIFY_EMAIL');
    return fallback ? [fallback] : [];
  }

  private async sendEmailNotification(dto: CreateContactDto) {
    const port   = parseInt(this.config.get('SMTP_PORT') ?? '465', 10);
    const host   = this.config.get('SMTP_HOST');
    const user   = this.config.get('SMTP_USER');
    const secure = port === 465;
    const notifyEmails = await this.resolveNotifyEmails();
    if (notifyEmails.length === 0) return;
    const notifyEmail = notifyEmails.join(', ');

    this.logger.log(`SMTP → ${host}:${port} secure=${secure} from=${user} to=${notifyEmail}`);

    const transporter = nodemailer.createTransport({
      host, port, secure,
      auth: { user, pass: this.config.get('SMTP_PASS') },
    });

    await transporter.sendMail({
      from: this.config.get('SMTP_USER'),
      to:   notifyEmail,
      subject: `[NISSI] ${dto.subject || 'Nouveau message'} — ${dto.name}`,
      html: `<h2>Nouveau message de contact</h2>
             <p><strong>Nom :</strong> ${dto.name}</p>
             <p><strong>Email :</strong> ${dto.email}</p>
             <p><strong>Téléphone :</strong> ${dto.phone || 'N/A'}</p>
             ${dto.subject ? `<p><strong>Objet :</strong> ${dto.subject}</p>` : ''}
             <p><strong>Message :</strong></p><p>${dto.message}</p>`,
    });
  }
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './dto/create-contact.dto';
import { Subject } from 'rxjs';
import * as nodemailer from 'nodemailer';

interface OtpEntry { code: string; expiresAt: number; sentAt: number }

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private messageSubject = new Subject<any>();
  public messageStream$ = this.messageSubject.asObservable();
  private readonly otpStore = new Map<string, OtpEntry>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── OTP ────────────────────────────────────────────────────────────────────

  async sendOtp(email: string): Promise<void> {
    const existing = this.otpStore.get(email);
    if (existing && Date.now() - existing.sentAt < 60_000) {
      throw new BadRequestException('Un code a déjà été envoyé. Attendez 60 secondes.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60_000, sentAt: Date.now() });

    const port = parseInt(this.config.get('SMTP_PORT') ?? '465', 10);
    const transporter = nodemailer.createTransport({
      host:   this.config.get('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: { user: this.config.get('SMTP_USER'), pass: this.config.get('SMTP_PASS') },
    });

    await transporter.sendMail({
      from:    this.config.get('SMTP_USER'),
      to:      email,
      subject: '[NISSI Communication] Code de vérification',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#FF8000;margin:0 0 16px;">Vérification de votre email</h2>
          <p style="color:#333;margin:0 0 24px;">
            Pour valider votre demande de contact, entrez le code ci-dessous :
          </p>
          <div style="font-size:2.2rem;font-weight:900;letter-spacing:0.6em;padding:24px;
                      background:#f5f5f5;text-align:center;border-left:4px solid #FF8000;">
            ${code}
          </div>
          <p style="color:#888;font-size:0.82rem;margin:16px 0 0;">
            Ce code est valable <strong>10 minutes</strong>. Ne le partagez pas.
          </p>
        </div>
      `,
    });

    this.logger.log(`OTP envoyé à ${email}`);
  }

  private consumeOtp(email: string, otp: string): boolean {
    const entry = this.otpStore.get(email);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) { this.otpStore.delete(email); return false; }
    if (entry.code !== otp) return false;
    this.otpStore.delete(email);
    return true;
  }

  // ── Contact ────────────────────────────────────────────────────────────────

  async create(dto: CreateContactDto) {
    if (!this.consumeOtp(dto.email, dto.otp)) {
      throw new BadRequestException('Code de vérification invalide ou expiré.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const message = await this.prisma.contactMessage.create({
      data: {
        name:    dto.name,
        email:   dto.email,
        phone:   dto.phone,
        subject: dto.subject,
        message: dto.message,
        expiresAt,
      },
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

  private async resolveNotifyEmail(): Promise<string> {
    try {
      const settings = await this.prisma.pageContent.findUnique({ where: { section: 'settings' } });
      const email = (settings?.data as any)?.notificationEmail;
      if (email && typeof email === 'string' && email.includes('@')) return email;
    } catch { /* fallback */ }
    return this.config.get('NOTIFY_EMAIL') ?? '';
  }

  private async sendEmailNotification(dto: CreateContactDto) {
    const port   = parseInt(this.config.get('SMTP_PORT') ?? '465', 10);
    const host   = this.config.get('SMTP_HOST');
    const user   = this.config.get('SMTP_USER');
    const secure = port === 465;
    const notifyEmail = await this.resolveNotifyEmail();

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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CommunicationOutcome } from '../enums/communication.enum';

/** Resultado do envio de um e-mail (alimenta o histórico de comunicações). */
export interface EmailSendResult {
  outcome: CommunicationOutcome;
  detail?: string | null;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('MAIL_HOST', 'localhost'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: config.get<string>('MAIL_SECURE', 'false') === 'true',
      auth: config.get<string>('MAIL_USER')
        ? { user: config.get<string>('MAIL_USER'), pass: config.get<string>('MAIL_PASSWORD') }
        : undefined,
      // Evita travar a requisição que disparou a notificação quando o SMTP não responde.
      connectionTimeout: 5_000,
      greetingTimeout: 5_000,
      socketTimeout: 15_000,
    });
  }

  /**
   * Envia um e-mail. Nunca lança: o resultado (enviado, falha ou desativado)
   * é retornado para ser registrado no histórico de comunicações.
   */
  async send(to: string, subject: string, body: string): Promise<EmailSendResult> {
    if (this.config.get<string>('MAIL_ENABLED', 'true') === 'false') {
      this.logger.log(`MAIL_ENABLED=false — e-mail não enviado para ${to}: ${subject}`);
      return { outcome: CommunicationOutcome.DISABLED, detail: 'Envio de e-mail desativado (MAIL_ENABLED=false)' };
    }

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM', 'noreply@empresa.com'),
        to,
        subject,
        html: body,
      });
      return { outcome: CommunicationOutcome.SENT };
    } catch (error) {
      const detail = (error as Error).message;
      this.logger.error(`Failed to send email to ${to}: ${detail}`);
      // Don't throw — notifications should work even if email fails
      return { outcome: CommunicationOutcome.FAILED, detail: detail.slice(0, 500) };
    }
  }
}

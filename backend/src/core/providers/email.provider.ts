import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM', 'noreply@empresa.com'),
        to,
        subject,
        html: body,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
      // Don't throw — password reset should work even if email fails
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  send(to: string, subject: string, body: string): void {
    this.logger.log(`Email queued for ${to}: ${subject}`);
    void body;
  }
}

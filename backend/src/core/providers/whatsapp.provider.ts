import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappProvider {
  private readonly logger = new Logger(WhatsappProvider.name);

  send(to: string, message: string): void {
    this.logger.log(`WhatsApp message queued for ${to}`);
    void message;
  }
}

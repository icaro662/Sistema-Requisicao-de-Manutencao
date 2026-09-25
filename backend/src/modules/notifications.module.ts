import { Module } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { EmailProvider } from '../core/providers/email.provider';
import { WhatsappProvider } from '../core/providers/whatsapp.provider';

@Module({
  providers: [NotificationsService, EmailProvider, WhatsappProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}

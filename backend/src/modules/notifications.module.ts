import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../models/location.entity';
import { Communication } from '../models/communication.entity';
import { Notification } from '../models/notification.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { ComunicacoesController } from '../controllers/comunicacoes.controller';
import { NotificationsController } from '../controllers/notifications.controller';
import { EmailProvider } from '../core/providers/email.provider';
import { NotificationsService } from '../services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition, Notification, Communication, User, Location])],
  controllers: [NotificationsController, ComunicacoesController],
  providers: [NotificationsService, EmailProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}

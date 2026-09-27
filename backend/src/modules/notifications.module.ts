import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisition } from '../models/requisition.entity';
import { NotificationsController } from '../controllers/notifications.controller';
import { NotificationsService } from '../services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

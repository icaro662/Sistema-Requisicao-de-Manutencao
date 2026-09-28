import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../models/category.entity';
import { Location } from '../models/location.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { RequisitionsController } from '../controllers/requisitions.controller';
import { RequisitionsService } from '../services/requisitions.service';
import { HistoryModule } from './history.module';
import { NotificationsModule } from './notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Requisition, Location, Category, User]),
    HistoryModule,
    NotificationsModule,
  ],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
  exports: [RequisitionsService],
})
export class RequisitionsModule {}

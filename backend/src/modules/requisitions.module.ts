import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../models/category.entity';
import { Location } from '../models/location.entity';
import { Requisition } from '../models/requisition.entity';
import { RequisitionsController } from '../controllers/requisitions.controller';
import { RequisitionsService } from '../services/requisitions.service';
import { HistoryModule } from './history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition, Location, Category]), HistoryModule],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
  exports: [RequisitionsService],
})
export class RequisitionsModule {}

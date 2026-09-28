import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from '../controllers/history.controller';
import { RequisitionHistory } from '../models/history.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { HistoryService } from '../services/history.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequisitionHistory, Requisition, User])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}

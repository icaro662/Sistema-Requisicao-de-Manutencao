import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionRecord } from '../models/execution-record.entity';
import { Requisition } from '../models/requisition.entity';
import { ExecutionRecordsController } from '../controllers/execution-records.controller';
import { ExecutionRecordsService } from '../services/execution-records.service';
import { HistoryModule } from './history.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionRecord, Requisition]), HistoryModule],
  controllers: [ExecutionRecordsController],
  providers: [ExecutionRecordsService],
  exports: [ExecutionRecordsService],
})
export class ExecutionRecordsModule {}

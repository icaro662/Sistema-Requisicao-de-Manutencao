import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionRecord } from '../models/execution-record.entity';
import { Requisition } from '../models/requisition.entity';
import { ExecutionRecordsController } from '../controllers/execution-records.controller';
import { ExecutionRecordsService } from '../services/execution-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExecutionRecord, Requisition])],
  controllers: [ExecutionRecordsController],
  providers: [ExecutionRecordsService],
  exports: [ExecutionRecordsService],
})
export class ExecutionRecordsModule {}

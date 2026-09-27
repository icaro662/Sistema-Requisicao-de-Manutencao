import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from '../controllers/reports.controller';
import { Requisition } from '../models/requisition.entity';
import { ReportsService } from '../services/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

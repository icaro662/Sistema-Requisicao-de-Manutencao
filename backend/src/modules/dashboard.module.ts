import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisition } from '../models/requisition.entity';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

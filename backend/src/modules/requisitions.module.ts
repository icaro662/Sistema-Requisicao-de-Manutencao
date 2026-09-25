import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisition } from '../models/requisition.entity';
import { RequisitionsController } from '../controllers/requisitions.controller';
import { RequisitionsService } from '../services/requisitions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requisition])],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
  exports: [RequisitionsService],
})
export class RequisitionsModule {}

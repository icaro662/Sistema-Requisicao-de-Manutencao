import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from '../controllers/auditoria.controller';
import { RequisitionHistory } from '../models/history.entity';
import { AuditoriaService } from '../services/auditoria.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequisitionHistory])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
})
export class AuditoriaModule {}

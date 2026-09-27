import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestMaterial } from '../models/request-material.entity';
import { Requisition } from '../models/requisition.entity';
import { RequestMaterialController } from '../controllers/request-material.controller';
import { RequestMaterialService } from '../services/request-material.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestMaterial, Requisition])],
  controllers: [RequestMaterialController],
  providers: [RequestMaterialService],
  exports: [RequestMaterialService],
})
export class RequestMaterialModule {}

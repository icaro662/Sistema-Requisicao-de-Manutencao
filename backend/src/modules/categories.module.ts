import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../models/category.entity';
import { Requisition } from '../models/requisition.entity';
import { CategoriesController } from '../controllers/categories.controller';
import { CategoriesService } from '../services/categories.service';
import { HistoryModule } from './history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Requisition]), HistoryModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

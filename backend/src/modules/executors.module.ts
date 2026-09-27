import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user.entity';
import { ExecutorsController } from '../controllers/executors.controller';
import { ExecutorsService } from '../services/executors.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ExecutorsController],
  providers: [ExecutorsService],
})
export class ExecutorsModule {}

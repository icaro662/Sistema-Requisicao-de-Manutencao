import { Module } from '@nestjs/common';
import { ExecutorsController } from '../controllers/executors.controller';
import { ExecutorsService } from '../services/executors.service';

@Module({
  controllers: [ExecutorsController],
  providers: [ExecutorsService],
})
export class ExecutorsModule {}

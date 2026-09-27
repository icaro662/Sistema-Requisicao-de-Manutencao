import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from '../controllers/upload.controller';
import { UploadedFile } from '../models/uploaded-file.entity';
import { UploadService } from '../services/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

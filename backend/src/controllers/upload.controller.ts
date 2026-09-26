import { Controller, Delete, Param, Post } from '@nestjs/common';
import { UploadService } from '../services/upload.service';

@Controller('arquivos')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  uploadPhoto(): { message: string } { return { message: 'Photo upload placeholder' }; }

  @Delete(':filename')
  remove(@Param('filename') filename: string) { return this.uploadService.remove(filename); }
}

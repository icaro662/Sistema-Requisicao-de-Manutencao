import { BadRequestException, Controller, Delete, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../core/multer.config';
import { isAllowedImageType } from '../core/utils/file-validation';
import { JwtGuard } from '../core/guards/jwt.guard';
import { UploadService } from '../services/upload.service';

@Controller('arquivos')
@UseGuards(JwtGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  @UseInterceptors(FileInterceptor('file', {
    ...multerConfig,
    fileFilter: (_request, file, callback) => {
      if (!isAllowedImageType(file.mimetype)) {
        callback(new BadRequestException('Tipo de imagem não permitido'), false);
        return;
      }
      callback(null, true);
    },
  }))
  uploadPhoto(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo de imagem é obrigatório');

    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Delete(':filename')
  remove(@Param('filename') filename: string) { return this.uploadService.remove(filename); }
}

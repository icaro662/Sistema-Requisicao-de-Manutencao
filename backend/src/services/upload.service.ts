import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Repository } from 'typeorm';
import { uploadDirectory } from '../core/multer.config';
import { hasAllowedImageContent } from '../core/utils/file-validation';
import { UploadedFile } from '../models/uploaded-file.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadedFile)
    private readonly uploadedFilesRepository: Repository<UploadedFile>,
  ) {}

  async register(filename: string, userId: string): Promise<void> {
    const safeFilename = basename(filename);

    if (!(await hasAllowedImageContent(join(uploadDirectory, safeFilename)))) {
      await unlink(join(uploadDirectory, safeFilename)).catch(() => undefined);
      throw new BadRequestException('O conteúdo do arquivo não é uma imagem permitida');
    }

    const uploadedFile = this.uploadedFilesRepository.create({
      filename: safeFilename,
      ownerId: userId,
    });

    try {
      await this.uploadedFilesRepository.save(uploadedFile);
    } catch (error) {
      await unlink(join(uploadDirectory, safeFilename)).catch(() => undefined);
      throw error;
    }
  }

  async isOwner(filename: string, userId: string): Promise<boolean> {
    const uploadedFile = await this.uploadedFilesRepository.findOne({
      where: { filename: basename(filename), ownerId: userId },
    });
    return Boolean(uploadedFile);
  }

  async remove(filename: string, userId: string, userRole: string): Promise<{ filename: string; removed: boolean }> {
    const safeFilename = basename(filename);

    if (userRole !== 'admin' && !(await this.isOwner(safeFilename, userId))) {
      throw new ForbiddenException('Você não pode remover este arquivo');
    }

    try {
      await unlink(join(uploadDirectory, safeFilename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.uploadedFilesRepository.delete({ filename: safeFilename });
        throw new NotFoundException('Arquivo não encontrado');
      }
      throw error;
    }

    await this.uploadedFilesRepository.delete({ filename: safeFilename });
    return { filename: safeFilename, removed: true };
  }
}

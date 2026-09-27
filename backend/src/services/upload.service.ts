import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { uploadDirectory } from '../core/multer.config';

@Injectable()
export class UploadService {
  async remove(filename: string): Promise<{ filename: string; removed: boolean }> {
    const safeFilename = basename(filename);

    try {
      await unlink(join(uploadDirectory, safeFilename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('Arquivo não encontrado');
      }
      throw error;
    }

    return { filename: safeFilename, removed: true };
  }
}

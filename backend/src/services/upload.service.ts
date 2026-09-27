import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { uploadDirectory } from '../core/multer.config';

@Injectable()
export class UploadService {
  private readonly owners = new Map<string, string>();

  register(filename: string, userId: string): void {
    this.owners.set(basename(filename), userId);
  }

  isOwner(filename: string, userId: string): boolean {
    return this.owners.get(basename(filename)) === userId;
  }

  async remove(filename: string, userId: string, userRole: string): Promise<{ filename: string; removed: boolean }> {
    const safeFilename = basename(filename);

    if (userRole !== 'admin' && !this.isOwner(safeFilename, userId)) {
      throw new ForbiddenException('Você não pode remover este arquivo');
    }

    try {
      await unlink(join(uploadDirectory, safeFilename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('Arquivo não encontrado');
      }
      throw error;
    }

    this.owners.delete(safeFilename);
    return { filename: safeFilename, removed: true };
  }
}

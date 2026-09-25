import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  remove(filename: string): { filename: string; removed: boolean } {
    return { filename, removed: false };
  }
}

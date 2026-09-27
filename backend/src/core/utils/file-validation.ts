import { open } from 'node:fs/promises';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedImageType(mimetype: string): boolean {
  return allowedImageTypes.has(mimetype);
}

export async function hasAllowedImageContent(filepath: string): Promise<boolean> {
  const file = await open(filepath, 'r');
  const header = Buffer.alloc(12);

  try {
    const { bytesRead } = await file.read(header, 0, header.length, 0);
    const isJpeg = bytesRead >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    const isPng = bytesRead >= 8 && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = bytesRead >= 12 && header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || isWebp;
  } finally {
    await file.close();
  }
}

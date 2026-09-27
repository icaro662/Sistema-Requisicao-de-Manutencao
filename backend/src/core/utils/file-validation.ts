import { fromFile } from 'file-type';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedImageType(mimetype: string): boolean {
  return allowedImageTypes.has(mimetype);
}

export async function hasAllowedImageContent(filepath: string): Promise<boolean> {
  const detectedType = await fromFile(filepath);
  return Boolean(detectedType && isAllowedImageType(detectedType.mime));
}

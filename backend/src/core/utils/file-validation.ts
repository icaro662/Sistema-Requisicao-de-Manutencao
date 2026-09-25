const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedImageType(mimetype: string): boolean {
  return allowedImageTypes.has(mimetype);
}

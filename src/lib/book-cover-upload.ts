export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const COVER_MAX_BYTES = 5 * 1024 * 1024;
export function validateBookCover(file: Pick<File, 'type' | 'size'>) {
  if (!COVER_TYPES.includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
  if (file.size === 0 || file.size > COVER_MAX_BYTES) throw new Error('Choose an image up to 5 MB.');
}
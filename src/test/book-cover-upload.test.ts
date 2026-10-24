import { describe, it, expect } from 'vitest';
import { validateBookCover } from '@/lib/book-cover-upload';
describe('Book cover uploads', () => {
  it('accepts supported images', () => { for (const type of ['image/jpeg','image/png','image/webp']) expect(() => validateBookCover({type,size:1024})).not.toThrow(); });
  it('rejects executable or vector files', () => expect(() => validateBookCover({type:'image/svg+xml',size:1024})).toThrow());
  it('rejects oversized images', () => expect(() => validateBookCover({type:'image/png',size:5*1024*1024+1})).toThrow());
});
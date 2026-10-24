import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BookCover } from '@/components/books/BookCover';
import { validateBookCover } from '@/lib/book-cover-upload';

export function BookCoverPicker({ value, file, title, disabled, onChange }: { value: string | null; file: File | null; title: string; disabled: boolean; onChange: (file: File | null, remove?: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!file) { setPreview(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <section className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-center">
    <div className="w-28 shrink-0"><BookCover src={preview ?? value} title={title || 'Book'} /></div>
    <div className="min-w-0 space-y-3">
      <h2 className="font-bold">Book cover</h2>
      <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Up to 5 MB</p>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Book cover image" className="hidden" disabled={disabled} onChange={e => {
        const selected = e.target.files?.[0];
        if (selected) { try { validateBookCover(selected); onChange(selected); } catch (error) { toast.error((error as Error).message); } }
        e.target.value = '';
      }} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={disabled} onClick={() => input.current?.click()}><ImagePlus />{file || value ? 'Replace image' : 'Upload image'}</Button>
        {(file || value) && <Button type="button" variant="ghost" aria-label="Remove cover" disabled={disabled} onClick={() => onChange(null, true)}><Trash2 /></Button>}
      </div>
      {file && <p className="max-w-xs truncate text-xs text-muted-foreground">{file.name}</p>}
    </div>
  </section>;
}
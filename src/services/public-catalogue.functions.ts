import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { Book, Category } from '@/types/library';

export const fetchPublicCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('The catalogue is temporarily unavailable.');
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  // Fetch every catalogue row in bounded pages, rather than silently truncating at 200.
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const result = await client.from('books').select('id,title,isbn,publisher,department,language,publication_year,description,cover_url,rating,popularity,pages,featured,created_at,category:categories(id,name,slug,tone),book_authors(position,author:authors(name))').order('id').range(offset, offset + 499);
    if (result.error) throw new Error('We could not load the catalogue. Please try again.');
    rows.push(...result.data);
    if (result.data.length < 500) break;
  }
  const [categories, availability] = await Promise.all([
    client.from('categories').select('id,name,slug,description,tone').order('sort_order'),
    client.rpc('get_book_availability'),
  ]);
  if (categories.error || availability.error) throw new Error('We could not load the catalogue. Please try again.');
  const counts = new Map(availability.data.map(a => [a.book_id, a]));
  const books: Book[] = rows.map(r => ({
    id: r.id, title: r.title, isbn: r.isbn, publisher: r.publisher, department: r.department,
    language: r.language, publicationYear: r.publication_year, description: r.description,
    coverUrl: r.cover_url, rating: Number(r.rating), popularity: r.popularity, pages: r.pages,
    featured: r.featured, createdAt: r.created_at, category: r.category as Book['category'],
    authors: r.book_authors.sort((a,b) => a.position-b.position).map(a => a.author?.name).filter((a): a is string => !!a),
    totalCopies: counts.get(r.id)?.total_copies ?? 0, availableCopies: counts.get(r.id)?.available_copies ?? 0,
  }));
  return { books, categories: categories.data as Category[] };
});

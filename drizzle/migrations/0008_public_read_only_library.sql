GRANT SELECT ON public.books, public.authors, public.categories, public.book_authors TO anon;
CREATE POLICY "Public read catalogue" ON public.books FOR SELECT TO anon USING (true);
CREATE POLICY "Public read authors" ON public.authors FOR SELECT TO anon USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public read book authors" ON public.book_authors FOR SELECT TO anon USING (true);
GRANT EXECUTE ON FUNCTION public.get_book_availability(uuid[]) TO anon;
CREATE POLICY "Public view published book covers" ON storage.objects FOR SELECT TO anon USING (bucket_id='book-covers' AND EXISTS (SELECT 1 FROM public.books b WHERE b.cover_url = 'storage://book-covers/' || storage.objects.name));
COMMENT ON POLICY "Public read catalogue" ON public.books IS 'Intentional public read-only catalogue; no anonymous write grants. Current catalogue has no draft or private publication state.';
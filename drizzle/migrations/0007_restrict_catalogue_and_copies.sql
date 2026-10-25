DROP POLICY IF EXISTS "public read" ON public.books;
DROP POLICY IF EXISTS "public read" ON public.authors;
DROP POLICY IF EXISTS "public read" ON public.categories;
DROP POLICY IF EXISTS "public read" ON public.book_authors;
DROP POLICY IF EXISTS "public read" ON public.book_copies;
REVOKE SELECT ON public.books, public.authors, public.categories, public.book_authors, public.book_copies FROM anon;
CREATE POLICY "members read books" ON public.books FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "members read authors" ON public.authors FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "members read categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "members read book authors" ON public.book_authors FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff or borrower read copies" ON public.book_copies FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR EXISTS (SELECT 1 FROM public.borrow_records br WHERE br.copy_id = book_copies.id AND br.user_id = auth.uid())
);
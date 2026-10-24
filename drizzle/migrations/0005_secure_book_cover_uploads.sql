CREATE POLICY "Readers view book covers" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'book-covers');
CREATE POLICY "Admins upload book covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers' AND public.is_admin(auth.uid()) AND (storage.foldername(name))[1] = auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE OR REPLACE FUNCTION public.management_save_book(_book jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
DECLARE bid uuid; aid uuid; a text; pos integer := 0; cover text;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admin access required' USING ERRCODE='42501'; END IF;
 IF length(trim(COALESCE(_book->>'title','')))<1 OR length(trim(COALESCE(_book->>'isbn','')))<1 THEN RAISE EXCEPTION 'Title and ISBN are required'; END IF;
 IF length(_book->>'title')>300 OR length(_book->>'isbn')>40 THEN RAISE EXCEPTION 'Title or ISBN is too long'; END IF;
 cover := NULLIF(_book->>'coverUrl','');
 IF cover IS NOT NULL AND cover !~ '^https://' AND cover !~ '^storage://book-covers/[0-9a-f-]+/[0-9a-f-]+\.(jpg|jpeg|png|webp)$' THEN RAISE EXCEPTION 'Invalid book cover'; END IF;
 IF cover LIKE 'storage://book-covers/%' AND NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='book-covers' AND name=substring(cover from 23)) THEN RAISE EXCEPTION 'Upload the cover before saving'; END IF;
 bid := NULLIF(_book->>'id','')::uuid;
 IF bid IS NULL THEN INSERT INTO public.books(title,isbn) VALUES(trim(_book->>'title'),trim(_book->>'isbn')) RETURNING id INTO bid; END IF;
 UPDATE public.books SET title=trim(_book->>'title'),isbn=trim(_book->>'isbn'),publisher=NULLIF(_book->>'publisher',''),department=NULLIF(_book->>'department',''),language=COALESCE(NULLIF(_book->>'language',''),'English'),publication_year=NULLIF(_book->>'publicationYear','')::integer,description=NULLIF(_book->>'description',''),category_id=NULLIF(_book->>'categoryId','')::uuid,featured=COALESCE((_book->>'featured')::boolean,false),cover_url=CASE WHEN _book ? 'coverUrl' THEN cover ELSE cover_url END WHERE id=bid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Book not found'; END IF;
 DELETE FROM public.book_authors WHERE book_id=bid;
 FOR a IN SELECT jsonb_array_elements_text(COALESCE(_book->'authors','[]'::jsonb)) LOOP
 IF trim(a)='' THEN CONTINUE; END IF;
 SELECT id INTO aid FROM public.authors WHERE lower(name)=lower(trim(a)) LIMIT 1;
 IF aid IS NULL THEN INSERT INTO public.authors(name) VALUES(trim(a)) RETURNING id INTO aid; END IF;
 INSERT INTO public.book_authors(book_id,author_id,position) VALUES(bid,aid,pos) ON CONFLICT DO NOTHING;
 pos:=pos+1;
 END LOOP;
 RETURN bid;
END; $$;
REVOKE ALL ON FUNCTION public.management_save_book(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.management_save_book(jsonb) TO authenticated;
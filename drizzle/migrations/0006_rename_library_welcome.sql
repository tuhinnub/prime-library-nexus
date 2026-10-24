CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
BEGIN
 INSERT INTO public.profiles(id,full_name,email,university_id,department,semester) VALUES(new.id,coalesce(left(new.raw_user_meta_data->>'full_name',120),left(new.raw_user_meta_data->>'name',120),''),new.email,left(nullif(new.raw_user_meta_data->>'university_id',''),40),left(nullif(new.raw_user_meta_data->>'department',''),80),left(nullif(new.raw_user_meta_data->>'semester',''),20));
 INSERT INTO public.user_roles(user_id,role) VALUES(new.id,'student');
 INSERT INTO public.notifications(user_id,type,title,message) VALUES(new.id,'announcement','Welcome to গ্রন্থাগার','Explore the catalogue and reserve your first book.');
 RETURN new;
END; $$;
create or replace function public.staff_checkout(_email text, _barcode text, _reservation_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare _uid uuid; _copy uuid; _st public.copy_status; _book uuid; _title text; _days int; _id uuid;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorized'; end if;
  select id into _uid from public.profiles where lower(email) = lower(trim(_email));
  if _uid is null then raise exception 'No member with that email.'; end if;
  select c.id, c.status, c.book_id, b.title into _copy, _st, _book, _title
    from public.book_copies c join public.books b on b.id = c.book_id where c.barcode = trim(_barcode) for update of c;
  if _copy is null then raise exception 'No copy with that barcode.'; end if;
  if _st <> 'available' then raise exception 'This copy is not available (status: %).', _st; end if;
  select loan_days into _days from public.library_settings where id = 1;
  insert into public.borrow_records(user_id, copy_id, due_at) values (_uid, _copy, now() + make_interval(days => _days)) returning id into _id;
  update public.book_copies set status = 'borrowed' where id = _copy;
  update public.reservations set status = 'completed'
    where user_id = _uid and book_id = _book and status in ('pending','approved','ready_for_pickup')
      and (_reservation_id is null or id = _reservation_id);
  insert into public.notifications(user_id,type,title,message,link)
    values (_uid,'due_soon','Book checked out', format('"%s" is due on %s.', _title, to_char(now() + make_interval(days => _days),'DD Mon YYYY')), '/my-library/borrowed');
  return _id;
end; $$;

create or replace function public.staff_return(_barcode text)
returns json language plpgsql security definer set search_path = public as $$
declare _br record; _rate numeric; _days int; _amt numeric := 0;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorized'; end if;
  select br.*, b.title into _br from public.borrow_records br
    join public.book_copies c on c.id = br.copy_id join public.books b on b.id = c.book_id
    where c.barcode = trim(_barcode) and br.status = 'active' for update of br;
  if _br.id is null then raise exception 'No active loan for that barcode.'; end if;
  update public.borrow_records set status = 'returned', returned_at = now() where id = _br.id;
  update public.book_copies set status = 'available' where id = _br.copy_id;
  select fine_per_day into _rate from public.library_settings where id = 1;
  _days := greatest(0, ceil(extract(epoch from (now() - _br.due_at)) / 86400)::int);
  if _days > 0 and _rate > 0 then
    _amt := _days * _rate;
    insert into public.fines(user_id, borrow_record_id, overdue_days, amount) values (_br.user_id, _br.id, _days, _amt);
    insert into public.notifications(user_id,type,title,message,link)
      values (_br.user_id,'overdue','Overdue fine issued', format('"%s" was returned %s day(s) late.', _br.title, _days), '/fines');
  end if;
  return json_build_object('overdue_days', _days, 'fine', _amt);
end; $$;

create or replace function public.staff_set_reservation(_id uuid, _status public.reservation_status)
returns void language plpgsql security definer set search_path = public as $$
declare _r record;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorized'; end if;
  update public.reservations set status = _status where id = _id returning user_id, book_id into _r;
  if _r.user_id is null then raise exception 'Reservation not found'; end if;
  if _status = 'ready_for_pickup' then
    insert into public.notifications(user_id,type,title,message,link)
    select _r.user_id,'availability','Book Available', format('Your requested book "%s" is ready.', title), '/my-library/reservations' from public.books where id = _r.book_id;
  end if;
end; $$;

create or replace function public.staff_mark_fine_paid(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorized'; end if;
  update public.fines set status = 'paid', paid_at = now() where id = _id and status = 'unpaid';
end; $$;

revoke execute on function public.staff_checkout(text,text,uuid), public.staff_return(text), public.staff_set_reservation(uuid,public.reservation_status), public.staff_mark_fine_paid(uuid) from anon, public;
grant execute on function public.staff_checkout(text,text,uuid), public.staff_return(text), public.staff_set_reservation(uuid,public.reservation_status), public.staff_mark_fine_paid(uuid) to authenticated;
-- Roles
create type public.app_role as enum ('student','faculty','librarian','admin');
create type public.copy_status as enum ('available','borrowed','reserved','maintenance','lost');
create type public.borrow_status as enum ('active','returned','lost');
create type public.reservation_status as enum ('pending','approved','ready_for_pickup','cancelled','completed','expired');
create type public.fine_status as enum ('unpaid','paid','waived');
create type public.notification_type as enum ('reservation','availability','due_soon','overdue','announcement');

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  university_id text,
  department text,
  semester text,
  avatar_url text,
  language text not null default 'en',
  notify_email boolean not null default true,
  notify_due_dates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint full_name_len check (char_length(full_name) <= 120),
  constraint uni_len check (university_id is null or char_length(university_id) <= 40),
  constraint dept_len check (department is null or char_length(department) <= 80),
  constraint sem_len check (semester is null or char_length(semester) <= 20)
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('librarian','admin'))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, university_id, department, semester)
  values (new.id,
    coalesce(left(new.raw_user_meta_data->>'full_name',120), left(new.raw_user_meta_data->>'name',120), ''),
    new.email,
    left(nullif(new.raw_user_meta_data->>'university_id',''),40),
    left(nullif(new.raw_user_meta_data->>'department',''),80),
    left(nullif(new.raw_user_meta_data->>'semester',''),20));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  insert into public.notifications (user_id, type, title, message)
  values (new.id, 'announcement', 'Welcome to Smart Library', 'Explore the catalogue and reserve your first book.');
  return new;
end; $$;

-- Catalogue
create table public.library_settings (
  id int primary key default 1 check (id = 1),
  loan_days int not null default 14 check (loan_days between 1 and 120),
  fine_per_day numeric(10,2) not null default 0 check (fine_per_day >= 0),
  max_active_reservations int not null default 3 check (max_active_reservations between 1 and 50),
  reservation_hold_days int not null default 3 check (reservation_hold_days between 1 and 30),
  currency text not null default 'BDT',
  updated_at timestamptz not null default now()
);
grant select on public.library_settings to anon, authenticated;
grant update on public.library_settings to authenticated;
grant all on public.library_settings to service_role;
alter table public.library_settings enable row level security;
create policy "settings public read" on public.library_settings for select to anon, authenticated using (true);
create policy "settings admin update" on public.library_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.library_settings (id) values (1);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  tone text not null default 'blue' check (tone in ('blue','lime','gray')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  bio text,
  created_at timestamptz not null default now()
);
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  isbn text not null unique,
  publisher text,
  category_id uuid references public.categories(id) on delete set null,
  department text,
  language text not null default 'English',
  publication_year int check (publication_year between 1000 and 2100),
  description text,
  cover_url text,
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  popularity int not null default 0,
  pages int,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger books_touch before update on public.books for each row execute function public.touch_updated_at();
create index books_category_idx on public.books(category_id);
create table public.book_authors (
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  position int not null default 0,
  primary key (book_id, author_id)
);
create table public.book_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  barcode text not null unique,
  shelf_location text,
  status public.copy_status not null default 'available',
  created_at timestamptz not null default now()
);
create index copies_book_idx on public.book_copies(book_id);

do $$ declare t text; begin
  foreach t in array array['categories','authors','books','book_authors','book_copies'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "staff write" on public.%I for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()))', t);
  end loop;
end $$;

-- Circulation
create table public.borrow_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  copy_id uuid not null references public.book_copies(id) on delete restrict,
  borrowed_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  status public.borrow_status not null default 'active',
  created_at timestamptz not null default now(),
  check (due_at > borrowed_at),
  check (returned_at is null or returned_at >= borrowed_at)
);
create index borrow_user_idx on public.borrow_records(user_id);
create unique index one_active_borrow_per_copy on public.borrow_records(copy_id) where status = 'active';

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  status public.reservation_status not null default 'pending',
  reserved_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create index res_user_idx on public.reservations(user_id);
create unique index one_active_res_per_book on public.reservations(user_id, book_id) where status in ('pending','approved','ready_for_pickup');
create trigger res_touch before update on public.reservations for each row execute function public.touch_updated_at();

create table public.favorites (
  user_id uuid not null,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table public.fines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  borrow_record_id uuid not null references public.borrow_records(id) on delete cascade,
  overdue_days int not null check (overdue_days >= 0),
  amount numeric(10,2) not null check (amount >= 0),
  status public.fine_status not null default 'unpaid',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (borrow_record_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type public.notification_type not null default 'announcement',
  title text not null,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notif_user_idx on public.notifications(user_id, created_at desc);

-- borrow_records: users read own; staff manage
grant select, insert, update, delete on public.borrow_records to authenticated;
grant all on public.borrow_records to service_role;
alter table public.borrow_records enable row level security;
create policy "own borrow read" on public.borrow_records for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "staff borrow write" on public.borrow_records for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- reservations: create/cancel only via RPC; staff manage
grant select, insert, update, delete on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;
create policy "own res read" on public.reservations for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "staff res write" on public.reservations for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "own fav read" on public.favorites for select to authenticated using (user_id = auth.uid());
create policy "own fav insert" on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "own fav delete" on public.favorites for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.fines to authenticated;
grant all on public.fines to service_role;
alter table public.fines enable row level security;
create policy "own fine read" on public.fines for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "staff fine write" on public.fines for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notif read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "staff notif insert" on public.notifications for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff notif delete" on public.notifications for delete to authenticated using (public.is_staff(auth.uid()));

-- users may only flip read_at on their own notifications
create or replace function public.mark_notifications_read(_ids uuid[] default null)
returns void language sql security definer set search_path = public as $$
  update public.notifications set read_at = now()
  where user_id = auth.uid() and read_at is null and (_ids is null or id = any(_ids));
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Availability (counts only, no private data)
create or replace function public.get_book_availability(_book_ids uuid[] default null)
returns table (book_id uuid, total_copies int, available_copies int)
language sql stable security definer set search_path = public as $$
  select b.id,
    (select count(*) from public.book_copies c where c.book_id = b.id and c.status <> 'lost')::int,
    greatest(0,
      (select count(*) from public.book_copies c where c.book_id = b.id and c.status = 'available')
      - (select count(*) from public.reservations r where r.book_id = b.id and r.status in ('pending','approved','ready_for_pickup'))
    )::int
  from public.books b
  where _book_ids is null or b.id = any(_book_ids);
$$;
grant execute on function public.get_book_availability(uuid[]) to anon, authenticated;

-- Reservation with server-side validation (transactional, row-locked)
create or replace function public.reserve_book(_book_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _title text;
  _avail int;
  _active int;
  _max int;
  _hold int;
  _id uuid;
begin
  if _uid is null then raise exception 'You must be signed in to reserve books.'; end if;
  select title into _title from public.books where id = _book_id for update;
  if _title is null then raise exception 'This book does not exist.'; end if;
  select max_active_reservations, reservation_hold_days into _max, _hold from public.library_settings where id = 1;
  if exists (select 1 from public.reservations where user_id = _uid and book_id = _book_id and status in ('pending','approved','ready_for_pickup')) then
    raise exception 'You already have an active reservation for this book.';
  end if;
  if exists (select 1 from public.borrow_records br join public.book_copies c on c.id = br.copy_id where br.user_id = _uid and c.book_id = _book_id and br.status = 'active') then
    raise exception 'You are currently borrowing this book.';
  end if;
  select count(*) into _active from public.reservations where user_id = _uid and status in ('pending','approved','ready_for_pickup');
  if _active >= _max then raise exception 'You have reached the limit of % active reservations.', _max; end if;
  if exists (select 1 from public.fines where user_id = _uid and status = 'unpaid') then
    raise exception 'Please settle outstanding fines before reserving.';
  end if;
  select available_copies into _avail from public.get_book_availability(array[_book_id]);
  if coalesce(_avail,0) <= 0 then raise exception 'No copies are available to reserve right now.'; end if;
  insert into public.reservations (user_id, book_id, status, expires_at)
  values (_uid, _book_id, 'pending', now() + make_interval(days => _hold)) returning id into _id;
  insert into public.notifications (user_id, type, title, message, link)
  values (_uid, 'reservation', 'Reservation received', format('Your reservation for "%s" is pending librarian approval.', _title), '/my-library/reservations');
  return _id;
end; $$;
grant execute on function public.reserve_book(uuid) to authenticated;

create or replace function public.cancel_reservation(_reservation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.reservations set status = 'cancelled'
  where id = _reservation_id and user_id = auth.uid() and status in ('pending','approved','ready_for_pickup');
  if not found then raise exception 'Reservation not found or can no longer be cancelled.'; end if;
end; $$;
grant execute on function public.cancel_reservation(uuid) to authenticated;
revoke execute on function public.reserve_book(uuid) from anon;
revoke execute on function public.cancel_reservation(uuid) from anon;
revoke execute on function public.mark_notifications_read(uuid[]) from anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

-- Admin metrics (staff only)
create or replace function public.admin_metrics()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not authorized'; end if;
  return json_build_object(
    'total_books', (select count(*) from public.books),
    'available_copies', (select count(*) from public.book_copies where status = 'available'),
    'borrowed', (select count(*) from public.borrow_records where status = 'active'),
    'overdue', (select count(*) from public.borrow_records where status = 'active' and due_at < now()),
    'users', (select count(*) from public.profiles),
    'pending_reservations', (select count(*) from public.reservations where status = 'pending')
  );
end; $$;
grant execute on function public.admin_metrics() to authenticated;

-- ===== Demo catalogue seed =====
insert into public.categories (name, slug, description, tone, sort_order) values
('Programming','programming','Craft, patterns and clean code','blue',1),
('Computer Science','computer-science','Algorithms and foundations','gray',2),
('Mathematics','mathematics','Proof, puzzles and problem solving','lime',3),
('Literature','literature','Classics and modern fiction','blue',4),
('Science','science','The universe and everything in it','gray',5),
('Business','business','Habits, focus and strategy','lime',6);

with data(title, isbn, author, cat, dept, publisher, yr, rating, pop, pages, featured, copies, descr) as (values
('Clean Code','9780132350884','Robert C. Martin','programming','CSE','Prentice Hall',2008,4.6,980,464,true,4,'A handbook of agile software craftsmanship — how to write code that is readable, maintainable and a joy to work with.'),
('The Pragmatic Programmer','9780135957059','David Thomas','programming','CSE','Addison-Wesley',2019,4.7,870,352,false,3,'Timeless lessons on becoming a more effective, adaptable software developer.'),
('Refactoring','9780134757599','Martin Fowler','programming','CSE','Addison-Wesley',2018,4.5,610,448,false,2,'Improving the design of existing code through small, safe, behaviour-preserving steps.'),
('Design Patterns','9780201633610','Erich Gamma','programming','CSE','Addison-Wesley',1994,4.4,540,395,false,2,'The classic catalogue of reusable object-oriented design solutions.'),
('Introduction to Algorithms','9780262046305','Thomas H. Cormen','computer-science','CSE','MIT Press',2022,4.6,900,1312,true,5,'The comprehensive reference on algorithms used in universities worldwide.'),
('Structure and Interpretation of Computer Programs','9780262510875','Harold Abelson','computer-science','CSE','MIT Press',1996,4.5,420,657,false,2,'A foundational text on abstraction, computation and the art of programming.'),
('Code','9780735611313','Charles Petzold','computer-science','CSE','Microsoft Press',2000,4.7,480,400,false,2,'The hidden language of computer hardware and software, explained from first principles.'),
('How to Solve It','9780691164076','George Pólya','mathematics','Mathematics','Princeton University Press',2014,4.4,360,288,false,3,'A new aspect of mathematical method — heuristics for solving any problem.'),
('Gödel, Escher, Bach','9780465026562','Douglas Hofstadter','mathematics','Mathematics','Basic Books',1999,4.3,390,777,false,1,'An eternal golden braid of mathematics, art and music.'),
('To Kill a Mockingbird','9780061120084','Harper Lee','literature','English','Harper Perennial',2006,4.8,760,336,true,3,'A story of justice and growing up in the American South.'),
('The Great Gatsby','9780743273565','F. Scott Fitzgerald','literature','English','Scribner',2004,4.2,680,180,false,3,'The quintessential novel of the Jazz Age and the American dream.'),
('1984','9780451524935','George Orwell','literature','English','Signet Classic',1961,4.6,820,328,false,4,'A chilling vision of a totalitarian future.'),
('A Brief History of Time','9780553380163','Stephen Hawking','science','Physics','Bantam',1998,4.5,640,212,false,2,'From the Big Bang to black holes — the universe explained.'),
('Sapiens','9780062316097','Yuval Noah Harari','science','Social Science','Harper',2015,4.5,910,464,true,3,'A brief history of humankind.'),
('Atomic Habits','9780735211292','James Clear','business','Business','Avery',2018,4.8,990,320,true,4,'Tiny changes, remarkable results — an easy and proven way to build good habits.'),
('Deep Work','9781455586691','Cal Newport','business','Business','Grand Central',2016,4.6,850,304,true,3,'Rules for focused success in a distracted world.'),
('Zero to One','9780804139298','Peter Thiel','business','Business','Crown Business',2014,4.3,520,224,false,2,'Notes on startups, or how to build the future.'),
('Thinking, Fast and Slow','9780374533557','Daniel Kahneman','business','Psychology','Farrar, Straus and Giroux',2013,4.5,700,499,false,0,'The two systems that drive the way we think.')
), ins_auth as (
  insert into public.authors (name) select distinct author from data returning id, name
), ins_books as (
  insert into public.books (title, isbn, publisher, category_id, department, publication_year, description, cover_url, rating, popularity, pages, featured)
  select d.title, d.isbn, d.publisher, c.id, d.dept, d.yr, d.descr, 'https://covers.openlibrary.org/b/isbn/' || d.isbn || '-L.jpg', d.rating, d.pop, d.pages, d.featured
  from data d join public.categories c on c.slug = d.cat
  returning id, isbn
), ins_ba as (
  insert into public.book_authors (book_id, author_id)
  select b.id, a.id from data d join ins_books b on b.isbn = d.isbn join ins_auth a on a.name = d.author
  returning 1
)
insert into public.book_copies (book_id, barcode, shelf_location, status)
select b.id, 'SL-' || right(d.isbn, 6) || '-' || lpad(g::text, 2, '0'), 'Shelf ' || upper(left(d.cat, 2)) || '-' || g, 'available'
from data d join ins_books b on b.isbn = d.isbn
cross join lateral generate_series(1, greatest(d.copies, 1)) g;

-- Demo: Thinking, Fast and Slow has its only copy under maintenance
update public.book_copies set status = 'maintenance'
where book_id = (select id from public.books where isbn = '9780374533557');
-- PartyFinder / Supabase — full schema: tables, RLS, storage, triggers
-- Run once in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Comments in English per project convention

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid references auth.users (id) on delete cascade primary key,
  phone text unique,
  name text not null default 'Adventurer',
  gender text not null default 'female' check (gender in ('male', 'female')),
  birth_date date not null default date '2000-01-01',
  bio text,
  avatar_url text,
  reliability_score double precision not null default 1.0,
  exp integer not null default 0,
  level integer not null default 1,
  total_activities integer not null default 0,
  total_hosted integer not null default 0,
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- Keep existing environments compatible when schema already exists
alter table public.users add column if not exists gender text;
alter table public.users add column if not exists birth_date date;
update public.users set gender = 'female' where gender is null or gender not in ('male', 'female');
update public.users set birth_date = date '2000-01-01' where birth_date is null;
alter table public.users alter column gender set not null;
alter table public.users alter column gender set default 'female';
alter table public.users alter column birth_date set not null;
alter table public.users alter column birth_date set default date '2000-01-01';
alter table public.users drop constraint if exists users_gender_check;
alter table public.users add constraint users_gender_check check (gender in ('male', 'female'));
alter table public.users drop column if exists age;

alter table public.users add column if not exists banned boolean not null default false;

create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users (id) on delete cascade,
  activity_type text not null,
  title text not null,
  description text,
  date_time timestamptz not null,
  location_name text not null,
  location_lat double precision not null,
  location_lng double precision not null,
  max_spots integer not null default 2,
  -- Accepted guests only (host is not counted here). Party size = 1 + spots_taken.
  spots_taken integer not null default 0,
  min_reliability double precision not null default 0,
  min_level integer not null default 0,
  status text not null default 'open' check (status in ('open', 'full', 'completed', 'cancelled')),
  recurring boolean not null default false,
  recurring_pattern text,
  gender_scope text not null default 'any' check (gender_scope in ('any', 'female', 'male')),
  created_at timestamptz not null default now(),
  constraint slots_max_spots_positive check (max_spots >= 2),
  constraint slots_spots_taken_nonnegative check (spots_taken >= 0),
  -- spots_taken = accepted guests only; total headcount = 1 (host) + spots_taken
  constraint slots_guests_fit check (spots_taken <= max_spots - 1)
);

alter table public.slots add column if not exists gender_scope text;
update public.slots
set gender_scope = 'any'
where gender_scope is null or gender_scope not in ('any', 'female', 'male');
alter table public.slots alter column gender_scope set default 'any';
alter table public.slots alter column gender_scope set not null;
alter table public.slots drop constraint if exists slots_gender_scope_check;
alter table public.slots add constraint slots_gender_scope_check check (gender_scope in ('any', 'female', 'male'));

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  applicant_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz not null default now(),
  unique (slot_id, applicant_id)
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  rater_id uuid not null references public.users (id) on delete cascade,
  rated_id uuid not null references public.users (id) on delete cascade,
  score integer not null check (score between 1 and 5),
  comment text,
  showed_up boolean not null default true,
  created_at timestamptz not null default now(),
  unique (slot_id, rater_id, rated_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  slot_id uuid references public.slots (id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Profile moderation: user-submitted reports (reviewed manually in /admin)
create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  reported_user_id uuid not null references public.users (id) on delete cascade,
  reporter_id uuid not null references public.users (id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'resolved')),
  created_at timestamptz not null default now(),
  constraint profile_reports_reason_len check (char_length(trim(reason)) between 10 and 2000),
  constraint profile_reports_no_self check (reported_user_id <> reporter_id)
);

-- ---------------------------------------------------------------------------
-- 2. INDEXES
-- ---------------------------------------------------------------------------

create index if not exists idx_slots_host_id on public.slots (host_id);
create index if not exists idx_slots_date_time on public.slots (date_time);
create index if not exists idx_slots_status on public.slots (status);
create index if not exists idx_applications_slot_id on public.applications (slot_id);
create index if not exists idx_applications_applicant_id on public.applications (applicant_id);
create index if not exists idx_messages_slot_id on public.messages (slot_id);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_ratings_slot_id on public.ratings (slot_id);
create index if not exists idx_profile_reports_status on public.profile_reports (status);
create index if not exists idx_profile_reports_reported on public.profile_reports (reported_user_id);
create index if not exists idx_profile_reports_created on public.profile_reports (created_at desc);
create index if not exists idx_users_banned on public.users (banned) where banned = true;

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.slots enable row level security;
alter table public.applications enable row level security;
alter table public.ratings enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.profile_reports enable row level security;

-- Drop existing policies if re-running (idempotent-ish)
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('users', 'slots', 'applications', 'ratings', 'messages', 'notifications', 'profile_reports')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- users
create policy users_select_authenticated
  on public.users for select
  to authenticated
  using (true);

create policy users_insert_own
  on public.users for insert
  to authenticated
  with check (id = auth.uid());

create policy users_update_own
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- slots
create policy slots_select_authenticated
  on public.slots for select
  to authenticated
  using (true);

create policy slots_insert_as_host
  on public.slots for insert
  to authenticated
  with check (host_id = auth.uid());

create policy slots_update_host
  on public.slots for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy slots_delete_host
  on public.slots for delete
  to authenticated
  using (host_id = auth.uid());

-- applications
create policy applications_select_parties
  on public.applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or exists (
      select 1 from public.slots s
      where s.id = applications.slot_id and s.host_id = auth.uid()
    )
  );

create policy applications_insert_self_open_slot
  on public.applications for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1
      from public.slots s
      inner join public.users u on u.id = auth.uid()
      where s.id = applications.slot_id
        and s.host_id <> auth.uid()
        and s.status = 'open'
        and (1 + s.spots_taken) < s.max_spots
        and (
          coalesce(s.gender_scope, 'any') = 'any'
          or (s.gender_scope = 'female' and u.gender = 'female')
          or (s.gender_scope = 'male' and u.gender = 'male')
        )
    )
    and not exists (
      select 1 from public.applications a2
      where a2.slot_id = applications.slot_id
        and a2.applicant_id = auth.uid()
        and a2.status in ('pending', 'accepted')
    )
  );

create policy applications_update_host_decision
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.slots s
      where s.id = applications.slot_id and s.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.slots s
      where s.id = applications.slot_id and s.host_id = auth.uid()
    )
  );

create policy applications_delete_own_pending
  on public.applications for delete
  to authenticated
  using (applicant_id = auth.uid() and status = 'pending');

-- ratings
create policy ratings_select_participants
  on public.ratings for select
  to authenticated
  using (
    auth.uid() in (rater_id, rated_id)
    or exists (
      select 1 from public.slots s
      where s.id = ratings.slot_id and s.host_id = auth.uid()
    )
    or exists (
      select 1 from public.applications a
      where a.slot_id = ratings.slot_id
        and a.applicant_id = auth.uid()
        and a.status = 'accepted'
    )
  );

create policy ratings_insert_participant
  on public.ratings for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and rated_id <> rater_id
    and exists (select 1 from public.slots s where s.id = slot_id)
    and (
      exists (select 1 from public.slots s where s.id = slot_id and s.host_id = auth.uid())
      or exists (
        select 1 from public.applications a
        where a.slot_id = slot_id and a.applicant_id = auth.uid() and a.status = 'accepted'
      )
    )
    and (
      exists (select 1 from public.slots s where s.id = slot_id and s.host_id = rated_id)
      or exists (
        select 1 from public.applications a
        where a.slot_id = slot_id and a.applicant_id = rated_id and a.status = 'accepted'
      )
    )
  );

-- messages (host or accepted applicants)
create policy messages_select_party
  on public.messages for select
  to authenticated
  using (
    exists (select 1 from public.slots s where s.id = messages.slot_id and s.host_id = auth.uid())
    or exists (
      select 1 from public.applications a
      where a.slot_id = messages.slot_id
        and a.applicant_id = auth.uid()
        and a.status = 'accepted'
    )
  );

create policy messages_insert_party
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and (
      exists (select 1 from public.slots s where s.id = slot_id and s.host_id = auth.uid())
      or exists (
        select 1 from public.applications a
        where a.slot_id = slot_id
          and a.applicant_id = auth.uid()
          and a.status = 'accepted'
      )
    )
  );

-- notifications (read/update own; inserts via trigger/service role)
create policy notifications_select_own
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy notifications_update_own
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- profile_reports (insert as reporter; read own submissions — admin reads via service role)
create policy profile_reports_insert_reporter
  on public.profile_reports for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    and reported_user_id <> auth.uid()
    and char_length(trim(reason)) >= 10
    and char_length(trim(reason)) <= 2000
  );

create policy profile_reports_select_own
  on public.profile_reports for select
  to authenticated
  using (reporter_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS — profile on signup, slot counts, notifications
-- ---------------------------------------------------------------------------

-- Only service_role JWT may change users.banned (app updates via service role; clients cannot unban)
create or replace function public.users_preserve_banned_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.jwt() ->> 'role', '');
  if tg_op = 'UPDATE' and (old.banned is distinct from new.banned) and jwt_role <> 'service_role' then
    new.banned := old.banned;
  end if;
  return new;
end;
$$;

drop trigger if exists users_preserve_banned_column on public.users;
create trigger users_preserve_banned_column
  before update on public.users
  for each row
  execute procedure public.users_preserve_banned_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone, name)
  values (
    new.id,
    new.phone,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Adventurer'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

create or replace function public.handle_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  total_people integer;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- Accepted: was not accepted, now accepted
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    update public.slots
    set spots_taken = spots_taken + 1
    where id = new.slot_id;

    select s.max_spots, 1 + s.spots_taken
    into cap, total_people
    from public.slots s
    where s.id = new.slot_id;

    if total_people >= cap then
      update public.slots set status = 'full' where id = new.slot_id;
    end if;

    insert into public.notifications (user_id, type, title, body, slot_id)
    values (
      new.applicant_id,
      'accepted',
      'Accepted to party',
      'The host accepted your application.',
      new.slot_id
    );
  end if;

  -- Rejected from pending
  if new.status = 'rejected' and old.status = 'pending' then
    insert into public.notifications (user_id, type, title, body, slot_id)
    values (
      new.applicant_id,
      'rejected',
      'Application declined',
      'The host did not accept this application.',
      new.slot_id
    );
  end if;

  -- Un-accept (host changes mind): rare but keep counts consistent
  if old.status = 'accepted' and new.status is distinct from 'accepted' then
    update public.slots
    set
      spots_taken = greatest(0, spots_taken - 1),
      status = case when status = 'full' then 'open' else status end
    where id = new.slot_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_applications_status on public.applications;
create trigger trg_applications_status
  after update on public.applications
  for each row
  execute procedure public.handle_application_status_change();

-- Optional: notify host when someone applies (INSERT pending)
create or replace function public.notify_host_new_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
  slot_title text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select s.host_id, s.title into hid, slot_title
  from public.slots s
  where s.id = new.slot_id;

  insert into public.notifications (user_id, type, title, body, slot_id)
  values (
    hid,
    'application',
    'New party application',
    'Someone applied to: ' || coalesce(slot_title, 'your slot'),
    new.slot_id
  );

  return new;
end;
$$;

drop trigger if exists trg_applications_insert_notify on public.applications;
create trigger trg_applications_insert_notify
  after insert on public.applications
  for each row
  execute procedure public.notify_host_new_application();

-- ---------------------------------------------------------------------------
-- 5. STORAGE — avatars bucket + policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Remove old storage policies for this bucket if re-running
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'avatars_%'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_insert_own_folder
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy avatars_update_own_folder
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy avatars_delete_own_folder
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 6. OPTIONAL — one-time backfill if users existed before this migration
-- ---------------------------------------------------------------------------
-- insert into public.users (id, phone, name)
-- select au.id, au.phone, coalesce(au.raw_user_meta_data->>'name', 'Adventurer')
-- from auth.users au
-- where not exists (select 1 from public.users u where u.id = au.id)
-- on conflict (id) do nothing;

-- Upload paths for avatars: "{auth.uid()}/avatar.jpg" (first path segment = user id)

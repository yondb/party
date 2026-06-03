-- Consolidated patches (formerly supabase/patch_*.sql).
-- Safe to re-run on existing databases. Apply via Supabase CLI or SQL Editor.

-- 1) slots.gender_scope
alter table public.slots add column if not exists gender_scope text;

update public.slots
set gender_scope = 'any'
where gender_scope is null or trim(gender_scope) not in ('any', 'female', 'male');

alter table public.slots alter column gender_scope set default 'any';
alter table public.slots alter column gender_scope set not null;

alter table public.slots drop constraint if exists slots_gender_scope_check;
alter table public.slots
  add constraint slots_gender_scope_check check (gender_scope in ('any', 'female', 'male'));

-- 2) profile reports + user ban flag
alter table public.users add column if not exists banned boolean not null default false;

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

create index if not exists idx_profile_reports_status on public.profile_reports (status);
create index if not exists idx_profile_reports_reported on public.profile_reports (reported_user_id);
create index if not exists idx_profile_reports_created on public.profile_reports (created_at desc);
create index if not exists idx_users_banned on public.users (banned) where banned = true;

alter table public.profile_reports enable row level security;

drop policy if exists profile_reports_insert_reporter on public.profile_reports;
drop policy if exists profile_reports_select_own on public.profile_reports;

create policy profile_reports_insert_reporter
  on public.profile_reports for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    and reported_user_id <> auth.uid()
    and char_length(trim(reason)) between 10 and 2000
  );

create policy profile_reports_select_own
  on public.profile_reports for select
  to authenticated
  using (reporter_id = auth.uid());

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

-- 3) applications INSERT: gender_scope + min_level + min_reliability
drop policy if exists applications_insert_self_open_slot on public.applications;

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
        and coalesce(s.min_reliability, 0) <= coalesce(u.reliability_score, 1)
        and coalesce(s.min_level, 0) <= coalesce(u.level, 1)
    )
    and not exists (
      select 1 from public.applications a2
      where a2.slot_id = applications.slot_id
        and a2.applicant_id = auth.uid()
        and a2.status in ('pending', 'accepted')
    )
  );

notify pgrst, 'reload schema';

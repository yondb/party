-- One-off migration: profile reports + ban flag (run on existing DBs that already have core schema).
-- Safe to run multiple times where supported (IF NOT EXISTS).

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

-- Policies: drop if re-applying (names fixed)
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

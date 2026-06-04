-- Growth event bus for funnel measurement and automation triggers.

create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid references auth.users (id) on delete set null,
  slot_id uuid references public.slots (id) on delete set null,
  place_id uuid references public.places (id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_growth_events_name_created
  on public.growth_events (event_name, created_at desc);

create index if not exists idx_growth_events_user
  on public.growth_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists idx_growth_events_slot
  on public.growth_events (slot_id, created_at desc)
  where slot_id is not null;

alter table public.growth_events enable row level security;

-- Inserts only via service role (API routes / cron).
create policy growth_events_select_admin
  on public.growth_events for select
  to authenticated
  using (false);

grant select on public.growth_events to service_role;
grant insert on public.growth_events to service_role;

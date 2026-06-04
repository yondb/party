create table if not exists public.growth_content_queue (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references public.slots (id) on delete cascade,
  channel text not null check (channel in ('reddit', 'nextdoor', 'facebook', 'copy')),
  title text not null,
  body text not null,
  invite_url text not null,
  status text not null default 'ready' check (status in ('ready', 'posted', 'skipped')),
  created_at timestamptz not null default now(),
  posted_at timestamptz
);

create index if not exists idx_growth_content_queue_status
  on public.growth_content_queue (status, created_at desc);

alter table public.growth_content_queue enable row level security;

grant select, insert, update on public.growth_content_queue to service_role;

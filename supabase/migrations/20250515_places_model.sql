-- lfparty: Places → Slots model
-- Run in Supabase SQL Editor after backup if you have production data.

-- ---------------------------------------------------------------------------
-- places (static venues on the map)
-- ---------------------------------------------------------------------------

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (
    category in (
      'running',
      'cycling',
      'gym',
      'padel',
      'tennis',
      'basketball',
      'hiking',
      'board_games'
    )
  ),
  lat double precision not null,
  lng double precision not null,
  city text not null default 'warsaw',
  district text,
  is_free boolean not null default true,
  osm_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists places_osm_id_unique
  on public.places (osm_id)
  where osm_id is not null;

create index if not exists idx_places_category on public.places (category);
create index if not exists idx_places_city on public.places (city);
create index if not exists idx_places_lat_lng on public.places (lat, lng);

-- ---------------------------------------------------------------------------
-- slots: link to place (nullable for legacy rows)
-- ---------------------------------------------------------------------------

alter table public.slots add column if not exists place_id uuid references public.places (id) on delete set null;

create index if not exists idx_slots_place_id on public.slots (place_id);

-- ---------------------------------------------------------------------------
-- RLS: places readable by authenticated users; writes via service role / admin
-- ---------------------------------------------------------------------------

alter table public.places enable row level security;

drop policy if exists places_select_authenticated on public.places;
create policy places_select_authenticated
  on public.places for select
  to authenticated
  using (true);

-- Inserts/updates for import script use service role; optional admin policy later.

-- Seed a few Warsaw places for dev / before OSM import
insert into public.places (name, category, lat, lng, city, district, osm_id)
values
  ('Łazienki Królewskie', 'running', 52.2152, 21.0354, 'warsaw', 'Mokotów', 'seed-lazienki'),
  ('Pole Mokotowskie', 'running', 52.2089, 21.0202, 'warsaw', 'Mokotów', 'seed-pole-mokotowskie'),
  ('Bulwary Wiślane', 'cycling', 52.2401, 21.0285, 'warsaw', 'Śródmieście', 'seed-bulwary'),
  ('Multikino Złote Tarasy', 'board_games', 52.2297, 21.0022, 'warsaw', 'Śródmieście', 'seed-zlote-tarasy')
on conflict (osm_id) where osm_id is not null do nothing;

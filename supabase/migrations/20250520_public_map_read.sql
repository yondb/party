-- Allow anonymous users to browse the map (places + open slots at venues).

drop policy if exists places_select_public on public.places;
create policy places_select_public
  on public.places for select
  to anon, authenticated
  using (true);

drop policy if exists slots_select_public_map on public.slots;
create policy slots_select_public_map
  on public.slots for select
  to anon
  using (status in ('open', 'full') and place_id is not null);

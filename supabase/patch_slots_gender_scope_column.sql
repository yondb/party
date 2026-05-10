-- Add slots.gender_scope for existing databases (fixes PostgREST:
-- "Could not find the gender_scope column of slots in the schema cache").
-- Run once in Supabase → SQL Editor. Safe to re-run.

alter table public.slots add column if not exists gender_scope text;

update public.slots
set gender_scope = 'any'
where gender_scope is null or trim(gender_scope) not in ('any', 'female', 'male');

alter table public.slots alter column gender_scope set default 'any';
alter table public.slots alter column gender_scope set not null;

alter table public.slots drop constraint if exists slots_gender_scope_check;
alter table public.slots add constraint slots_gender_scope_check check (gender_scope in ('any', 'female', 'male'));

-- Optional: tell PostgREST to reload (usually automatic within ~1 min)
notify pgrst, 'reload schema';

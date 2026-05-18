-- Fix: Supabase upsert(onConflict: 'osm_id') needs a UNIQUE constraint (not only partial index)

DROP INDEX IF EXISTS public.places_osm_id_unique;

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_osm_id_key;

ALTER TABLE public.places
  ADD CONSTRAINT places_osm_id_key UNIQUE (osm_id);

-- Expand free place categories from 5 to 9 (playground, walking, football, park).

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE public.places ADD CONSTRAINT places_category_check CHECK (
  category IN (
    'running',
    'cycling',
    'gym',
    'basketball',
    'hiking',
    'playground',
    'walking',
    'football',
    'park',
    'padel',
    'tennis'
  )
);

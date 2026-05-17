-- Remove board_games category (7 sport categories only)

DELETE FROM public.places WHERE category = 'board_games';

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE public.places ADD CONSTRAINT places_category_check CHECK (
  category IN (
    'running',
    'cycling',
    'gym',
    'padel',
    'tennis',
    'basketball',
    'hiking'
  )
);

-- Austin pivot: walking → dog_walk, keep 9 free categories.
-- MUST drop CHECK before UPDATE (dog_walk not in old constraint).

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_category_check;

UPDATE public.places SET category = 'dog_walk' WHERE category = 'walking';
UPDATE public.slots SET activity_type = 'dog_walk' WHERE activity_type = 'walking';

-- Remap legacy categories if any remain
UPDATE public.places SET category = 'park'
WHERE category IN ('board_games', 'volleyball', 'coffee', 'yoga', 'movies', 'food', 'study', 'other');

DELETE FROM public.places
WHERE category NOT IN (
  'running', 'cycling', 'gym', 'basketball', 'hiking', 'playground',
  'dog_walk', 'football', 'park', 'padel', 'tennis'
);

ALTER TABLE public.places ADD CONSTRAINT places_category_check CHECK (
  category IN (
    'running',
    'cycling',
    'gym',
    'basketball',
    'hiking',
    'playground',
    'dog_walk',
    'football',
    'park',
    'padel',
    'tennis'
  )
);

notify pgrst, 'reload schema';

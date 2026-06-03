-- Austin pivot: walking → dog_walk, keep 9 free categories.
-- Must drop CHECK before UPDATE (dog_walk not in old constraint).

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_category_check;

UPDATE public.places SET category = 'dog_walk' WHERE category = 'walking';
UPDATE public.slots SET activity_type = 'dog_walk' WHERE activity_type = 'walking';

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

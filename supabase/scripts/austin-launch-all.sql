-- Austin launch — paste entire file into Supabase SQL Editor and Run once.
-- If this failed before: run the DIAGNOSTIC block below first, then re-run this file.

-- ═══ DIAGNOSTIC (optional — run alone to see bad rows) ═══
-- SELECT category, city, count(*) FROM public.places GROUP BY 1, 2 ORDER BY 1, 2;

-- ═══ 0) Drop category constraint — do NOT re-add until data is clean ═══
ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_category_check;

-- ═══ 1) Consolidated patches (safe to re-run) ═══
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS gender_scope text;
UPDATE public.slots SET gender_scope = 'any'
WHERE gender_scope IS NULL OR trim(gender_scope) NOT IN ('any', 'female', 'male');
ALTER TABLE public.slots ALTER COLUMN gender_scope SET DEFAULT 'any';
ALTER TABLE public.slots ALTER COLUMN gender_scope SET NOT NULL;
ALTER TABLE public.slots DROP CONSTRAINT IF EXISTS slots_gender_scope_check;
ALTER TABLE public.slots ADD CONSTRAINT slots_gender_scope_check
  CHECK (gender_scope IN ('any', 'female', 'male'));

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.profile_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_reports_reason_len CHECK (char_length(trim(reason)) BETWEEN 10 AND 2000),
  CONSTRAINT profile_reports_no_self CHECK (reported_user_id <> reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON public.profile_reports (status);
CREATE INDEX IF NOT EXISTS idx_profile_reports_reported ON public.profile_reports (reported_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_reports_created ON public.profile_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_banned ON public.users (banned) WHERE banned = true;

ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profile_reports_insert_reporter ON public.profile_reports;
DROP POLICY IF EXISTS profile_reports_select_own ON public.profile_reports;
CREATE POLICY profile_reports_insert_reporter ON public.profile_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND reported_user_id <> auth.uid()
    AND char_length(trim(reason)) BETWEEN 10 AND 2000);
CREATE POLICY profile_reports_select_own ON public.profile_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS applications_insert_self_open_slot ON public.applications;
CREATE POLICY applications_insert_self_open_slot ON public.applications FOR INSERT TO authenticated
  WITH CHECK (
    applicant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.slots s INNER JOIN public.users u ON u.id = auth.uid()
      WHERE s.id = applications.slot_id AND s.host_id <> auth.uid() AND s.status = 'open'
        AND (1 + s.spots_taken) < s.max_spots
        AND (coalesce(s.gender_scope, 'any') = 'any'
          OR (s.gender_scope = 'female' AND u.gender = 'female')
          OR (s.gender_scope = 'male' AND u.gender = 'male'))
        AND coalesce(s.min_reliability, 0) <= coalesce(u.reliability_score, 1)
        AND coalesce(s.min_level, 0) <= coalesce(u.level, 1)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.applications a2
      WHERE a2.slot_id = applications.slot_id AND a2.applicant_id = auth.uid()
        AND a2.status IN ('pending', 'accepted')
    )
  );

-- ═══ 2) Clean place categories BEFORE adding constraint ═══
-- walking → dog_walk (Austin pivot)
UPDATE public.places SET category = 'dog_walk' WHERE category = 'walking';
UPDATE public.slots SET activity_type = 'dog_walk' WHERE activity_type = 'walking';

-- Legacy Warsaw / old categories → nearest valid bucket
UPDATE public.places SET category = 'park'
WHERE category IN ('board_games', 'volleyball', 'coffee', 'yoga', 'movies', 'food', 'study', 'other');

UPDATE public.places SET category = 'football' WHERE category = 'soccer';

-- Remove rows that still cannot map (should be none after above)
DELETE FROM public.places
WHERE category NOT IN (
  'running', 'cycling', 'gym', 'basketball', 'hiking', 'playground',
  'dog_walk', 'football', 'park', 'padel', 'tennis'
);

-- Optional: drop non-Austin places before OSM re-import (uncomment if needed)
-- DELETE FROM public.places WHERE city IS DISTINCT FROM 'austin';

-- ═══ 3) Add final constraint (dog_walk, not walking) ═══
ALTER TABLE public.places ADD CONSTRAINT places_category_check CHECK (
  category IN (
    'running', 'cycling', 'gym', 'basketball', 'hiking', 'playground',
    'dog_walk', 'football', 'park', 'padel', 'tennis'
  )
);

NOTIFY pgrst, 'reload schema';

-- Verify:
-- SELECT category, city, count(*) FROM public.places GROUP BY 1, 2 ORDER BY 1, 2;

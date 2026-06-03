-- Superseded by migrations/20250530_consolidate_patches.sql (kept for reference).
-- ---------------------------------------------------------------------------
-- Patch: enforce slot min_level / min_reliability at the RLS layer
-- ---------------------------------------------------------------------------
-- Context:
--   applyToSlot (app/actions/applications.ts) already blocks applicants whose
--   reliability_score / level are below the slot's requirements. This patch adds
--   the same guard to the row-level-security INSERT policy as defense-in-depth,
--   so the rule holds even if an application row is inserted outside the action.
--
-- Safe to run multiple times (drops and recreates the single policy).
-- Requires columns: slots.min_reliability, slots.min_level,
--                    users.reliability_score, users.level
-- ---------------------------------------------------------------------------

drop policy if exists applications_insert_self_open_slot on public.applications;

create policy applications_insert_self_open_slot
  on public.applications for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1
      from public.slots s
      inner join public.users u on u.id = auth.uid()
      where s.id = applications.slot_id
        and s.host_id <> auth.uid()
        and s.status = 'open'
        and (1 + s.spots_taken) < s.max_spots
        and (
          coalesce(s.gender_scope, 'any') = 'any'
          or (s.gender_scope = 'female' and u.gender = 'female')
          or (s.gender_scope = 'male' and u.gender = 'male')
        )
        and coalesce(s.min_reliability, 0) <= coalesce(u.reliability_score, 1)
        and coalesce(s.min_level, 0) <= coalesce(u.level, 1)
    )
    and not exists (
      select 1 from public.applications a2
      where a2.slot_id = applications.slot_id
        and a2.applicant_id = auth.uid()
        and a2.status in ('pending', 'accepted')
    )
  );

-- One-off: enforce slot gender_scope at RLS (bypass-proof). Run in Supabase SQL Editor if the
-- policy was created before this join existed. Safe to re-run.

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
    )
    and not exists (
      select 1 from public.applications a2
      where a2.slot_id = applications.slot_id
        and a2.applicant_id = auth.uid()
        and a2.status in ('pending', 'accepted')
    )
  );

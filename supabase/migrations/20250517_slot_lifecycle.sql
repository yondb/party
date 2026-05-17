-- Auto-complete past slots + rating reminders for all participants

create or replace function public.notify_slot_rate_reminder(p_slot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  uid uuid;
begin
  select id, title, host_id into s from public.slots where id = p_slot_id;
  if s.id is null then
    return;
  end if;

  for uid in
    select s.host_id
    union
    select a.applicant_id
    from public.applications a
    where a.slot_id = p_slot_id and a.status = 'accepted'
  loop
    insert into public.notifications (user_id, type, title, body, slot_id)
    select
      uid,
      'rate_slot',
      'Rate your party',
      'How was "' || coalesce(s.title, 'your slot') || '"? Share quick ratings.',
      p_slot_id
    where not exists (
      select 1
      from public.notifications n
      where n.user_id = uid
        and n.slot_id = p_slot_id
        and n.type = 'rate_slot'
    );
  end loop;
end;
$$;

create or replace function public.auto_complete_past_slots()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select id
    from public.slots
    where status in ('open', 'full')
      and date_time < now()
  loop
    update public.slots set status = 'completed' where id = r.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

grant execute on function public.auto_complete_past_slots() to authenticated;

-- Host hosted count when slot completes (once per slot)
create or replace function public.on_slot_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.users
    set total_hosted = coalesce(total_hosted, 0) + 1
    where id = new.host_id;
    perform public.notify_slot_rate_reminder(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_slot_completed on public.slots;
create trigger trg_slot_completed
  after update of status on public.slots
  for each row
  execute procedure public.on_slot_completed();

-- Ratings only after slot is completed
drop policy if exists ratings_insert_participant on public.ratings;
create policy ratings_insert_participant
  on public.ratings for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and rated_id <> rater_id
    and exists (
      select 1 from public.slots s
      where s.id = slot_id and s.status = 'completed'
    )
    and (
      exists (select 1 from public.slots s where s.id = slot_id and s.host_id = auth.uid())
      or exists (
        select 1 from public.applications a
        where a.slot_id = slot_id and a.applicant_id = auth.uid() and a.status = 'accepted'
      )
    )
    and (
      exists (select 1 from public.slots s where s.id = slot_id and s.host_id = rated_id)
      or exists (
        select 1 from public.applications a
        where a.slot_id = slot_id and a.applicant_id = rated_id and a.status = 'accepted'
      )
    )
  );

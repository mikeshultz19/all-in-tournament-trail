-- Remove the retired No Show feature without changing registrations, results,
-- projections, check-in state, or financial records. This migration is safe
-- after any subset of the September 15 corrective migrations.
--
-- Rollback limitation: no_show_at/no_show_by_admin_id values are discarded when
-- these columns are dropped. They cannot be reconstructed without a pre-migration
-- backup. A rollback would need to recreate the columns and former RPC behavior;
-- it must not infer attendance values from results, weights, or other data.

-- Keep ordinary Check In / Edit-Reopen behavior and remove the retired actions.
create or replace function public.set_registration_attendance(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_attendance_action text,
  p_admin_user_id uuid
)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
begin
  if p_admin_user_id is null
    or p_attendance_action not in ('check_in', 'clear_check_in') then
    raise exception using errcode = '22023', message = 'AITT_ATTENDANCE_INPUT_INVALID';
  end if;

  select registration.* into v_registration
  from public.tournament_registrations registration
  join public.tournaments tournament on tournament.id = registration.tournament_id
  where registration.id = p_registration_id
    and registration.tournament_id = p_tournament_id
    and registration.registration_status = 'active'
    and tournament.result_status <> 'official'
  for update of registration;

  if not found then
    raise exception using errcode = '55000', message = 'AITT_ATTENDANCE_LOCKED_OR_NOT_FOUND';
  end if;

  if p_attendance_action = 'check_in' then
    if v_registration.boat_number is null then
      raise exception using errcode = '23514', message = 'AITT_ATTENDANCE_BOAT_NUMBER_REQUIRED';
    end if;
    if v_registration.identity_review_status = 'review_required' or exists (
      select 1 from public.registration_identity_reviews review
      where review.registration_id = v_registration.id
        and review.review_status = 'review_required'
    ) then
      raise exception using errcode = '23514', message = 'AITT_ATTENDANCE_REVIEW_REQUIRED';
    end if;
    update public.tournament_registrations set
      checked_in_at = now(), checked_in_by_admin_id = p_admin_user_id,
      updated_at = now()
    where id = v_registration.id returning * into v_registration;
  else
    update public.tournament_registrations set
      checked_in_at = null, checked_in_by_admin_id = null, updated_at = now()
    where id = v_registration.id returning * into v_registration;
  end if;

  return v_registration;
end;
$$;

revoke all on function public.set_registration_attendance(uuid,uuid,text,uuid)
  from public, anon, authenticated;
grant execute on function public.set_registration_attendance(uuid,uuid,text,uuid)
  to service_role;

drop trigger if exists tournament_result_enforce_no_show_zero
  on public.tournament_result_entries;
drop function if exists public.enforce_no_show_zero_result();
drop function if exists public.create_no_show_working_result(uuid, uuid, uuid);

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_attendance_exclusive_check,
  drop constraint if exists tournament_registrations_no_show_pair_check,
  drop column if exists no_show_by_admin_id,
  drop column if exists no_show_at;

-- Refuse to rewrite historical result/projection data. A database containing a
-- persisted retired status requires an explicit backup-led review before this
-- migration may proceed.
do $$
begin
  if exists (select 1 from public.tournament_result_entries where participation_status = 'no_show')
    or exists (select 1 from public.official_result_entries where participation_status = 'no_show')
    or exists (select 1 from public.aoy_tournament_performances where participation_status = 'no_show')
    or exists (select 1 from public.championship_participation_records where participation_status = 'no_show' or exclusion_reason = 'no_show') then
    raise exception using errcode = '23514', message = 'AITT_RETIRED_NO_SHOW_DATA_REQUIRES_REVIEW';
  end if;
end;
$$;

alter table public.tournament_result_entries
  drop constraint if exists tournament_result_entries_participation_status_check,
  add constraint tournament_result_entries_participation_status_check check (
    participation_status in ('participated', 'withdrew_after_start', 'disqualified')
  );

alter table public.official_result_entries
  drop constraint if exists official_result_entries_participation_status_check,
  add constraint official_result_entries_participation_status_check check (
    participation_status in ('participated', 'withdrew_after_start', 'disqualified')
  );

alter table public.aoy_tournament_performances
  drop constraint if exists aoy_performance_status_check,
  add constraint aoy_performance_status_check check (
    participation_status in ('participated', 'withdrew_after_start', 'disqualified')
  );

alter table public.championship_participation_records
  drop constraint if exists championship_participation_status_check,
  add constraint championship_participation_status_check check (
    participation_status in ('participated', 'withdrew_after_start', 'disqualified')
  ),
  drop constraint if exists championship_participation_reason_check,
  add constraint championship_participation_reason_check check (
    exclusion_reason is null or exclusion_reason in ('ineligible', 'disqualified')
  );

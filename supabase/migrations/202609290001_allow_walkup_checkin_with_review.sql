-- Walk-up registrations are paid and captured in person. An unresolved
-- membership or identity review is informational for walk-ups and may be
-- resolved after check-in. Online registrations remain blocked until review
-- is resolved.

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
    if v_registration.registration_source <> 'walk_up'
      and (v_registration.identity_review_status = 'review_required' or exists (
        select 1 from public.registration_identity_reviews review
        where review.registration_id = v_registration.id
          and review.review_status = 'review_required'
      )) then
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

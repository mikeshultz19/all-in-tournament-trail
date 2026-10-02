-- Report duplicate manually assigned boat numbers before other check-in warnings.
create or replace function public.set_registration_attendance_with_boat_number(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_attendance_action text,
  p_admin_user_id uuid,
  p_assigned_boat_number integer
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
    or p_attendance_action <> 'check_in'
    or p_assigned_boat_number is null
    or p_assigned_boat_number < 1
    or p_assigned_boat_number > 999 then
    raise exception using errcode = '22023', message = 'AITT_ATTENDANCE_BOAT_NUMBER_REQUIRED';
  end if;

  if exists (
    select 1
    from public.tournament_registrations duplicate
    where duplicate.tournament_id = p_tournament_id
      and duplicate.id <> p_registration_id
      and duplicate.registration_status = 'active'
      and duplicate.assigned_boat_number = p_assigned_boat_number
  ) then
    raise exception using errcode = '23505', message = 'Duplicate numbers cannot be used.';
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
    assigned_boat_number = p_assigned_boat_number,
    checked_in_at = now(),
    checked_in_by_admin_id = p_admin_user_id,
    updated_at = now()
  where id = v_registration.id
  returning * into v_registration;

  return v_registration;
end;
$$;

revoke all on function public.set_registration_attendance_with_boat_number(uuid,uuid,text,uuid,integer)
  from public, anon, authenticated;
grant execute on function public.set_registration_attendance_with_boat_number(uuid,uuid,text,uuid,integer)
  to service_role;

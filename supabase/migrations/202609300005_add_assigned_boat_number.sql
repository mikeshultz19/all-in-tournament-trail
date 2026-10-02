-- Store the manually assigned launch boat number separately from the
-- immutable registration number currently stored in boat_number.

alter table public.tournament_registrations
  add column if not exists assigned_boat_number integer;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_assigned_boat_number_check,
  add constraint tournament_registrations_assigned_boat_number_check check (
    assigned_boat_number is null or assigned_boat_number between 1 and 999
  );

create unique index if not exists tournament_registrations_tournament_assigned_boat_number_uidx
  on public.tournament_registrations (tournament_id, assigned_boat_number)
  where assigned_boat_number is not null and registration_status = 'active';

create or replace function public.admin_update_registration_assigned_boat_number(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_assigned_boat_number integer,
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
    or (p_assigned_boat_number is not null and (p_assigned_boat_number < 1 or p_assigned_boat_number > 999)) then
    raise exception using errcode = '22023', message = 'AITT_ASSIGNED_BOAT_NUMBER_INVALID';
  end if;

  update public.tournament_registrations
  set assigned_boat_number = p_assigned_boat_number,
      updated_at = now()
  where id = p_registration_id
    and tournament_id = p_tournament_id
    and registration_status = 'active'
    and checked_in_at is null
  returning * into v_registration;

  if not found then
    raise exception using errcode = '23503', message = 'AITT_ASSIGNED_BOAT_NUMBER_LOCKED_OR_NOT_FOUND';
  end if;

  return v_registration;
end;
$$;

revoke all on function public.admin_update_registration_assigned_boat_number(uuid,uuid,integer,uuid)
  from public, anon, authenticated;
grant execute on function public.admin_update_registration_assigned_boat_number(uuid,uuid,integer,uuid)
  to service_role;

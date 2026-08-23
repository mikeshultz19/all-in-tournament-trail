-- Assign tournament-specific boat numbers only after verified online payment,
-- and serialize walk-up numbering on the same tournament-scoped lock.

create or replace function public.mark_online_registration_payment_completed(
  p_registration_id uuid,
  p_square_payment_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_next_boat_number integer;
begin
  if nullif(btrim(p_square_payment_id), '') is null then
    raise exception using errcode = '22023', message = 'AITT_SQUARE_PAYMENT_ID_REQUIRED';
  end if;

  select * into v_registration
  from public.tournament_registrations
  where id = p_registration_id
    and registration_source = 'online'
    and payment_reference = btrim(p_square_payment_id)
  for update;

  if not found then
    raise exception using errcode = '23503', message = 'AITT_ONLINE_REGISTRATION_PAYMENT_NOT_FOUND';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'tournament-boat-number:' || v_registration.tournament_id::text,
    0
  ));

  if v_registration.boat_number is null then
    select coalesce(max(boat_number), 0) + 1
    into v_next_boat_number
    from public.tournament_registrations
    where tournament_id = v_registration.tournament_id
      and boat_number is not null;
  else
    v_next_boat_number := v_registration.boat_number;
  end if;

  update public.tournament_registrations
  set boat_number = v_next_boat_number,
      online_payment_state = 'completed',
      square_payment_id = btrim(p_square_payment_id),
      updated_at = now()
  where id = v_registration.id;
end;
$$;

revoke all on function public.mark_online_registration_payment_completed(uuid,text)
  from public, anon, authenticated;
grant execute on function public.mark_online_registration_payment_completed(uuid,text)
  to service_role;

create or replace function public.admin_create_sequential_walkup_registration(
  p_tournament_id uuid,
  p_registration_type text,
  p_anglers jsonb,
  p_options jsonb,
  p_payment_method text,
  p_total_paid_cents integer,
  p_admin_user_id uuid
)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_next_boat_number integer;
  v_registration public.tournament_registrations;
begin
  perform pg_advisory_xact_lock(hashtextextended(
    'tournament-boat-number:' || p_tournament_id::text,
    0
  ));

  select coalesce(max(boat_number), 0) + 1
  into v_next_boat_number
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and boat_number is not null;

  select * into v_registration
  from public.admin_create_walkup_registration(
    p_tournament_id,
    p_registration_type,
    p_anglers,
    v_next_boat_number,
    p_options,
    p_payment_method,
    p_total_paid_cents,
    p_admin_user_id
  );

  return v_registration;
end;
$$;

revoke all on function public.admin_create_sequential_walkup_registration(
  uuid,text,jsonb,jsonb,text,integer,uuid
) from public, anon, authenticated;
grant execute on function public.admin_create_sequential_walkup_registration(
  uuid,text,jsonb,jsonb,text,integer,uuid
) to service_role;

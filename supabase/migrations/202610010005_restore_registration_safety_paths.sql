-- Restore the approved registration paths after the October 1 wrapper update:
-- walk-up reviews remain informational for check-in, active-only email identity
-- matching is used, and new anglers retain their submitted address details.

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
  if p_admin_user_id is null or p_attendance_action <> 'check_in'
    or (p_assigned_boat_number is not null and (p_assigned_boat_number < 1 or p_assigned_boat_number > 999)) then
    raise exception using errcode = '22023', message = 'AITT_ATTENDANCE_BOAT_NUMBER_INVALID';
  end if;

  if p_assigned_boat_number is not null and exists (
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

  if coalesce(v_registration.registration_source, '') <> 'walk_up'
    and (v_registration.identity_review_status = 'review_required' or exists (
      select 1 from public.registration_identity_reviews review
      where review.registration_id = v_registration.id
        and review.review_status = 'review_required'
    )) then
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

create or replace function public.complete_durable_registration(
  p_tournament_id uuid,
  p_registration_type text,
  p_anglers jsonb,
  p_options jsonb,
  p_payment_reference text,
  p_rules_version text,
  p_waiver_version text,
  p_price_snapshot jsonb
)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_expected_count integer;
  v_index integer;
  v_existing_ids uuid[] := array[]::uuid[];
  v_email_match_ids uuid[];
  v_name_match_ids uuid[];
  v_existing_id uuid;
  v_canonical public.anglers;
  v_angler_id uuid;
  v_contact jsonb;
  v_contact_snapshot jsonb := '[]'::jsonb;
  v_core_anglers jsonb := p_anglers;
  v_normalized_name text;
begin
  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  for v_index in 0..(v_expected_count - 1) loop
    v_contact := public.registration_participant_contact(p_anglers -> v_index);
    if nullif(v_contact ->> 'firstName', '') is null
      or nullif(v_contact ->> 'lastName', '') is null
      or nullif(v_contact ->> 'streetAddress', '') is null
      or nullif(v_contact ->> 'city', '') is null
      or nullif(v_contact ->> 'state', '') is null
      or nullif(v_contact ->> 'zipCode', '') is null
      or nullif(v_contact ->> 'email', '') is null
      or nullif(v_contact ->> 'phone', '') is null then
      raise exception using errcode = '22023', message = 'AITT_REGISTRATION_CONTACT_REQUIRED';
    end if;
    v_contact_snapshot := v_contact_snapshot || jsonb_build_array(v_contact);

    select array_agg(id order by id::text) into v_email_match_ids
    from public.anglers
    where lower(btrim(email)) = lower(btrim(v_contact ->> 'email'))
      and is_active = true
      and merged_into_angler_id is null;
    if coalesce(array_length(v_email_match_ids, 1), 0) > 1 then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED';
    end if;

    v_existing_id := v_email_match_ids[1];
    if v_existing_id is null and (p_anglers -> v_index ->> 'membership') = 'current' then
      v_normalized_name := lower(regexp_replace(
        btrim(p_anglers -> v_index ->> 'firstName') || ' ' || btrim(p_anglers -> v_index ->> 'lastName'),
        '\s+', ' ', 'g'
      ));
      select array_agg(id order by id::text) into v_name_match_ids
      from public.anglers
      where is_active = true
        and merged_into_angler_id is null
        and normalized_name = v_normalized_name;
      if coalesce(array_length(v_name_match_ids, 1), 0) = 1 then
        v_existing_id := v_name_match_ids[1];
        select * into v_canonical from public.anglers where id = v_existing_id;
        if v_canonical.email is not null then
          v_core_anglers := jsonb_set(v_core_anglers, array[v_index::text, 'email'], to_jsonb(v_canonical.email), true);
        end if;
        if v_canonical.phone is not null then
          v_core_anglers := jsonb_set(v_core_anglers, array[v_index::text, 'mobilePhone'], to_jsonb(v_canonical.phone), true);
        end if;
      end if;
    end if;
    v_existing_ids := array_append(v_existing_ids, v_existing_id);
    v_existing_id := null;
    v_email_match_ids := null;
    v_name_match_ids := null;
  end loop;

  select * into v_registration from public.complete_durable_registration_core(
    p_tournament_id, p_registration_type, v_core_anglers, p_options,
    p_payment_reference, p_rules_version, p_waiver_version, p_price_snapshot
  );
  if v_registration.participant_contact_snapshot is not null then return v_registration; end if;

  update public.tournament_registrations set
    participant_contact_snapshot = v_contact_snapshot, updated_at = now()
  where id = v_registration.id returning * into v_registration;

  for v_index in 0..(v_expected_count - 1) loop
    if v_existing_ids[v_index + 1] is null then
      v_contact := v_contact_snapshot -> v_index;
      v_angler_id := case when v_index = 0 then v_registration.angler1_id else v_registration.angler2_id end;
      update public.anglers set
        street_address = nullif(v_contact ->> 'streetAddress', ''),
        city = nullif(v_contact ->> 'city', ''),
        state = nullif(v_contact ->> 'state', ''),
        zip_code = nullif(v_contact ->> 'zipCode', ''),
        updated_at = now()
      where id = v_angler_id;
    end if;
  end loop;
  return v_registration;
end;
$$;

revoke all on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  to service_role;

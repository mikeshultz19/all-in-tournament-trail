-- Add tournament-morning operational fields and an Admin-only walk-up path.
-- The walk-up function delegates identity, membership, and competitive-record
-- creation to the existing durable registration function.

alter table public.tournament_registrations
  add column if not exists boat_number integer,
  add column if not exists registration_source text not null default 'online',
  add column if not exists payment_method text,
  add column if not exists registration_status text not null default 'active',
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by_admin_id uuid;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_boat_number_check,
  add constraint tournament_registrations_boat_number_check check (
    boat_number is null or boat_number > 0
  ),
  drop constraint if exists tournament_registrations_source_check,
  add constraint tournament_registrations_source_check check (
    registration_source in ('online', 'walk_up')
  ),
  drop constraint if exists tournament_registrations_payment_method_check,
  add constraint tournament_registrations_payment_method_check check (
    payment_method is null or payment_method in ('online', 'cash', 'card', 'other')
  ),
  drop constraint if exists tournament_registrations_status_check,
  add constraint tournament_registrations_status_check check (
    registration_status in ('active', 'cancelled')
  ),
  drop constraint if exists tournament_registrations_cancellation_check,
  add constraint tournament_registrations_cancellation_check check (
    (registration_status = 'active' and cancelled_at is null and cancelled_by_admin_id is null)
    or (registration_status = 'cancelled' and cancelled_at is not null and cancelled_by_admin_id is not null)
  );

drop index if exists public.tournament_registrations_tournament_boat_uidx;
create unique index tournament_registrations_tournament_boat_uidx
  on public.tournament_registrations (tournament_id, boat_number)
  where boat_number is not null and registration_status = 'active';

-- Preserve the original durable implementation once, then add immutable
-- per-registration contact snapshots and contact-change review detection.
do $$
begin
  if to_regprocedure('public.complete_durable_registration_core(uuid,text,jsonb,jsonb,text,text,text,jsonb)') is null then
    alter function public.complete_durable_registration(
      uuid, text, jsonb, jsonb, text, text, text, jsonb
    ) rename to complete_durable_registration_core;
  end if;
end;
$$;

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
  v_existing_id uuid;
  v_angler_id uuid;
  v_contact jsonb;
  v_contact_snapshot jsonb := '[]'::jsonb;
  v_differences text[];
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
    select array_agg(id order by id::text) into v_email_match_ids from public.anglers
    where lower(btrim(email)) = lower(btrim(v_contact ->> 'email'))
      and merged_into_angler_id is null;
    if coalesce(array_length(v_email_match_ids, 1), 0) > 1 then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED';
    end if;
    v_existing_id := v_email_match_ids[1];
    v_existing_ids := array_append(v_existing_ids, v_existing_id);
    v_existing_id := null;
    v_email_match_ids := null;
  end loop;

  select * into v_registration from public.complete_durable_registration_core(
    p_tournament_id, p_registration_type, p_anglers, p_options,
    p_payment_reference, p_rules_version, p_waiver_version, p_price_snapshot
  );
  if v_registration.participant_contact_snapshot is not null then return v_registration; end if;

  update public.tournament_registrations set
    participant_contact_snapshot = v_contact_snapshot, updated_at = now()
  where id = v_registration.id returning * into v_registration;

  for v_index in 0..(v_expected_count - 1) loop
    v_contact := v_contact_snapshot -> v_index;
    v_angler_id := case when v_index = 0 then v_registration.angler1_id else v_registration.angler2_id end;
    if v_existing_ids[v_index + 1] is null then
      update public.anglers set
        street_address = nullif(v_contact ->> 'streetAddress', ''),
        city = nullif(v_contact ->> 'city', ''),
        state = nullif(v_contact ->> 'state', ''),
        zip_code = nullif(v_contact ->> 'zipCode', ''),
        updated_at = now()
      where id = v_angler_id;
    else
      v_differences := public.registration_contact_differences(v_angler_id, v_contact);
      if coalesce(array_length(v_differences, 1), 0) > 0 then
        insert into public.registration_identity_reviews (
          registration_id, participant_position, original_first_name,
          original_last_name, original_display_name, original_email,
          original_phone, canonical_angler_id, review_status, review_reason,
          review_kind, submitted_membership, submitted_contact,
          existing_contact, differing_fields
        ) values (
          v_registration.id, (v_index + 1)::smallint,
          v_contact ->> 'firstName', v_contact ->> 'lastName',
          (v_contact ->> 'firstName') || ' ' || (v_contact ->> 'lastName'),
          v_contact ->> 'email', v_contact ->> 'phone', v_angler_id,
          'review_required',
          'Member contact information differs: ' || array_to_string(v_differences, ', '),
          'contact', v_contact ->> 'membership', v_contact,
          public.angler_contact_snapshot(v_angler_id), v_differences
        );
      end if;
    end if;
  end loop;
  return v_registration;
end;
$$;

revoke all on function public.complete_durable_registration_core(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  to service_role;

create or replace function public.admin_create_walkup_registration(
  p_tournament_id uuid,
  p_registration_type text,
  p_anglers jsonb,
  p_boat_number integer,
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
  v_anglers jsonb := p_anglers;
  v_angler jsonb;
  v_email text;
  v_angler_id uuid;
  v_email_match_ids uuid[];
  v_membership public.memberships;
  v_tournament public.tournaments;
  v_registration public.tournament_registrations;
  v_payment_reference text := 'walk-up:' || gen_random_uuid()::text;
  v_price_snapshot jsonb;
  v_index integer;
  v_expected_count integer;
begin
  if p_admin_user_id is null
    or p_registration_type not in ('solo', 'team')
    or p_boat_number is null or p_boat_number <= 0
    or p_payment_method not in ('cash', 'card', 'other')
    or p_total_paid_cents is null or p_total_paid_cents < 0 then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_INPUT_INVALID';
  end if;

  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  if jsonb_typeof(p_anglers) <> 'array'
    or jsonb_array_length(p_anglers) <> v_expected_count then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_ANGLERS_INVALID';
  end if;

  select * into v_tournament from public.tournaments
  where id = p_tournament_id and season_id is not null for share;
  if not found then
    raise exception using errcode = '23503', message = 'AITT_WALKUP_TOURNAMENT_INVALID';
  end if;

  -- A paid walk-up that selects Joining should reuse/reactivate an existing
  -- season membership instead of failing or creating a duplicate.
  for v_index in 0..(v_expected_count - 1) loop
    v_angler := v_anglers -> v_index;
    if v_angler ->> 'membership' = 'joining' then
      v_email := nullif(lower(btrim(v_angler ->> 'email')), '');
      if v_email is null then
        raise exception using errcode = '22023', message = 'AITT_WALKUP_EMAIL_REQUIRED';
      end if;
      perform pg_advisory_xact_lock(hashtextextended('member-email:' || v_email, 0));

      select array_agg(id order by id::text) into v_email_match_ids from public.anglers
      where lower(btrim(email)) = v_email
        and merged_into_angler_id is null;
      if coalesce(array_length(v_email_match_ids, 1), 0) > 1 then
        raise exception using errcode = '23514', message = 'AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED';
      end if;
      v_angler_id := v_email_match_ids[1];

      if v_angler_id is not null then
        select * into v_membership from public.memberships
        where angler_id = v_angler_id and season_id = v_tournament.season_id;

        if found then
          update public.memberships
          set status = 'active',
              first_eligible_tournament_id = coalesce(first_eligible_tournament_id, p_tournament_id),
              source = case when status = 'active' then source else 'walk_up' end,
              payment_reference = case when status = 'active' then payment_reference else v_payment_reference end,
              updated_at = now()
          where id = v_membership.id;
          v_anglers := jsonb_set(v_anglers, array[v_index::text, 'membership'], '"current"'::jsonb);
        end if;
      end if;
    end if;
    v_angler_id := null;
    v_email_match_ids := null;
    v_membership := null;
  end loop;

  v_price_snapshot := jsonb_build_object(
    'lineItems', jsonb_build_array(jsonb_build_object(
      'code', 'walk_up_total', 'name', 'Walk-Up Registration',
      'priceCents', p_total_paid_cents
    )),
    'cardProcessingFeeCents', 0,
    'totalCents', p_total_paid_cents,
    'recordedByAdminId', p_admin_user_id
  );

  select * into v_registration from public.complete_durable_registration(
    p_tournament_id, p_registration_type, v_anglers, p_options,
    v_payment_reference, 'admin-walk-up', 'admin-walk-up', v_price_snapshot
  );

  update public.memberships membership
  set source = 'walk_up', updated_at = now()
  where membership.payment_reference = v_payment_reference
    and membership.source = 'online_registration';

  update public.tournament_registrations
  set boat_number = p_boat_number,
      registration_source = 'walk_up',
      payment_method = p_payment_method,
      admin_notes = 'Walk-up recorded by Admin ' || p_admin_user_id::text,
      updated_at = now()
  where id = v_registration.id
  returning * into v_registration;

  return v_registration;
end;
$$;

create or replace function public.admin_update_registration_operations(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_boat_number integer,
  p_big_bass boolean,
  p_member_pot text,
  p_insurance boolean,
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
  if p_admin_user_id is null or p_boat_number is null or p_boat_number <= 0
    or (p_member_pot is not null and p_member_pot not in ('bronze', 'silver', 'gold')) then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_EDIT_INVALID';
  end if;

  update public.tournament_registrations
  set boat_number = p_boat_number,
      big_bass = case when registration_source = 'walk_up' then coalesce(p_big_bass, false) else big_bass end,
      member_pot = case when registration_source = 'walk_up' then p_member_pot else member_pot end,
      insurance = case when registration_source = 'walk_up' then coalesce(p_insurance, false) else insurance end,
      updated_at = now()
  where id = p_registration_id and tournament_id = p_tournament_id
    and registration_status = 'active' and checked_in_at is null
  returning * into v_registration;

  if not found then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_EDIT_LOCKED_OR_NOT_FOUND';
  end if;
  return v_registration;
end;
$$;

create or replace function public.admin_cancel_walkup_registration(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_admin_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
begin
  if p_admin_user_id is null then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_DELETE_INVALID';
  end if;

  update public.tournament_registrations
  set registration_status = 'cancelled',
      cancelled_at = now(),
      cancelled_by_admin_id = p_admin_user_id,
      admin_notes = concat_ws(E'\n', nullif(admin_notes, ''),
        'Walk-up cancelled by Admin ' || p_admin_user_id::text || ' at ' || now()::text),
      updated_at = now()
  where id = p_registration_id and tournament_id = p_tournament_id
    and registration_source = 'walk_up' and registration_status = 'active'
    and checked_in_at is null
  returning * into v_registration;

  if not found then
    raise exception using errcode = '23503', message = 'AITT_WALKUP_CANCEL_LOCKED_OR_NOT_FOUND';
  end if;
  return true;
end;
$$;

revoke all on function public.admin_create_walkup_registration(uuid,text,jsonb,integer,jsonb,text,integer,uuid)
  from public, anon, authenticated;
revoke all on function public.admin_update_registration_operations(uuid,uuid,integer,boolean,text,boolean,uuid)
  from public, anon, authenticated;
revoke all on function public.admin_cancel_walkup_registration(uuid,uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.admin_create_walkup_registration(uuid,text,jsonb,integer,jsonb,text,integer,uuid)
  to service_role;
grant execute on function public.admin_update_registration_operations(uuid,uuid,integer,boolean,text,boolean,uuid)
  to service_role;
grant execute on function public.admin_cancel_walkup_registration(uuid,uuid,uuid)
  to service_role;

-- Durable Registration is completed only after a trusted payment integration
-- has verified the payment reference and amount. This migration does not
-- implement or expose a payment endpoint.

alter table public.tournament_registrations
  add column if not exists angler1_id uuid,
  add column if not exists angler2_id uuid,
  add column if not exists membership_snapshot jsonb,
  add column if not exists price_snapshot jsonb,
  add column if not exists rules_version text,
  add column if not exists waiver_version text,
  add column if not exists rules_accepted_at timestamptz;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_angler1_id_fkey,
  add constraint tournament_registrations_angler1_id_fkey
    foreign key (angler1_id) references public.anglers(id) on delete restrict,
  drop constraint if exists tournament_registrations_angler2_id_fkey,
  add constraint tournament_registrations_angler2_id_fkey
    foreign key (angler2_id) references public.anglers(id) on delete restrict,
  drop constraint if exists tournament_registrations_membership_snapshot_check,
  add constraint tournament_registrations_membership_snapshot_check check (
    membership_snapshot is null
    or jsonb_typeof(membership_snapshot) = 'array'
  ),
  drop constraint if exists tournament_registrations_price_snapshot_check,
  add constraint tournament_registrations_price_snapshot_check check (
    price_snapshot is null
    or jsonb_typeof(price_snapshot) = 'object'
  );

create unique index if not exists tournament_registrations_payment_reference_uidx
  on public.tournament_registrations (payment_reference)
  where payment_reference is not null;

create unique index if not exists tournament_registrations_record_event_uidx
  on public.tournament_registrations (tournament_id, competitive_record_id)
  where competitive_record_id is not null;

create index if not exists tournament_registrations_angler1_id_idx
  on public.tournament_registrations (angler1_id);

create index if not exists tournament_registrations_angler2_id_idx
  on public.tournament_registrations (angler2_id);

create or replace function public.require_durable_registration_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.competitive_record_id is null
    or new.angler1_id is null
    or new.membership_snapshot is null
    or new.price_snapshot is null
    or nullif(btrim(new.payment_reference), '') is null
    or nullif(btrim(new.rules_version), '') is null
    or nullif(btrim(new.waiver_version), '') is null
    or new.rules_accepted_at is null then
    raise exception using
      errcode = '23502',
      message = 'AITT_DURABLE_REGISTRATION_FIELDS_REQUIRED';
  end if;

  if (new.registration_type = 'solo' and new.angler2_id is not null)
    or (new.registration_type = 'team'
      and (new.angler2_id is null or new.angler1_id = new.angler2_id)) then
    raise exception using
      errcode = '23514',
      message = 'AITT_DURABLE_REGISTRATION_ANGLERS_INVALID';
  end if;

  return new;
end;
$$;

drop trigger if exists tournament_registrations_require_durable_fields
  on public.tournament_registrations;
create trigger tournament_registrations_require_durable_fields
before insert on public.tournament_registrations
for each row execute function public.require_durable_registration_fields();

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
  v_tournament public.tournaments;
  v_registration public.tournament_registrations;
  v_existing public.tournament_registrations;
  v_record public.teams;
  v_angler jsonb;
  v_angler_id uuid;
  v_email_match_ids uuid[];
  v_email text;
  v_phone text;
  v_claim text;
  v_expected_count integer;
  v_index integer;
  v_angler_ids uuid[] := array[]::uuid[];
  v_membership public.memberships;
  v_first_eligible public.tournaments;
  v_is_eligible boolean;
  v_membership_snapshot jsonb := '[]'::jsonb;
  v_canonical_names text[] := array[]::text[];
  v_member_pot text;
  v_insurance boolean;
  v_registration_key text;
begin
  if p_registration_type not in ('team', 'solo') then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_TYPE_INVALID';
  end if;

  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;

  if p_anglers is null
    or jsonb_typeof(p_anglers) <> 'array'
    or jsonb_array_length(p_anglers) <> v_expected_count then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_ANGLER_COUNT_INVALID';
  end if;

  if p_options is null
    or p_price_snapshot is null
    or jsonb_typeof(p_options) <> 'object'
    or jsonb_typeof(p_price_snapshot) <> 'object'
    or nullif(btrim(p_payment_reference), '') is null
    or nullif(btrim(p_rules_version), '') is null
    or nullif(btrim(p_waiver_version), '') is null then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_INPUT_INVALID';
  end if;

  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for share;

  if not found or v_tournament.season_id is null then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_TOURNAMENT_INVALID';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('registration-payment:' || lower(btrim(p_payment_reference)), 0)
  );

  select * into v_existing
  from public.tournament_registrations
  where payment_reference = btrim(p_payment_reference);

  if found then
    return v_existing;
  end if;

  v_member_pot := nullif(btrim(p_options ->> 'memberPot'), '');
  v_insurance := coalesce((p_options ->> 'insurance')::boolean, false);

  if v_member_pot is not null
    and v_member_pot not in ('bronze', 'silver', 'gold') then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_MEMBER_POT_INVALID';
  end if;

  for v_index in 0..(v_expected_count - 1) loop
    v_angler := p_anglers -> v_index;
    v_email := nullif(lower(btrim(v_angler ->> 'email')), '');
    v_phone := nullif(btrim(v_angler ->> 'mobilePhone'), '');
    v_claim := v_angler ->> 'membership';

    if nullif(btrim(v_angler ->> 'firstName'), '') is null
      or nullif(btrim(v_angler ->> 'lastName'), '') is null
      or v_email is null
      or v_claim not in ('current', 'joining', 'non-member') then
      raise exception using errcode = '22023', message = 'AITT_REGISTRATION_ANGLER_INVALID';
    end if;

    -- Use the same lock namespace as Admin member creation so two workflows
    -- cannot concurrently create the same exact email identity.
    perform pg_advisory_xact_lock(hashtextextended('member-email:' || v_email, 0));

    select array_agg(id order by id::text) into v_email_match_ids
    from public.anglers
    where lower(btrim(email)) = v_email
      and merged_into_angler_id is null;

    if coalesce(array_length(v_email_match_ids, 1), 0) > 1 then
      raise exception using
        errcode = '23514',
        message = 'AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED';
    end if;

    v_angler_id := v_email_match_ids[1];

    if v_angler_id is null then
      insert into public.anglers (
        first_name, last_name, display_name, normalized_name, email, phone
      )
      values (
        btrim(v_angler ->> 'firstName'),
        btrim(v_angler ->> 'lastName'),
        btrim(v_angler ->> 'firstName') || ' ' || btrim(v_angler ->> 'lastName'),
        lower(regexp_replace(
          btrim(v_angler ->> 'firstName') || ' ' || btrim(v_angler ->> 'lastName'),
          '\s+', ' ', 'g'
        )),
        v_email,
        v_phone
      )
      returning id into v_angler_id;
    end if;

    if v_angler_id = any(v_angler_ids) then
      raise exception using errcode = '22023', message = 'AITT_REGISTRATION_DUPLICATE_ANGLER';
    end if;

    select * into v_membership
    from public.memberships
    where angler_id = v_angler_id
      and season_id = v_tournament.season_id;

    if v_claim = 'joining' and not found then
      insert into public.memberships (
        angler_id,
        season_id,
        status,
        effective_date,
        first_eligible_tournament_id,
        source,
        payment_reference
      )
      values (
        v_angler_id,
        v_tournament.season_id,
        'active',
        current_date,
        v_tournament.id,
        'online_registration',
        btrim(p_payment_reference)
      )
      returning * into v_membership;
    elsif v_claim = 'joining' then
      raise exception using errcode = '23514', message = case
        when v_membership.status = 'active'
          then 'AITT_REGISTRATION_MEMBERSHIP_ALREADY_EXISTS'
        else 'AITT_REGISTRATION_MEMBERSHIP_INACTIVE'
      end;
    elsif v_claim = 'current' and (not found or v_membership.status <> 'active') then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_CURRENT_MEMBERSHIP_NOT_FOUND';
    end if;

    v_is_eligible := false;
    if v_membership.id is not null and v_membership.status = 'active'
      and v_membership.first_eligible_tournament_id is not null then
      select * into v_first_eligible
      from public.tournaments
      where id = v_membership.first_eligible_tournament_id
        and season_id = v_tournament.season_id;

      v_is_eligible := found
        and v_first_eligible.event_type = 'regular_season'
        and v_first_eligible.regular_season_number between 1 and 8
        and (
          v_tournament.event_type = 'championship'
          or (
            v_tournament.event_type = 'regular_season'
            and v_tournament.regular_season_number between 1 and 8
            and v_first_eligible.regular_season_number
              <= v_tournament.regular_season_number
          )
        );
    end if;

    if v_claim = 'current' and not v_is_eligible then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_NOT_YET_ELIGIBLE';
    end if;

    v_angler_ids := array_append(v_angler_ids, v_angler_id);
    v_canonical_names := array_append(
      v_canonical_names,
      btrim(v_angler ->> 'firstName') || ' ' || btrim(v_angler ->> 'lastName')
    );
    v_membership_snapshot := v_membership_snapshot || jsonb_build_array(
      jsonb_build_object(
        'anglerId', v_angler_id,
        'membershipId', v_membership.id,
        'submittedClassification', v_claim,
        'resolvedClassification', case when v_is_eligible then 'current' else 'non-member' end,
        'status', v_membership.status,
        'seasonId', v_tournament.season_id,
        'firstEligibleTournamentId', v_membership.first_eligible_tournament_id,
        'eligibleForTournament', v_is_eligible
      )
    );

    v_membership := null;
    v_first_eligible := null;
    v_email_match_ids := null;
  end loop;

  if (v_member_pot is not null or v_insurance)
    and exists (
      select 1
      from jsonb_array_elements(v_membership_snapshot) snapshot
      where coalesce((snapshot ->> 'eligibleForTournament')::boolean, false) = false
    ) then
    raise exception using errcode = '23514', message = 'AITT_REGISTRATION_MEMBER_OPTION_INELIGIBLE';
  end if;

  select * into v_record
  from public.create_competitive_record(
    v_tournament.season_id,
    p_registration_type,
    v_angler_ids,
    array_to_string(v_canonical_names, ' / ')
  );

  perform pg_advisory_xact_lock(
    hashtextextended(
      'registration-record:' || p_tournament_id::text || ':' || v_record.id::text,
      0
    )
  );

  select * into v_existing
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and competitive_record_id = v_record.id;

  if found then
    raise exception using errcode = '23505', message = 'AITT_REGISTRATION_ALREADY_EXISTS';
  end if;

  v_registration_key :=
    'AITT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  insert into public.tournament_registrations (
    registration_key,
    tournament_id,
    competitive_record_id,
    registered_at,
    registration_type,
    angler1_id,
    angler2_id,
    angler1_name,
    angler2_name,
    big_bass,
    member_pot,
    insurance,
    payment_reference,
    membership_snapshot,
    price_snapshot,
    rules_version,
    waiver_version,
    rules_accepted_at
  )
  values (
    v_registration_key,
    p_tournament_id,
    v_record.id,
    now(),
    p_registration_type,
    v_angler_ids[1],
    case when p_registration_type = 'team' then v_angler_ids[2] else null end,
    v_canonical_names[1],
    case when p_registration_type = 'team' then v_canonical_names[2] else null end,
    coalesce((p_options ->> 'bigBass')::boolean, false),
    v_member_pot,
    v_insurance,
    btrim(p_payment_reference),
    v_membership_snapshot,
    p_price_snapshot,
    btrim(p_rules_version),
    btrim(p_waiver_version),
    now()
  )
  returning * into v_registration;

  return v_registration;
end;
$$;

revoke all on function public.complete_durable_registration(
  uuid, text, jsonb, jsonb, text, text, text, jsonb
) from public, anon, authenticated;

grant execute on function public.complete_durable_registration(
  uuid, text, jsonb, jsonb, text, text, text, jsonb
) to service_role;

-- All durable writes must pass through the transactional service-role RPC.
revoke insert, update, delete on table public.tournament_registrations from anon;

drop policy if exists "Temporary anonymous tournament registrations creates"
  on public.tournament_registrations;
drop policy if exists "Temporary anonymous tournament registrations updates"
  on public.tournament_registrations;
drop policy if exists "Temporary anonymous tournament registrations deletes"
  on public.tournament_registrations;

comment on function public.complete_durable_registration(
  uuid, text, jsonb, jsonb, text, text, text, jsonb
) is
  'Service-role-only atomic durable registration after external payment verification.';

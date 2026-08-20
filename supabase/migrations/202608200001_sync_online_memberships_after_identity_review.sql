-- Registration snapshots remain immutable tournament history. Canonical
-- contact changes require an explicit Admin review decision.

alter table public.anglers
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text;

alter table public.tournament_registrations
  add column if not exists participant_contact_snapshot jsonb;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_participant_contact_snapshot_check,
  add constraint tournament_registrations_participant_contact_snapshot_check check (
    participant_contact_snapshot is null
    or jsonb_typeof(participant_contact_snapshot) = 'array'
  );

alter table public.registration_identity_reviews
  add column if not exists submitted_membership text,
  add column if not exists review_kind text not null default 'identity',
  add column if not exists submitted_contact jsonb,
  add column if not exists existing_contact jsonb,
  add column if not exists differing_fields text[];

alter table public.registration_identity_reviews
  drop constraint if exists registration_identity_reviews_submitted_membership_check,
  add constraint registration_identity_reviews_submitted_membership_check check (
    submitted_membership is null
    or submitted_membership in ('current', 'joining', 'non-member')
  ),
  drop constraint if exists registration_identity_reviews_kind_check,
  add constraint registration_identity_reviews_kind_check check (
    review_kind in ('identity', 'contact', 'membership')
  ),
  drop constraint if exists registration_identity_reviews_submitted_contact_check,
  add constraint registration_identity_reviews_submitted_contact_check check (
    submitted_contact is null or jsonb_typeof(submitted_contact) = 'object'
  ),
  drop constraint if exists registration_identity_reviews_existing_contact_check,
  add constraint registration_identity_reviews_existing_contact_check check (
    existing_contact is null or jsonb_typeof(existing_contact) = 'object'
  );

create or replace function public.registration_participant_contact(p_angler jsonb)
returns jsonb
language sql
immutable
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'firstName', btrim(p_angler ->> 'firstName'),
    'lastName', btrim(p_angler ->> 'lastName'),
    'streetAddress', btrim(p_angler ->> 'streetAddress'),
    'city', btrim(p_angler ->> 'city'),
    'state', upper(btrim(p_angler ->> 'state')),
    'zipCode', btrim(p_angler ->> 'zipCode'),
    'email', lower(btrim(p_angler ->> 'email')),
    'phone', btrim(p_angler ->> 'mobilePhone'),
    'membership', p_angler ->> 'membership'
  );
$$;

create or replace function public.angler_contact_snapshot(p_angler_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'firstName', first_name,
    'lastName', last_name,
    'streetAddress', street_address,
    'city', city,
    'state', state,
    'zipCode', zip_code,
    'email', email,
    'phone', phone
  )
  from public.anglers where id = p_angler_id;
$$;

create or replace function public.registration_contact_differences(
  p_angler_id uuid,
  p_submitted jsonb
)
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select array_remove(array[
    case when lower(btrim(coalesce(first_name, ''))) is distinct from lower(btrim(coalesce(p_submitted ->> 'firstName', ''))) then 'firstName' end,
    case when lower(btrim(coalesce(last_name, ''))) is distinct from lower(btrim(coalesce(p_submitted ->> 'lastName', ''))) then 'lastName' end,
    case when lower(btrim(coalesce(street_address, ''))) is distinct from lower(btrim(coalesce(p_submitted ->> 'streetAddress', ''))) then 'streetAddress' end,
    case when lower(btrim(coalesce(city, ''))) is distinct from lower(btrim(coalesce(p_submitted ->> 'city', ''))) then 'city' end,
    case when upper(btrim(coalesce(state, ''))) is distinct from upper(btrim(coalesce(p_submitted ->> 'state', ''))) then 'state' end,
    case when btrim(coalesce(zip_code, '')) is distinct from btrim(coalesce(p_submitted ->> 'zipCode', '')) then 'zipCode' end,
    case when lower(btrim(coalesce(email, ''))) is distinct from lower(btrim(coalesce(p_submitted ->> 'email', ''))) then 'email' end,
    case when regexp_replace(coalesce(phone, ''), '\D', '', 'g') is distinct from regexp_replace(coalesce(p_submitted ->> 'phone', ''), '\D', '', 'g') then 'phone' end
  ], null)
  from public.anglers where id = p_angler_id;
$$;

-- Rename the original implementation only once. Reruns replace the wrapper
-- while leaving the core function in place.
do $$
begin
  if to_regprocedure('public.complete_registration_for_identity_review_core(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)') is null then
    alter function public.complete_registration_for_identity_review(
      uuid, text, jsonb, jsonb, text, text, text, jsonb, jsonb
    ) rename to complete_registration_for_identity_review_core;
  end if;
end;
$$;

create or replace function public.complete_registration_for_identity_review(
  p_tournament_id uuid,
  p_registration_type text,
  p_anglers jsonb,
  p_options jsonb,
  p_payment_reference text,
  p_rules_version text,
  p_waiver_version text,
  p_price_snapshot jsonb,
  p_classification jsonb
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
  v_membership_snapshot jsonb := '[]'::jsonb;
  v_contact_snapshot jsonb := '[]'::jsonb;
  v_contact jsonb;
  v_claim text;
begin
  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  for v_index in 0..(v_expected_count - 1) loop
    v_claim := p_anglers -> v_index ->> 'membership';
    if v_claim not in ('current', 'joining', 'non-member') then
      raise exception using errcode = '22023', message = 'AITT_REGISTRATION_MEMBERSHIP_INVALID';
    end if;
    v_membership_snapshot := v_membership_snapshot || jsonb_build_array(jsonb_build_object(
      'submittedClassification', v_claim,
      'resolvedClassification', null,
      'eligibleForTournament', false
    ));
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
  end loop;

  select * into v_registration
  from public.complete_registration_for_identity_review_core(
    p_tournament_id, p_registration_type, p_anglers, p_options,
    p_payment_reference, p_rules_version, p_waiver_version,
    p_price_snapshot, p_classification
  );
  if v_registration.identity_review_status <> 'review_required' then return v_registration; end if;

  update public.registration_identity_reviews review
  set submitted_membership = p_anglers -> (review.participant_position - 1) ->> 'membership',
      submitted_contact = public.registration_participant_contact(p_anglers -> (review.participant_position - 1)),
      updated_at = now()
  where review.registration_id = v_registration.id;

  update public.tournament_registrations
  set membership_snapshot = v_membership_snapshot,
      participant_contact_snapshot = v_contact_snapshot,
      updated_at = now()
  where id = v_registration.id returning * into v_registration;
  return v_registration;
end;
$$;

revoke all on function public.complete_registration_for_identity_review_core(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.complete_registration_for_identity_review(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_registration_for_identity_review(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)
  to service_role;

create or replace function public.sync_resolved_registration_membership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_tournament public.tournaments;
begin
  if new.canonical_angler_id is null or new.review_status not in ('resolved_existing', 'approved_new') then return new; end if;
  select * into v_registration from public.tournament_registrations where id = new.registration_id for update;
  select * into v_tournament from public.tournaments where id = v_registration.tournament_id;

  -- Unknown historical membership selections remain unknown and never create,
  -- remove, or reclassify a membership automatically.
  if new.submitted_membership = 'joining' then
    insert into public.memberships (
      angler_id, season_id, status, effective_date,
      first_eligible_tournament_id, source, payment_reference
    ) values (
      new.canonical_angler_id, v_tournament.season_id, 'active', current_date,
      v_tournament.id, 'online_registration', v_registration.payment_reference
    )
    on conflict (angler_id, season_id) do update
    set status = 'active',
        effective_date = least(public.memberships.effective_date, excluded.effective_date),
        first_eligible_tournament_id = coalesce(public.memberships.first_eligible_tournament_id, excluded.first_eligible_tournament_id),
        updated_at = now();
  end if;

  update public.tournament_registrations registration
  set membership_snapshot = (
    select jsonb_agg(jsonb_build_object(
      'anglerId', review.canonical_angler_id,
      'membershipId', membership.id,
      'submittedClassification', review.submitted_membership,
      'resolvedClassification', case
        when review.submitted_membership is null then null
        when membership.status = 'active' then 'current'
        else 'non-member' end,
      'status', membership.status,
      'seasonId', v_tournament.season_id,
      'firstEligibleTournamentId', membership.first_eligible_tournament_id,
      'eligibleForTournament', case
        when review.submitted_membership is null then false
        else coalesce(membership.status = 'active'
          and first_tournament.event_type = 'regular_season'
          and first_tournament.regular_season_number between 1 and 8
          and (v_tournament.event_type = 'championship' or (
            v_tournament.event_type = 'regular_season'
            and v_tournament.regular_season_number between 1 and 8
            and first_tournament.regular_season_number <= v_tournament.regular_season_number
          )), false) end
    ) order by review.participant_position)
    from public.registration_identity_reviews review
    left join public.memberships membership on membership.angler_id = review.canonical_angler_id and membership.season_id = v_tournament.season_id
    left join public.tournaments first_tournament on first_tournament.id = membership.first_eligible_tournament_id
    where review.registration_id = new.registration_id
  ), updated_at = now()
  where registration.id = new.registration_id;
  return new;
end;
$$;

drop trigger if exists registration_identity_reviews_sync_membership on public.registration_identity_reviews;
create trigger registration_identity_reviews_sync_membership
after update of canonical_angler_id, review_status on public.registration_identity_reviews
for each row execute function public.sync_resolved_registration_membership();

create or replace function public.queue_resolved_registration_attention()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.registration_identity_reviews;
  v_differences text[];
begin
  if old.identity_review_status <> 'review_required'
    or new.identity_review_status not in ('approved_new', 'resolved_existing') then return new; end if;

  for v_review in select * from public.registration_identity_reviews where registration_id = new.id loop
    if v_review.submitted_membership is null then
      update public.registration_identity_reviews set
        review_kind = 'membership', review_status = 'review_required',
        review_reason = 'Historical membership selection is unknown and requires Admin verification.',
        updated_at = now()
      where id = v_review.id;
    elsif v_review.submitted_contact is not null and v_review.canonical_angler_id is not null then
      if v_review.resolution_method = 'admin_approved_new' then
        update public.anglers set
          street_address = nullif(btrim(v_review.submitted_contact ->> 'streetAddress'), ''),
          city = nullif(btrim(v_review.submitted_contact ->> 'city'), ''),
          state = nullif(upper(btrim(v_review.submitted_contact ->> 'state')), ''),
          zip_code = nullif(btrim(v_review.submitted_contact ->> 'zipCode'), ''),
          email = nullif(lower(btrim(v_review.submitted_contact ->> 'email')), ''),
          phone = nullif(btrim(v_review.submitted_contact ->> 'phone'), ''),
          updated_at = now()
        where id = v_review.canonical_angler_id;
      else
        v_differences := public.registration_contact_differences(v_review.canonical_angler_id, v_review.submitted_contact);
        if coalesce(array_length(v_differences, 1), 0) > 0 then
          update public.registration_identity_reviews set
            review_kind = 'contact', review_status = 'review_required',
            review_reason = 'Member contact information differs: ' || array_to_string(v_differences, ', '),
            existing_contact = public.angler_contact_snapshot(v_review.canonical_angler_id),
            differing_fields = v_differences, resolved_at = null,
            resolved_by_admin_id = null, updated_at = now()
          where id = v_review.id;
        end if;
      end if;
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists tournament_registrations_queue_resolved_attention on public.tournament_registrations;
create trigger tournament_registrations_queue_resolved_attention
after update of identity_review_status on public.tournament_registrations
for each row execute function public.queue_resolved_registration_attention();

create or replace function public.admin_resolve_registration_contact_review(
  p_review_id uuid,
  p_approve_update boolean,
  p_admin_user_id uuid,
  p_review_note text default null
)
returns public.registration_identity_reviews
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.registration_identity_reviews;
begin
  select * into v_review from public.registration_identity_reviews where id = p_review_id for update;
  if not found or v_review.review_kind <> 'contact' or v_review.review_status <> 'review_required'
    or v_review.canonical_angler_id is null or p_admin_user_id is null then
    raise exception using errcode = '23503', message = 'AITT_CONTACT_REVIEW_NOT_FOUND';
  end if;

  if p_approve_update then
    update public.anglers set
      first_name = btrim(v_review.submitted_contact ->> 'firstName'),
      last_name = btrim(v_review.submitted_contact ->> 'lastName'),
      display_name = btrim(v_review.submitted_contact ->> 'firstName') || ' ' || btrim(v_review.submitted_contact ->> 'lastName'),
      normalized_name = lower(regexp_replace(btrim(v_review.submitted_contact ->> 'firstName') || ' ' || btrim(v_review.submitted_contact ->> 'lastName'), '\s+', ' ', 'g')),
      street_address = nullif(btrim(v_review.submitted_contact ->> 'streetAddress'), ''),
      city = nullif(btrim(v_review.submitted_contact ->> 'city'), ''),
      state = nullif(upper(btrim(v_review.submitted_contact ->> 'state')), ''),
      zip_code = nullif(btrim(v_review.submitted_contact ->> 'zipCode'), ''),
      email = nullif(lower(btrim(v_review.submitted_contact ->> 'email')), ''),
      phone = nullif(btrim(v_review.submitted_contact ->> 'phone'), ''),
      updated_at = now()
    where id = v_review.canonical_angler_id;
  end if;

  insert into public.registration_identity_review_history (
    review_id, registration_id, previous_status, new_status,
    previous_angler_id, canonical_angler_id, resolution_method,
    resolved_by_admin_id, review_note
  ) values (
    v_review.id, v_review.registration_id, v_review.review_status, 'resolved_existing',
    v_review.canonical_angler_id, v_review.canonical_angler_id,
    case when p_approve_update then 'contact_update_approved' else 'contact_existing_kept' end,
    p_admin_user_id, nullif(btrim(p_review_note), '')
  );

  update public.registration_identity_reviews set
    review_status = 'resolved_existing',
    resolution_method = case when p_approve_update then 'contact_update_approved' else 'contact_existing_kept' end,
    review_note = nullif(btrim(p_review_note), ''), resolved_at = now(),
    resolved_by_admin_id = p_admin_user_id, updated_at = now()
  where id = v_review.id returning * into v_review;
  return v_review;
end;
$$;

create or replace function public.admin_resolve_historical_membership_review(
  p_review_id uuid,
  p_submitted_membership text,
  p_admin_user_id uuid,
  p_review_note text default null
)
returns public.registration_identity_reviews
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.registration_identity_reviews;
begin
  select * into v_review from public.registration_identity_reviews where id = p_review_id for update;
  if not found or v_review.review_kind <> 'membership' or v_review.review_status <> 'review_required'
    or v_review.canonical_angler_id is null or p_submitted_membership not in ('current', 'joining', 'non-member')
    or p_admin_user_id is null or nullif(btrim(p_review_note), '') is null then
    raise exception using errcode = '23503', message = 'AITT_MEMBERSHIP_REVIEW_NOT_FOUND';
  end if;
  insert into public.registration_identity_review_history (
    review_id, registration_id, previous_status, new_status,
    previous_angler_id, canonical_angler_id, resolution_method,
    resolved_by_admin_id, review_note
  ) values (
    v_review.id, v_review.registration_id, v_review.review_status, 'resolved_existing',
    v_review.canonical_angler_id, v_review.canonical_angler_id,
    'historical_membership_confirmed_' || replace(p_submitted_membership, '-', '_'),
    p_admin_user_id, nullif(btrim(p_review_note), '')
  );
  update public.registration_identity_reviews set
    submitted_membership = p_submitted_membership, review_status = 'resolved_existing',
    resolution_method = 'historical_membership_confirmed_' || replace(p_submitted_membership, '-', '_'),
    review_note = nullif(btrim(p_review_note), ''), resolved_at = now(),
    resolved_by_admin_id = p_admin_user_id, updated_at = now()
  where id = v_review.id returning * into v_review;
  return v_review;
end;
$$;

revoke all on function public.registration_participant_contact(jsonb) from public, anon, authenticated;
revoke all on function public.angler_contact_snapshot(uuid) from public, anon, authenticated;
revoke all on function public.registration_contact_differences(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.sync_resolved_registration_membership() from public, anon, authenticated;
revoke all on function public.queue_resolved_registration_attention() from public, anon, authenticated;
revoke all on function public.admin_resolve_registration_contact_review(uuid,boolean,uuid,text) from public, anon, authenticated;
revoke all on function public.admin_resolve_historical_membership_review(uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.admin_resolve_registration_contact_review(uuid,boolean,uuid,text) to service_role;
grant execute on function public.admin_resolve_historical_membership_review(uuid,text,uuid,text) to service_role;

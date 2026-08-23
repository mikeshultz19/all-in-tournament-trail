-- Registration is permissive; identity and membership uncertainty is resolved
-- administratively after a verified payment has created the durable snapshot.

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
  if new.canonical_angler_id is null
    or new.review_status not in ('resolved_existing', 'approved_new') then
    return new;
  end if;

  -- Identity resolution must not silently settle a disputed membership. The
  -- existing membership review action triggers this function again after an
  -- Admin explicitly chooses the submitted membership classification.
  if new.review_kind <> 'membership' and (
    new.review_reason ilike '%Membership Needs Review:%'
    or new.review_reason ilike '%Possible Duplicate Membership Purchase:%'
    or new.review_reason ilike '%Member-only selection requires eligibility review.%'
  ) then
    return new;
  end if;

  select * into v_registration
  from public.tournament_registrations
  where id = new.registration_id for update;
  select * into v_tournament
  from public.tournaments where id = v_registration.tournament_id;

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
        first_eligible_tournament_id = coalesce(
          public.memberships.first_eligible_tournament_id,
          excluded.first_eligible_tournament_id
        ),
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
            and first_tournament.regular_season_number
              <= v_tournament.regular_season_number
          )), false) end
    ) order by review.participant_position)
    from public.registration_identity_reviews review
    left join public.memberships membership
      on membership.angler_id = review.canonical_angler_id
      and membership.season_id = v_tournament.season_id
    left join public.tournaments first_tournament
      on first_tournament.id = membership.first_eligible_tournament_id
    where review.registration_id = new.registration_id
  ), updated_at = now()
  where registration.id = new.registration_id;
  return new;
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
  v_final_registration_status text;
begin
  select * into v_review from public.registration_identity_reviews
  where id = p_review_id for update;
  if not found or v_review.review_kind <> 'membership'
    or v_review.review_status <> 'review_required'
    or v_review.canonical_angler_id is null
    or p_submitted_membership not in ('current', 'joining', 'non-member')
    or p_admin_user_id is null or nullif(btrim(p_review_note), '') is null then
    raise exception using errcode = '23503',
      message = 'AITT_MEMBERSHIP_REVIEW_NOT_FOUND';
  end if;

  insert into public.registration_identity_review_history (
    review_id, registration_id, previous_status, new_status,
    previous_angler_id, canonical_angler_id, resolution_method,
    resolved_by_admin_id, review_note
  ) values (
    v_review.id, v_review.registration_id, v_review.review_status,
    'resolved_existing', v_review.canonical_angler_id,
    v_review.canonical_angler_id,
    'membership_review_confirmed_' || replace(p_submitted_membership, '-', '_'),
    p_admin_user_id, nullif(btrim(p_review_note), '')
  );

  update public.registration_identity_reviews
  set submitted_membership = p_submitted_membership,
      review_status = 'resolved_existing',
      resolution_method = 'membership_review_confirmed_' ||
        replace(p_submitted_membership, '-', '_'),
      review_note = nullif(btrim(p_review_note), ''),
      resolved_at = now(), resolved_by_admin_id = p_admin_user_id,
      updated_at = now()
  where id = v_review.id returning * into v_review;

  if not exists (
    select 1 from public.registration_identity_reviews
    where registration_id = v_review.registration_id
      and review_status = 'review_required'
  ) then
    select case when exists (
      select 1 from public.registration_identity_reviews
      where registration_id = v_review.registration_id
        and review_status = 'approved_new'
    ) then 'approved_new' else 'resolved_existing' end
    into v_final_registration_status;

    update public.tournament_registrations
    set identity_review_status = v_final_registration_status,
        updated_at = now()
    where id = v_review.registration_id;
  end if;
  return v_review;
end;
$$;

create or replace function public.admin_resolve_registration_identity(
  p_review_id uuid,
  p_resolution text,
  p_existing_angler_id uuid,
  p_admin_user_id uuid,
  p_review_note text default null
)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.registration_identity_reviews;
  v_registration public.tournament_registrations;
  v_angler public.anglers;
  v_record public.teams;
  v_previous_record_id uuid;
  v_angler_ids uuid[];
  v_any_new boolean;
  v_final_status text;
  v_membership_review_pending boolean;
begin
  if p_resolution not in ('existing', 'new') or p_admin_user_id is null then
    raise exception using errcode = '22023',
      message = 'AITT_REGISTRATION_REVIEW_INPUT_INVALID';
  end if;

  select * into v_review from public.registration_identity_reviews
  where id = p_review_id and review_status = 'review_required' for update;
  if not found then
    raise exception using errcode = '23503',
      message = 'AITT_REGISTRATION_REVIEW_NOT_FOUND';
  end if;
  select * into v_registration from public.tournament_registrations
  where id = v_review.registration_id for update;
  v_previous_record_id := v_registration.competitive_record_id;

  if p_resolution = 'existing' then
    select * into v_angler from public.anglers
    where id = p_existing_angler_id
      and is_active = true and merged_into_angler_id is null;
    if not found then
      raise exception using errcode = '23503',
        message = 'AITT_IDENTITY_ANGLER_NOT_FOUND';
    end if;
    v_final_status := 'resolved_existing';
  else
    -- A shared contact value is evidence for review, not proof that two people
    -- are the same. This explicit Admin decision is the authority to create a
    -- separate canonical person while retaining the submitted snapshot.
    perform pg_advisory_xact_lock(hashtextextended(
      'registration-review-new-person:' || v_review.id::text, 0
    ));
    insert into public.anglers (
      first_name, last_name, display_name, normalized_name, email, phone,
      street_address, city, state, zip_code
    ) values (
      btrim(v_review.original_first_name),
      btrim(v_review.original_last_name),
      btrim(v_review.original_display_name),
      lower(regexp_replace(btrim(v_review.original_display_name), '\s+', ' ', 'g')),
      nullif(lower(btrim(v_review.original_email)), ''),
      nullif(btrim(v_review.original_phone), ''),
      nullif(btrim(v_review.submitted_contact ->> 'streetAddress'), ''),
      nullif(btrim(v_review.submitted_contact ->> 'city'), ''),
      nullif(upper(btrim(v_review.submitted_contact ->> 'state')), ''),
      nullif(btrim(v_review.submitted_contact ->> 'zipCode'), '')
    ) returning * into v_angler;
    v_final_status := 'approved_new';
  end if;

  insert into public.registration_identity_review_history (
    review_id, registration_id, previous_status, new_status,
    previous_angler_id, canonical_angler_id,
    previous_competitive_record_id, resolution_method,
    resolved_by_admin_id, review_note
  ) values (
    v_review.id, v_registration.id, v_review.review_status, v_final_status,
    v_review.canonical_angler_id, v_angler.id, v_previous_record_id,
    case when p_resolution = 'new' then 'admin_approved_new'
      else 'admin_confirmed_existing' end,
    p_admin_user_id, nullif(btrim(p_review_note), '')
  );

  update public.registration_identity_reviews
  set canonical_angler_id = v_angler.id,
      review_status = v_final_status,
      resolution_method = case when p_resolution = 'new'
        then 'admin_approved_new' else 'admin_confirmed_existing' end,
      review_note = nullif(btrim(p_review_note), ''),
      resolved_at = now(), resolved_by_admin_id = p_admin_user_id,
      updated_at = now()
  where id = v_review.id;

  -- Canonical identity, rather than membership disposition, controls when a
  -- Solo/Team Competitive Record can be established.
  if not exists (
    select 1 from public.registration_identity_reviews
    where registration_id = v_registration.id
      and canonical_angler_id is null
  ) then
    select array_agg(canonical_angler_id order by participant_position)
    into v_angler_ids
    from public.registration_identity_reviews
    where registration_id = v_registration.id;

    select * into v_record from public.create_competitive_record(
      (select season_id from public.tournaments
        where id = v_registration.tournament_id),
      v_registration.registration_type,
      v_angler_ids,
      concat_ws(' / ', v_registration.angler1_name, v_registration.angler2_name)
    );

    select exists (
      select 1 from public.registration_identity_reviews
      where registration_id = v_registration.id
        and review_status = 'approved_new'
    ) into v_any_new;

    update public.registration_identity_reviews
    set review_kind = 'membership', review_status = 'review_required',
        resolved_at = null, resolved_by_admin_id = null, updated_at = now()
    where registration_id = v_registration.id and (
      review_reason ilike '%Membership Needs Review:%'
      or review_reason ilike '%Possible Duplicate Membership Purchase:%'
      or review_reason ilike '%Member-only selection requires eligibility review.%'
    );

    select exists (
      select 1 from public.registration_identity_reviews
      where registration_id = v_registration.id
        and review_status = 'review_required'
    ) into v_membership_review_pending;

    update public.tournament_registrations
    set competitive_record_id = v_record.id,
        angler1_id = v_angler_ids[1],
        angler2_id = case when registration_type = 'team'
          then v_angler_ids[2] else null end,
        identity_review_status = case
          when v_membership_review_pending then 'review_required'
          when v_any_new then 'approved_new'
          else 'resolved_existing' end,
        updated_at = now()
    where id = v_registration.id returning * into v_registration;

    update public.registration_identity_review_history
    set competitive_record_id = v_record.id
    where registration_id = v_registration.id
      and competitive_record_id is null;
  end if;

  select * into v_registration from public.tournament_registrations
  where id = v_registration.id;
  return v_registration;
end;
$$;

revoke all on function public.sync_resolved_registration_membership()
  from public, anon, authenticated;
revoke all on function public.admin_resolve_registration_identity(uuid,text,uuid,uuid,text)
  from public, anon, authenticated;
grant execute on function public.admin_resolve_registration_identity(uuid,text,uuid,uuid,text)
  to service_role;
revoke all on function public.admin_resolve_historical_membership_review(uuid,text,uuid,text)
  from public, anon, authenticated;
grant execute on function public.admin_resolve_historical_membership_review(uuid,text,uuid,text)
  to service_role;

comment on function public.admin_resolve_registration_identity(uuid,text,uuid,uuid,text) is
  'Explicitly resolves a paid registration snapshot to an existing or separate canonical angler; shared contact values never force an automatic merge.';

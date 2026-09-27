-- Contact differences are informational only.  A verified existing member keeps
-- the canonical All Members record; minor phone/address changes do not create a
-- second review or block check-in.

create or replace function public.queue_resolved_registration_attention()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.registration_identity_reviews;
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
    elsif v_review.submitted_contact is not null and v_review.canonical_angler_id is not null
      and v_review.resolution_method = 'admin_approved_new' then
      update public.anglers set
        street_address = nullif(btrim(v_review.submitted_contact ->> 'streetAddress'), ''),
        city = nullif(btrim(v_review.submitted_contact ->> 'city'), ''),
        state = nullif(upper(btrim(v_review.submitted_contact ->> 'state')), ''),
        zip_code = nullif(btrim(v_review.submitted_contact ->> 'zipCode'), ''),
        email = nullif(lower(btrim(v_review.submitted_contact ->> 'email')), ''),
        phone = nullif(btrim(v_review.submitted_contact ->> 'phone'), ''),
        updated_at = now()
      where id = v_review.canonical_angler_id;
    end if;
  end loop;
  return new;
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
    end if;
  end loop;
  return v_registration;
end;
$$;

-- Clear contact-only reviews already created by the previous behavior while
-- preserving their immutable submitted snapshots and audit history.
update public.registration_identity_reviews
set review_status = 'resolved_existing',
    resolution_method = 'automatic_existing_member_keep',
    review_reason = 'Existing member retained; contact differences are informational only.',
    resolved_at = coalesce(resolved_at, now()),
    updated_at = now()
where review_kind = 'contact'
  and review_status = 'review_required';

update public.tournament_registrations registration
set identity_review_status = 'resolved_existing', updated_at = now()
where registration.registration_status = 'active'
  and registration.identity_review_status = 'review_required'
  and not exists (
    select 1 from public.registration_identity_reviews pending
    where pending.registration_id = registration.id
      and pending.review_status = 'review_required'
  );

revoke all on function public.queue_resolved_registration_attention() from public, anon, authenticated;
grant execute on function public.queue_resolved_registration_attention() to service_role;
revoke all on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb) to service_role;

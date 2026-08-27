-- A mixed Team registration may contain one participant who genuinely needs
-- review and another whose normalized email and phone already identify one
-- canonical angler. Keep the submitted tournament snapshot, but do not place
-- that high-confidence participant in the Admin review queue.

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
  v_classification jsonb;
  v_candidate_ids jsonb;
  v_candidate_id uuid;
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

  -- The application emits status=verified with exactly one candidate only for
  -- the high-confidence normalized email + normalized phone match. Resolve
  -- that participant without changing the immutable submitted snapshot.
  for v_index in 0..(v_expected_count - 1) loop
    v_classification := p_classification -> v_index;
    v_candidate_ids := coalesce(v_classification -> 'suggestedAnglerIds', '[]'::jsonb);
    if v_classification ->> 'status' = 'verified'
      and jsonb_typeof(v_candidate_ids) = 'array'
      and jsonb_array_length(v_candidate_ids) = 1 then
      v_candidate_id := (v_candidate_ids ->> 0)::uuid;
      update public.registration_identity_reviews
      set canonical_angler_id = v_candidate_id,
          review_status = 'resolved_existing',
          review_reason = 'High-confidence normalized email and phone match.',
          resolution_method = 'automatic_email_phone_match',
          resolved_at = now(),
          updated_at = now()
      where registration_id = v_registration.id
        and participant_position = (v_index + 1)::smallint
        and review_status = 'review_required';

      update public.tournament_registrations
      set angler1_id = case when v_index = 0 then v_candidate_id else angler1_id end,
          angler2_id = case when v_index = 1 then v_candidate_id else angler2_id end,
          updated_at = now()
      where id = v_registration.id
        and identity_review_status = 'review_required';
    end if;
  end loop;

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

revoke all on function public.complete_registration_for_identity_review(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_registration_for_identity_review(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb)
  to service_role;

comment on function public.complete_registration_for_identity_review(uuid,text,jsonb,jsonb,text,text,text,jsonb,jsonb) is
  'Persists paid mixed-review registrations while auto-resolving participants whose normalized email and phone identify one canonical angler.';

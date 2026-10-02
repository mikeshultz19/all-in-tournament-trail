-- A walk-up claiming Current Member without a verifiable active membership is
-- still a paid registration. Preserve it and place the membership question in
-- Needs Review instead of forcing staff to change the claim to Joining.

create or replace function public.admin_create_current_member_review_walkup(
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
  v_expected_count integer;
  v_index integer;
  v_tournament public.tournaments;
  v_price_snapshot jsonb;
  v_classification jsonb := '[]'::jsonb;
  v_registration public.tournament_registrations;
  v_next_boat_number integer;
  v_recipient_email text;
  v_selected_id uuid;
  v_matched_id uuid;
  v_suggested_ids jsonb;
begin
  if p_admin_user_id is null
    or p_registration_type not in ('solo', 'team')
    or p_payment_method not in ('cash', 'card', 'other')
    or p_anglers is null
    or jsonb_typeof(p_anglers) <> 'array' then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_INPUT_INVALID';
  end if;

  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  if jsonb_array_length(p_anglers) <> v_expected_count then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_ANGLERS_INVALID';
  end if;

  v_price_snapshot := p_options -> 'priceSnapshot';
  if jsonb_typeof(v_price_snapshot) <> 'object'
    or (v_price_snapshot ->> 'totalCents')::integer <> p_total_paid_cents then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_PRICE_SNAPSHOT_INVALID';
  end if;

  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for share;
  if not found then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_TOURNAMENT_INVALID';
  end if;

  for v_index in 0..(v_expected_count - 1) loop
    v_selected_id := nullif(p_options -> 'selectedMemberIds' ->> v_index, '')::uuid;
    v_matched_id := null;
    if v_selected_id is not null and exists (
      select 1 from public.anglers where id = v_selected_id and is_active = true and merged_into_angler_id is null
    ) then
      v_matched_id := v_selected_id;
    elsif (p_anglers -> v_index ->> 'membership') = 'current' then
      select min(id) into v_matched_id
      from public.anglers
      where lower(btrim(email)) = lower(btrim(p_anglers -> v_index ->> 'email'))
        and is_active = true and merged_into_angler_id is null;
    end if;
    v_suggested_ids := case when v_matched_id is null then '[]'::jsonb else jsonb_build_array(v_matched_id::text) end;
    if (p_anglers -> v_index ->> 'membership') = 'current'
      or exists (
        select 1
        from jsonb_array_elements(p_anglers) other_angler
        where lower(btrim(other_angler ->> 'email')) = lower(btrim(p_anglers -> v_index ->> 'email'))
          and other_angler is distinct from p_anglers -> v_index
      ) then
      v_classification := v_classification || jsonb_build_array(jsonb_build_object(
        'participantPosition', v_index + 1,
        'status', 'review_required',
        'reason', case when (p_anglers -> v_index ->> 'membership') = 'current'
          then 'Membership Needs Review: Current Member claim could not be verified automatically. Confirm the membership or keep the registration for follow-up.'
          else 'More than one walk-up participant uses this email. Confirm each identity before check-in.' end,
        'suggestedAnglerIds', v_suggested_ids
      ));
    else
      v_classification := v_classification || jsonb_build_array(jsonb_build_object(
        'participantPosition', v_index + 1,
        'status', 'verified',
        'reason', null,
        'suggestedAnglerIds', '[]'::jsonb
      ));
    end if;
  end loop;

  perform pg_advisory_xact_lock(hashtextextended(
    'tournament-boat-number:' || p_tournament_id::text, 0));
  select coalesce(max(boat_number), 0) + 1 into v_next_boat_number
  from public.tournament_registrations
  where tournament_id = p_tournament_id and boat_number is not null;

  select * into v_registration
  from public.complete_registration_for_identity_review(
    p_tournament_id, p_registration_type, p_anglers,
    p_options - 'priceSnapshot',
    'walk-up:' || gen_random_uuid()::text,
    'admin-walk-up', 'admin-walk-up', v_price_snapshot, v_classification
  );

  update public.tournament_registrations
  set boat_number = v_next_boat_number,
      registration_source = 'walk_up',
      payment_method = p_payment_method,
      price_snapshot = v_price_snapshot || jsonb_build_object(
        'recordedByAdminId', p_admin_user_id, 'paymentMethod', p_payment_method),
      admin_notes = 'Walk-up saved with membership review by Admin ' || p_admin_user_id::text,
      updated_at = now()
  where id = v_registration.id
  returning * into v_registration;

  for v_recipient_email in
    select distinct lower(btrim(participant ->> 'email'))
    from jsonb_array_elements(p_anglers) participant
  loop
    insert into public.registration_confirmation_email_deliveries (
      registration_id, payment_attempt_id, recipient_email,
      normalized_recipient_email, provider_idempotency_key
    ) values (
      v_registration.id, null, v_recipient_email, v_recipient_email,
      'registration-confirmation:' || v_registration.id::text || ':' || md5(v_recipient_email)
    ) on conflict (registration_id, normalized_recipient_email) do nothing;
  end loop;
  return v_registration;
end;
$$;

revoke all on function public.admin_create_current_member_review_walkup(uuid,text,jsonb,jsonb,text,integer,uuid)
  from public, anon, authenticated;
grant execute on function public.admin_create_current_member_review_walkup(uuid,text,jsonb,jsonb,text,integer,uuid)
  to service_role;

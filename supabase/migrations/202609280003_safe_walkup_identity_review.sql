-- Walk-up identity safety: preserve the paid entry, but route a manual
-- name/email conflict into the existing identity-review workflow.

create or replace function public.admin_create_safe_walkup_registration(
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
  v_index integer;
  v_expected_count integer;
  v_next_boat_number integer;
  v_conflict boolean := false;
  v_angler jsonb;
  v_existing_id uuid;
  v_existing_name text;
  v_existing_phone text;
  v_submitted_phone text;
  v_submitted_name text;
  v_classification jsonb := '[]'::jsonb;
  v_price_snapshot jsonb;
  v_registration public.tournament_registrations;
  v_recipient_email text;
begin
  if p_admin_user_id is null then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_INPUT_INVALID';
  end if;
  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  if jsonb_typeof(p_anglers) <> 'array' or jsonb_array_length(p_anglers) <> v_expected_count then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_ANGLERS_INVALID';
  end if;

  v_price_snapshot := p_options -> 'priceSnapshot';
  if jsonb_typeof(v_price_snapshot) <> 'object'
    or (v_price_snapshot ->> 'totalCents')::integer <> p_total_paid_cents then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_PRICE_SNAPSHOT_INVALID';
  end if;

  for v_index in 0..(v_expected_count - 1) loop
    v_angler := p_anglers -> v_index;
    v_submitted_name := lower(regexp_replace(
      btrim(v_angler ->> 'firstName') || ' ' || btrim(v_angler ->> 'lastName'),
      '\s+', ' ', 'g'));
    v_existing_id := null;
    v_existing_name := null;
    v_existing_phone := null;
    v_submitted_phone := regexp_replace(coalesce(v_angler ->> 'phone', ''), '\D', '', 'g');
    select id, lower(regexp_replace(display_name, '\s+', ' ', 'g'))
      , regexp_replace(coalesce(phone, ''), '\D', '', 'g')
    into v_existing_id, v_existing_name, v_existing_phone
    from public.anglers
    where is_active = true
      and merged_into_angler_id is null
      and lower(btrim(email)) = lower(btrim(v_angler ->> 'email'))
    order by id::text
    limit 1;

    if v_existing_id is not null and v_existing_name is distinct from v_submitted_name then
      v_conflict := true;
      v_classification := v_classification || jsonb_build_array(jsonb_build_object(
        'participantPosition', v_index + 1,
        'status', 'review_required',
        'reason', 'Submitted name differs from the existing member associated with this email. Confirm the identity before check-in.',
        'suggestedAnglerIds', jsonb_build_array(v_existing_id)
      ));
    elsif v_existing_id is not null
      and v_existing_phone = v_submitted_phone
      and v_submitted_phone <> '' then
      v_classification := v_classification || jsonb_build_array(jsonb_build_object(
        'participantPosition', v_index + 1,
        'status', 'verified',
        'reason', 'Normalized email and phone identify the existing member.',
        'suggestedAnglerIds', jsonb_build_array(v_existing_id)
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

  if not v_conflict then
    return public.admin_create_sequential_walkup_registration(
      p_tournament_id, p_registration_type, p_anglers, p_options,
      p_payment_method, p_total_paid_cents, p_admin_user_id
    );
  end if;

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
      admin_notes = 'Walk-up saved with identity review by Admin ' || p_admin_user_id::text,
      updated_at = now()
  where id = v_registration.id
  returning * into v_registration;

  for v_recipient_email in
    select distinct lower(btrim(participant ->> 'email'))
    from jsonb_array_elements(p_anglers) participant
    where nullif(lower(btrim(participant ->> 'email')), '') is not null
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

revoke all on function public.admin_create_safe_walkup_registration(uuid,text,jsonb,jsonb,text,integer,uuid)
  from public, anon, authenticated;
grant execute on function public.admin_create_safe_walkup_registration(uuid,text,jsonb,jsonb,text,integer,uuid)
  to service_role;

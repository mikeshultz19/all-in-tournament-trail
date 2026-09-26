-- Apply the walk-up no-email fix to databases that already ran the original
-- walk-up confirmation migration. Joining / Purchasing still requires email;
-- a selected Current Member may use a transaction-local identity key.

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
  v_anglers jsonb := p_anglers;
  v_price_snapshot jsonb;
  v_recipient_email text;
  v_index integer;
  v_expected_count integer;
  v_missing_email boolean[] := array[]::boolean[];
  v_selected_angler_id uuid;
  v_synthetic_email text;
begin
  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;
  for v_index in 0..(v_expected_count - 1) loop
    v_missing_email := array_append(
      v_missing_email,
      nullif(lower(btrim(p_anglers -> v_index ->> 'email')), '') is null
    );
    if v_missing_email[v_index + 1] then
      if p_anglers -> v_index ->> 'membership' = 'joining' then
        raise exception using errcode = '22023', message = 'AITT_WALKUP_MEMBER_EMAIL_REQUIRED';
      end if;
      v_selected_angler_id := nullif(p_anglers -> v_index ->> 'selectedMemberId', '')::uuid;
      if p_anglers -> v_index ->> 'membership' = 'current' and v_selected_angler_id is null then
        raise exception using errcode = '23514', message = 'AITT_WALKUP_SELECTED_MEMBER_REQUIRED';
      end if;
      if v_selected_angler_id is not null then
        perform 1 from public.anglers
        where id = v_selected_angler_id
          and is_active = true
          and merged_into_angler_id is null;
        if not found then
          raise exception using errcode = '23503', message = 'AITT_WALKUP_SELECTED_MEMBER_NOT_FOUND';
        end if;
        v_synthetic_email := 'missing-email-' || gen_random_uuid()::text || '@invalid';
        update public.anglers
        set email = v_synthetic_email, updated_at = now()
        where id = v_selected_angler_id;
      end if;
      v_anglers := jsonb_set(
        v_anglers,
        array[v_index::text, 'email'],
        to_jsonb(coalesce(v_synthetic_email, 'missing-email-' || gen_random_uuid()::text || '@invalid'))
      );
      v_selected_angler_id := null;
      v_synthetic_email := null;
    end if;
  end loop;

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
    p_tournament_id, p_registration_type, v_anglers, v_next_boat_number,
    p_options - 'priceSnapshot', p_payment_method, p_total_paid_cents,
    p_admin_user_id
  );

  for v_index in 0..(v_expected_count - 1) loop
    if v_missing_email[v_index + 1] then
      update public.anglers
      set email = null, updated_at = now()
      where id = case when v_index = 0 then v_registration.angler1_id else v_registration.angler2_id end
        and email like 'missing-email-%@invalid';
      v_registration.participant_contact_snapshot := jsonb_set(
        v_registration.participant_contact_snapshot,
        array[v_index::text, 'email'],
        '""'::jsonb
      );
    end if;
  end loop;

  update public.tournament_registrations
  set participant_contact_snapshot = v_registration.participant_contact_snapshot,
      updated_at = now()
  where id = v_registration.id
  returning * into v_registration;

  v_price_snapshot := p_options -> 'priceSnapshot';
  if jsonb_typeof(v_price_snapshot) <> 'object'
    or jsonb_typeof(v_price_snapshot -> 'lineItems') <> 'array'
    or (v_price_snapshot ->> 'totalCents')::integer <> p_total_paid_cents
    or coalesce((v_price_snapshot ->> 'cardProcessingFeeCents')::integer, 0) < 0 then
    raise exception using errcode = '22023', message = 'AITT_WALKUP_PRICE_SNAPSHOT_INVALID';
  end if;

  update public.tournament_registrations
  set price_snapshot = v_price_snapshot || jsonb_build_object(
        'recordedByAdminId', p_admin_user_id,
        'paymentMethod', p_payment_method
      ),
      updated_at = now()
  where id = v_registration.id and registration_source = 'walk_up'
  returning * into v_registration;

  if not found then
    raise exception using errcode = '23503', message = 'AITT_WALKUP_REGISTRATION_NOT_FOUND';
  end if;

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

revoke all on function public.admin_create_sequential_walkup_registration(
  uuid,text,jsonb,jsonb,text,integer,uuid
) from public, anon, authenticated;
grant execute on function public.admin_create_sequential_walkup_registration(
  uuid,text,jsonb,jsonb,text,integer,uuid
) to service_role;


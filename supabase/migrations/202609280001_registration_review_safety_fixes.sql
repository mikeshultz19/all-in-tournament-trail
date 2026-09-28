-- Registration safety fixes from the September 28 adversarial review.
-- Keep the customer-facing flow permissive: valid payments are saved, while
-- ambiguous identities are routed to the Admin review queue.

-- A membership review is completed in two updates: identity first, submitted
-- membership second. Fire the membership synchronizer for both transitions so
-- a joining participant cannot be left with a $40 snapshot but no membership.
drop trigger if exists registration_identity_reviews_sync_membership
  on public.registration_identity_reviews;
create trigger registration_identity_reviews_sync_membership
after update of canonical_angler_id, review_status, submitted_membership
on public.registration_identity_reviews
for each row execute function public.sync_resolved_registration_membership();

-- Never let an inactive canonical angler be selected by the durable identity
-- wrapper. An inactive email must be treated as a new/reviewable identity,
-- rather than charging first and failing later in the core transaction.
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
    select array_agg(id order by id::text) into v_email_match_ids
    from public.anglers
    where lower(btrim(email)) = lower(btrim(v_contact ->> 'email'))
      and is_active = true
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

revoke all on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_durable_registration(uuid,text,jsonb,jsonb,text,text,text,jsonb)
  to service_role;

-- The browser never needs direct access to the private registration table.
-- Admin/server reads use service_role, so removing the legacy anonymous read
-- policy does not affect the public registration flow.
drop policy if exists "Public tournament registrations are readable"
  on public.tournament_registrations;
revoke select on table public.tournament_registrations from anon, authenticated;

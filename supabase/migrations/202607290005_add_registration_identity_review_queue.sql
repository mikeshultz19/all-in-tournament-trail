-- Paid registrations persist before identity review. Ambiguous canonical
-- ownership remains pending until an authenticated Admin resolves it.

alter table public.tournament_registrations
  add column if not exists identity_review_status text
    not null default 'verified';

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_identity_review_status_check,
  add constraint tournament_registrations_identity_review_status_check check (
    identity_review_status in (
      'verified', 'review_required', 'approved_new', 'resolved_existing'
    )
  );

create index if not exists tournament_registrations_identity_review_idx
  on public.tournament_registrations (
    tournament_id, identity_review_status
  );

create table if not exists public.registration_identity_reviews (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null
    references public.tournament_registrations(id) on delete restrict,
  participant_position smallint not null,
  original_first_name text not null,
  original_last_name text not null,
  original_display_name text not null,
  original_email text,
  original_phone text,
  canonical_angler_id uuid
    references public.anglers(id) on delete restrict,
  review_status text not null default 'review_required',
  review_reason text not null,
  resolution_method text,
  review_note text,
  resolved_at timestamptz,
  resolved_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_identity_reviews_position_check
    check (participant_position in (1, 2)),
  constraint registration_identity_reviews_status_check check (
    review_status in (
      'verified', 'review_required', 'approved_new', 'resolved_existing'
    )
  ),
  constraint registration_identity_reviews_original_name_check check (
    btrim(original_first_name) <> ''
    and btrim(original_last_name) <> ''
    and btrim(original_display_name) <> ''
  ),
  constraint registration_identity_reviews_resolution_check check (
    review_status = 'review_required'
    or canonical_angler_id is not null
  ),
  constraint registration_identity_reviews_unique_participant
    unique (registration_id, participant_position)
);

create index if not exists registration_identity_reviews_status_idx
  on public.registration_identity_reviews (review_status, created_at);
create index if not exists registration_identity_reviews_angler_idx
  on public.registration_identity_reviews (canonical_angler_id);

create table if not exists public.registration_identity_review_candidates (
  review_id uuid not null
    references public.registration_identity_reviews(id) on delete cascade,
  angler_id uuid not null
    references public.anglers(id) on delete restrict,
  match_reason text not null,
  created_at timestamptz not null default now(),
  constraint registration_identity_review_candidates_pkey
    primary key (review_id, angler_id),
  constraint registration_identity_review_candidates_reason_check
    check (btrim(match_reason) <> '')
);

create table if not exists public.registration_identity_review_history (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null
    references public.registration_identity_reviews(id) on delete restrict,
  registration_id uuid not null
    references public.tournament_registrations(id) on delete restrict,
  previous_status text not null,
  new_status text not null,
  previous_angler_id uuid references public.anglers(id) on delete restrict,
  canonical_angler_id uuid references public.anglers(id) on delete restrict,
  previous_competitive_record_id uuid
    references public.teams(id) on delete restrict,
  competitive_record_id uuid references public.teams(id) on delete restrict,
  resolution_method text not null,
  resolved_by_admin_id uuid not null,
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists registration_identity_review_history_review_idx
  on public.registration_identity_review_history (review_id, created_at);

create or replace function public.prevent_registration_review_source_rewrite()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.registration_id is distinct from old.registration_id
    or new.participant_position is distinct from old.participant_position
    or new.original_first_name is distinct from old.original_first_name
    or new.original_last_name is distinct from old.original_last_name
    or new.original_display_name is distinct from old.original_display_name
    or new.original_email is distinct from old.original_email
    or new.original_phone is distinct from old.original_phone then
    raise exception using errcode = '23514',
      message = 'AITT_REGISTRATION_REVIEW_SOURCE_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger registration_identity_reviews_prevent_source_rewrite
before update on public.registration_identity_reviews
for each row execute function public.prevent_registration_review_source_rewrite();

create or replace function public.validate_registration_competitive_record()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_record_type text;
  v_record_season_id uuid;
  v_tournament_season_id uuid;
begin
  if new.competitive_record_id is null then
    if new.identity_review_status = 'review_required' then
      return new;
    end if;
    raise exception using
      errcode = '23502',
      message = 'AITT_REGISTRATION_COMPETITIVE_RECORD_REQUIRED';
  end if;

  select record_type, season_id
  into v_record_type, v_record_season_id
  from public.teams
  where id = new.competitive_record_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_REGISTRATION_COMPETITIVE_RECORD_NOT_FOUND';
  end if;

  select season_id into v_tournament_season_id
  from public.tournaments where id = new.tournament_id;

  if v_record_type <> new.registration_type then
    raise exception using
      errcode = '23514',
      message = 'AITT_REGISTRATION_COMPETITIVE_RECORD_TYPE_MISMATCH';
  end if;

  if v_tournament_season_id is null
    or v_record_season_id <> v_tournament_season_id then
    raise exception using
      errcode = '23514',
      message = 'AITT_REGISTRATION_COMPETITIVE_RECORD_SEASON_MISMATCH';
  end if;

  return new;
end;
$$;

drop trigger if exists tournament_registrations_validate_competitive_record
  on public.tournament_registrations;
create trigger tournament_registrations_validate_competitive_record
before insert or update of
  competitive_record_id, registration_type, tournament_id, identity_review_status
on public.tournament_registrations
for each row execute function public.validate_registration_competitive_record();

create or replace function public.require_durable_registration_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.membership_snapshot is null
    or new.price_snapshot is null
    or nullif(btrim(new.payment_reference), '') is null
    or nullif(btrim(new.rules_version), '') is null
    or nullif(btrim(new.waiver_version), '') is null
    or new.rules_accepted_at is null then
    raise exception using
      errcode = '23502',
      message = 'AITT_DURABLE_REGISTRATION_FIELDS_REQUIRED';
  end if;

  if new.identity_review_status <> 'review_required' and (
    new.competitive_record_id is null
    or new.angler1_id is null
    or (new.registration_type = 'solo' and new.angler2_id is not null)
    or (
      new.registration_type = 'team'
      and (new.angler2_id is null or new.angler1_id = new.angler2_id)
    )
  ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_DURABLE_REGISTRATION_ANGLERS_INVALID';
  end if;

  return new;
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
  v_tournament public.tournaments;
  v_registration public.tournament_registrations;
  v_existing public.tournament_registrations;
  v_angler jsonb;
  v_review jsonb;
  v_review_row public.registration_identity_reviews;
  v_candidate text;
  v_expected_count integer;
  v_index integer;
  v_registration_key text;
begin
  if p_registration_type not in ('team', 'solo') then
    raise exception using errcode = '22023',
      message = 'AITT_REGISTRATION_TYPE_INVALID';
  end if;
  v_expected_count := case when p_registration_type = 'team' then 2 else 1 end;

  if jsonb_typeof(p_anglers) <> 'array'
    or jsonb_array_length(p_anglers) <> v_expected_count
    or jsonb_typeof(p_options) <> 'object'
    or jsonb_typeof(p_price_snapshot) <> 'object'
    or jsonb_typeof(p_classification) <> 'array'
    or jsonb_array_length(p_classification) <> v_expected_count
    or nullif(btrim(p_payment_reference), '') is null then
    raise exception using errcode = '22023',
      message = 'AITT_REGISTRATION_INPUT_INVALID';
  end if;

  select * into v_tournament from public.tournaments
  where id = p_tournament_id and season_id is not null for share;
  if not found then
    raise exception using errcode = '23503',
      message = 'AITT_REGISTRATION_TOURNAMENT_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'registration-payment:' || lower(btrim(p_payment_reference)), 0
  ));
  select * into v_existing from public.tournament_registrations
  where payment_reference = btrim(p_payment_reference);
  if found then return v_existing; end if;

  v_registration_key :=
    'AITT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  insert into public.tournament_registrations (
    registration_key, tournament_id, registered_at, registration_type,
    angler1_name, angler2_name, big_bass, member_pot, insurance,
    payment_reference, membership_snapshot, price_snapshot, rules_version,
    waiver_version, rules_accepted_at, identity_review_status
  ) values (
    v_registration_key, v_tournament.id, now(), p_registration_type,
    btrim(p_anglers -> 0 ->> 'firstName') || ' ' ||
      btrim(p_anglers -> 0 ->> 'lastName'),
    case when p_registration_type = 'team' then
      btrim(p_anglers -> 1 ->> 'firstName') || ' ' ||
        btrim(p_anglers -> 1 ->> 'lastName')
    else null end,
    coalesce((p_options ->> 'bigBass')::boolean, false),
    nullif(btrim(p_options ->> 'memberPot'), ''),
    coalesce((p_options ->> 'insurance')::boolean, false),
    btrim(p_payment_reference),
    '[]'::jsonb,
    p_price_snapshot, btrim(p_rules_version), btrim(p_waiver_version),
    now(), 'review_required'
  ) returning * into v_registration;

  for v_index in 0..(v_expected_count - 1) loop
    v_angler := p_anglers -> v_index;
    v_review := p_classification -> v_index;

    insert into public.registration_identity_reviews (
      registration_id, participant_position, original_first_name,
      original_last_name, original_display_name, original_email,
      original_phone, review_reason
    ) values (
      v_registration.id, (v_index + 1)::smallint,
      btrim(v_angler ->> 'firstName'), btrim(v_angler ->> 'lastName'),
      btrim(v_angler ->> 'firstName') || ' ' ||
        btrim(v_angler ->> 'lastName'),
      nullif(lower(btrim(v_angler ->> 'email')), ''),
      nullif(btrim(v_angler ->> 'mobilePhone'), ''),
      coalesce(nullif(btrim(v_review ->> 'reason'), ''),
        'Canonical identity requires administrative approval.')
    ) returning * into v_review_row;

    for v_candidate in
      select jsonb_array_elements_text(
        coalesce(v_review -> 'suggestedAnglerIds', '[]'::jsonb)
      )
    loop
      insert into public.registration_identity_review_candidates (
        review_id, angler_id, match_reason
      ) values (
        v_review_row.id, v_candidate::uuid,
        coalesce(nullif(btrim(v_review ->> 'reason'), ''), 'Exact candidate')
      ) on conflict do nothing;
    end loop;
  end loop;

  return v_registration;
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
begin
  if p_resolution not in ('existing', 'new')
    or p_admin_user_id is null then
    raise exception using errcode = '22023',
      message = 'AITT_REGISTRATION_REVIEW_INPUT_INVALID';
  end if;

  select * into v_review from public.registration_identity_reviews
  where id = p_review_id for update;
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
    perform pg_advisory_xact_lock(hashtextextended(
      'member-email:' || lower(coalesce(v_review.original_email,
        v_review.original_display_name)), 0
    ));
    if v_review.original_email is not null and exists (
      select 1 from public.anglers
      where lower(btrim(email)) = lower(btrim(v_review.original_email))
        and merged_into_angler_id is null
    ) then
      raise exception using errcode = '23505',
        message = 'AITT_REGISTRATION_REVIEW_DUPLICATE_ANGLER';
    end if;
    insert into public.anglers (
      first_name, last_name, display_name, normalized_name, email, phone
    ) values (
      btrim(v_review.original_first_name),
      btrim(v_review.original_last_name),
      btrim(v_review.original_display_name),
      lower(regexp_replace(btrim(v_review.original_display_name),
        '\s+', ' ', 'g')),
      nullif(lower(btrim(v_review.original_email)), ''),
      nullif(btrim(v_review.original_phone), '')
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
  set canonical_angler_id = v_angler.id, review_status = v_final_status,
      resolution_method = case when p_resolution = 'new'
        then 'admin_approved_new' else 'admin_confirmed_existing' end,
      review_note = nullif(btrim(p_review_note), ''),
      resolved_at = now(), resolved_by_admin_id = p_admin_user_id,
      updated_at = now()
  where id = v_review.id;

  if not exists (
    select 1 from public.registration_identity_reviews
    where registration_id = v_registration.id
      and review_status = 'review_required'
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
      array_to_string(array[
        v_registration.angler1_name, v_registration.angler2_name
      ], ' / ')
    );

    select exists (
      select 1 from public.registration_identity_reviews
      where registration_id = v_registration.id
        and review_status = 'approved_new'
    ) into v_any_new;

    update public.tournament_registrations
    set competitive_record_id = v_record.id,
        angler1_id = v_angler_ids[1],
        angler2_id = case when registration_type = 'team'
          then v_angler_ids[2] else null end,
        identity_review_status = case when v_any_new
          then 'approved_new' else 'resolved_existing' end,
        updated_at = now()
    where id = v_registration.id
    returning * into v_registration;

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

create or replace function public.admin_reopen_registration_identity_review(
  p_review_id uuid,
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
begin
  select * into v_review from public.registration_identity_reviews
  where id = p_review_id for update;
  if not found or p_admin_user_id is null then
    raise exception using errcode = '23503',
      message = 'AITT_REGISTRATION_REVIEW_NOT_FOUND';
  end if;
  select * into v_registration from public.tournament_registrations
  where id = v_review.registration_id for update;

  insert into public.registration_identity_review_history (
    review_id, registration_id, previous_status, new_status,
    previous_angler_id, canonical_angler_id,
    previous_competitive_record_id, competitive_record_id,
    resolution_method, resolved_by_admin_id, review_note
  ) values (
    v_review.id, v_registration.id, v_review.review_status,
    'review_required', v_review.canonical_angler_id, null,
    v_registration.competitive_record_id, v_registration.competitive_record_id,
    'admin_reopened', p_admin_user_id, nullif(btrim(p_review_note), '')
  );

  update public.registration_identity_reviews
  set canonical_angler_id = null, review_status = 'review_required',
      resolution_method = 'admin_reopened',
      review_note = nullif(btrim(p_review_note), ''),
      resolved_at = null, resolved_by_admin_id = null, updated_at = now()
  where id = v_review.id;

  update public.tournament_registrations
  set identity_review_status = 'review_required', updated_at = now()
  where id = v_registration.id returning * into v_registration;
  return v_registration;
end;
$$;

alter table public.registration_identity_reviews enable row level security;
alter table public.registration_identity_review_candidates enable row level security;
alter table public.registration_identity_review_history enable row level security;

revoke all on table public.registration_identity_reviews
  from public, anon, authenticated;
revoke all on table public.registration_identity_review_candidates
  from public, anon, authenticated;
revoke all on table public.registration_identity_review_history
  from public, anon, authenticated;
grant select on table public.registration_identity_reviews to service_role;
grant select on table public.registration_identity_review_candidates
  to service_role;
grant select on table public.registration_identity_review_history
  to service_role;

revoke all on function public.complete_registration_for_identity_review(
  uuid, text, jsonb, jsonb, text, text, text, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_registration_for_identity_review(
  uuid, text, jsonb, jsonb, text, text, text, jsonb, jsonb
) to service_role;

revoke all on function public.admin_resolve_registration_identity(
  uuid, text, uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.admin_resolve_registration_identity(
  uuid, text, uuid, uuid, text
) to service_role;

revoke all on function public.admin_reopen_registration_identity_review(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.admin_reopen_registration_identity_review(
  uuid, uuid, text
) to service_role;

comment on column public.tournament_registrations.identity_review_status is
  'Post-payment canonical identity state. review_required never invalidates or hides the stored registration.';

-- Controlled identity reconciliation for imported tournament data.
-- This migration establishes identity mappings only. It does not publish
-- Official Results or calculate AOY or Championship qualification.

create table if not exists public.source_angler_identities (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_identity_key text not null,
  source_display_name text not null,
  normalized_name text not null,
  source_metadata jsonb not null default '{}'::jsonb,
  angler_id uuid references public.anglers(id) on delete restrict,
  reconciliation_status text not null default 'unresolved',
  resolution_method text,
  resolved_at timestamptz,
  resolved_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_angler_identities_source_system_not_blank
    check (btrim(source_system) <> ''),
  constraint source_angler_identities_source_key_not_blank
    check (btrim(source_identity_key) <> ''),
  constraint source_angler_identities_display_name_not_blank
    check (btrim(source_display_name) <> ''),
  constraint source_angler_identities_normalized_name_not_blank
    check (btrim(normalized_name) <> ''),
  constraint source_angler_identities_metadata_object
    check (jsonb_typeof(source_metadata) = 'object'),
  constraint source_angler_identities_status_check check (
    reconciliation_status in (
      'unresolved', 'suggested', 'confirmed', 'rejected', 'review_required'
    )
  ),
  constraint source_angler_identities_confirmed_target_check check (
    reconciliation_status <> 'confirmed' or angler_id is not null
  ),
  constraint source_angler_identities_unique_source
    unique (source_system, source_identity_key)
);

create index if not exists source_angler_identities_angler_id_idx
  on public.source_angler_identities (angler_id);
create index if not exists source_angler_identities_normalized_name_idx
  on public.source_angler_identities (normalized_name);
create index if not exists source_angler_identities_status_idx
  on public.source_angler_identities (reconciliation_status);

create table if not exists public.source_angler_identity_candidates (
  source_identity_id uuid not null
    references public.source_angler_identities(id) on delete cascade,
  angler_id uuid not null
    references public.anglers(id) on delete restrict,
  match_method text not null,
  created_at timestamptz not null default now(),
  constraint source_angler_identity_candidates_pkey
    primary key (source_identity_id, angler_id),
  constraint source_angler_identity_candidates_method_not_blank
    check (btrim(match_method) <> '')
);

create table if not exists public.source_angler_identity_history (
  id uuid primary key default gen_random_uuid(),
  source_identity_id uuid not null
    references public.source_angler_identities(id) on delete restrict,
  previous_angler_id uuid references public.anglers(id) on delete restrict,
  angler_id uuid references public.anglers(id) on delete restrict,
  previous_status text,
  reconciliation_status text not null,
  resolution_method text,
  resolved_by_admin_id uuid not null,
  created_at timestamptz not null default now(),
  constraint source_angler_identity_history_status_check check (
    reconciliation_status in (
      'unresolved', 'suggested', 'confirmed', 'rejected', 'review_required'
    )
  )
);

create index if not exists source_angler_identity_history_identity_idx
  on public.source_angler_identity_history (source_identity_id, created_at);

create table if not exists public.imported_competitive_identities (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_entry_key text not null,
  tournament_id uuid not null
    references public.tournaments(id) on delete restrict,
  season_id uuid not null
    references public.seasons(id) on delete restrict,
  regular_season_number smallint,
  record_type text not null,
  source_participants jsonb not null,
  source_metadata jsonb not null default '{}'::jsonb,
  competitive_record_id uuid
    references public.teams(id) on delete restrict,
  registration_id uuid
    references public.tournament_registrations(id) on delete restrict,
  reconciliation_status text not null default 'unresolved',
  resolution_method text,
  resolved_at timestamptz,
  resolved_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imported_competitive_identities_source_system_not_blank
    check (btrim(source_system) <> ''),
  constraint imported_competitive_identities_source_key_not_blank
    check (btrim(source_entry_key) <> ''),
  constraint imported_competitive_identities_record_type_check
    check (record_type in ('team', 'solo')),
  constraint imported_competitive_identities_participants_array
    check (jsonb_typeof(source_participants) = 'array'),
  constraint imported_competitive_identities_metadata_object
    check (jsonb_typeof(source_metadata) = 'object'),
  constraint imported_competitive_identities_number_check
    check (
      regular_season_number is null
      or regular_season_number between 1 and 8
    ),
  constraint imported_competitive_identities_status_check check (
    reconciliation_status in (
      'unresolved', 'suggested', 'confirmed', 'rejected', 'review_required'
    )
  ),
  constraint imported_competitive_identities_confirmed_target_check check (
    reconciliation_status <> 'confirmed'
    or competitive_record_id is not null
  ),
  constraint imported_competitive_identities_unique_source_entry
    unique (source_system, source_entry_key)
);

create index if not exists imported_competitive_identities_tournament_idx
  on public.imported_competitive_identities (tournament_id);
create index if not exists imported_competitive_identities_record_idx
  on public.imported_competitive_identities (competitive_record_id);
create index if not exists imported_competitive_identities_status_idx
  on public.imported_competitive_identities (reconciliation_status);

create table if not exists public.imported_competitive_identity_members (
  imported_identity_id uuid not null
    references public.imported_competitive_identities(id) on delete cascade,
  source_identity_id uuid not null
    references public.source_angler_identities(id) on delete restrict,
  source_position smallint not null,
  created_at timestamptz not null default now(),
  constraint imported_competitive_identity_members_pkey
    primary key (imported_identity_id, source_identity_id),
  constraint imported_competitive_identity_members_position_unique
    unique (imported_identity_id, source_position),
  constraint imported_competitive_identity_members_position_check
    check (source_position in (1, 2))
);

create table if not exists public.imported_competitive_identity_candidates (
  imported_identity_id uuid not null
    references public.imported_competitive_identities(id) on delete cascade,
  competitive_record_id uuid not null
    references public.teams(id) on delete restrict,
  match_method text not null,
  created_at timestamptz not null default now(),
  constraint imported_competitive_identity_candidates_pkey
    primary key (imported_identity_id, competitive_record_id),
  constraint imported_competitive_identity_candidates_method_not_blank
    check (btrim(match_method) <> '')
);

create table if not exists public.imported_competitive_identity_history (
  id uuid primary key default gen_random_uuid(),
  imported_identity_id uuid not null
    references public.imported_competitive_identities(id) on delete restrict,
  previous_competitive_record_id uuid
    references public.teams(id) on delete restrict,
  competitive_record_id uuid references public.teams(id) on delete restrict,
  previous_status text,
  reconciliation_status text not null,
  resolution_method text,
  resolved_by_admin_id uuid not null,
  created_at timestamptz not null default now(),
  constraint imported_competitive_identity_history_status_check check (
    reconciliation_status in (
      'unresolved', 'suggested', 'confirmed', 'rejected', 'review_required'
    )
  )
);

create index if not exists imported_competitive_identity_history_identity_idx
  on public.imported_competitive_identity_history (
    imported_identity_id, created_at
  );

alter table public.tournament_result_entries
  add column if not exists imported_competitive_identity_id uuid,
  add column if not exists competitive_record_id uuid;

alter table public.tournament_result_entries
  drop constraint if exists tournament_result_entries_imported_identity_fkey,
  add constraint tournament_result_entries_imported_identity_fkey
    foreign key (imported_competitive_identity_id)
    references public.imported_competitive_identities(id)
    on delete restrict,
  drop constraint if exists tournament_result_entries_competitive_record_fkey,
  add constraint tournament_result_entries_competitive_record_fkey
    foreign key (competitive_record_id)
    references public.teams(id)
    on delete restrict;

create index if not exists tournament_result_entries_imported_identity_idx
  on public.tournament_result_entries (imported_competitive_identity_id);
create index if not exists tournament_result_entries_competitive_record_idx
  on public.tournament_result_entries (competitive_record_id);

create or replace function public.prevent_source_identity_rewrite()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.source_system is distinct from old.source_system
    or new.source_identity_key is distinct from old.source_identity_key
    or new.source_display_name is distinct from old.source_display_name
    or new.normalized_name is distinct from old.normalized_name
    or new.source_metadata is distinct from old.source_metadata then
    raise exception using
      errcode = '23514',
      message = 'AITT_SOURCE_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger source_angler_identities_prevent_source_rewrite
before update on public.source_angler_identities
for each row execute function public.prevent_source_identity_rewrite();

create or replace function public.prevent_imported_identity_rewrite()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.source_system is distinct from old.source_system
    or new.source_entry_key is distinct from old.source_entry_key
    or new.tournament_id is distinct from old.tournament_id
    or new.season_id is distinct from old.season_id
    or new.regular_season_number is distinct from old.regular_season_number
    or new.record_type is distinct from old.record_type
    or new.source_participants is distinct from old.source_participants
    or new.source_metadata is distinct from old.source_metadata then
    raise exception using
      errcode = '23514',
      message = 'AITT_IMPORTED_IDENTITY_SOURCE_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger imported_competitive_identities_prevent_source_rewrite
before update on public.imported_competitive_identities
for each row execute function public.prevent_imported_identity_rewrite();

create or replace function public.validate_imported_identity_context()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_record public.teams;
  v_registration public.tournament_registrations;
begin
  select * into v_tournament
  from public.tournaments
  where id = new.tournament_id;

  if not found
    or v_tournament.season_id is distinct from new.season_id
    or v_tournament.regular_season_number
      is distinct from new.regular_season_number then
    raise exception using
      errcode = '23514',
      message = 'AITT_IDENTITY_TOURNAMENT_CONTEXT_MISMATCH';
  end if;

  if new.competitive_record_id is not null then
    select * into v_record
    from public.teams
    where id = new.competitive_record_id;

    if not found
      or v_record.season_id <> new.season_id
      or v_record.record_type <> new.record_type then
      raise exception using
        errcode = '23514',
        message = 'AITT_IDENTITY_COMPETITIVE_RECORD_MISMATCH';
    end if;
  end if;

  if new.registration_id is not null then
    select * into v_registration
    from public.tournament_registrations
    where id = new.registration_id;

    if not found
      or v_registration.tournament_id <> new.tournament_id
      or v_registration.registration_type <> new.record_type
      or (
        new.competitive_record_id is not null
        and v_registration.competitive_record_id
          <> new.competitive_record_id
      ) then
      raise exception using
        errcode = '23514',
        message = 'AITT_IDENTITY_REGISTRATION_EVIDENCE_MISMATCH';
    end if;
  end if;

  return new;
end;
$$;

create trigger imported_competitive_identities_validate_context
before insert or update of competitive_record_id, registration_id
on public.imported_competitive_identities
for each row execute function public.validate_imported_identity_context();

create or replace function public.record_imported_competitive_identity(
  p_source_system text,
  p_source_entry_key text,
  p_tournament_id uuid,
  p_record_type text,
  p_source_participants jsonb,
  p_source_metadata jsonb default '{}'::jsonb
)
returns public.imported_competitive_identities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_imported public.imported_competitive_identities;
  v_participant jsonb;
  v_source_identity public.source_angler_identities;
  v_expected_count integer;
  v_position integer := 0;
begin
  if nullif(btrim(p_source_system), '') is null
    or nullif(btrim(p_source_entry_key), '') is null
    or p_record_type not in ('team', 'solo')
    or p_source_participants is null
    or jsonb_typeof(p_source_participants) <> 'array'
    or p_source_metadata is null
    or jsonb_typeof(p_source_metadata) <> 'object' then
    raise exception using
      errcode = '22023',
      message = 'AITT_IMPORTED_IDENTITY_INPUT_INVALID';
  end if;

  v_expected_count := case when p_record_type = 'team' then 2 else 1 end;
  if jsonb_array_length(p_source_participants) <> v_expected_count then
    raise exception using
      errcode = '22023',
      message = 'AITT_IMPORTED_IDENTITY_MEMBER_COUNT_INVALID';
  end if;

  select * into v_tournament
  from public.tournaments
  where id = p_tournament_id
    and season_id is not null
  for share;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_IMPORTED_IDENTITY_TOURNAMENT_INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'imported-identity:' || lower(btrim(p_source_system))
      || ':' || btrim(p_source_entry_key),
    0
  ));

  select * into v_imported
  from public.imported_competitive_identities
  where source_system = lower(btrim(p_source_system))
    and source_entry_key = btrim(p_source_entry_key);

  if found then
    if v_imported.tournament_id <> v_tournament.id
      or v_imported.record_type <> p_record_type
      or v_imported.source_participants is distinct from p_source_participants
      or v_imported.source_metadata is distinct from p_source_metadata then
      raise exception using
        errcode = '23505',
        message = 'AITT_IMPORTED_IDENTITY_KEY_COLLISION';
    end if;

    return v_imported;
  end if;

  insert into public.imported_competitive_identities (
    source_system,
    source_entry_key,
    tournament_id,
    season_id,
    regular_season_number,
    record_type,
    source_participants,
    source_metadata
  ) values (
    lower(btrim(p_source_system)),
    btrim(p_source_entry_key),
    v_tournament.id,
    v_tournament.season_id,
    v_tournament.regular_season_number,
    p_record_type,
    p_source_participants,
    p_source_metadata
  )
  returning * into v_imported;

  for v_participant in
    select value from jsonb_array_elements(p_source_participants)
  loop
    v_position := v_position + 1;

    if nullif(btrim(v_participant ->> 'sourceIdentityKey'), '') is null
      or nullif(btrim(v_participant ->> 'displayName'), '') is null
      or nullif(btrim(v_participant ->> 'normalizedName'), '') is null then
      raise exception using
        errcode = '22023',
        message = 'AITT_SOURCE_IDENTITY_INPUT_INVALID';
    end if;

    insert into public.source_angler_identities (
      source_system,
      source_identity_key,
      source_display_name,
      normalized_name,
      source_metadata
    ) values (
      lower(btrim(p_source_system)),
      btrim(v_participant ->> 'sourceIdentityKey'),
      btrim(v_participant ->> 'displayName'),
      btrim(v_participant ->> 'normalizedName'),
      coalesce(v_participant -> 'metadata', '{}'::jsonb)
    )
    on conflict (source_system, source_identity_key) do nothing;

    select * into v_source_identity
    from public.source_angler_identities
    where source_system = lower(btrim(p_source_system))
      and source_identity_key =
        btrim(v_participant ->> 'sourceIdentityKey');

    insert into public.imported_competitive_identity_members (
      imported_identity_id,
      source_identity_id,
      source_position
    ) values (
      v_imported.id,
      v_source_identity.id,
      v_position
    );
  end loop;

  return v_imported;
end;
$$;

create or replace function public.resolve_source_angler_identity(
  p_source_identity_id uuid,
  p_angler_id uuid,
  p_decision text,
  p_resolution_method text,
  p_admin_user_id uuid
)
returns public.source_angler_identities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_identity public.source_angler_identities;
  v_previous public.source_angler_identities;
  v_status text;
begin
  if p_decision not in ('confirmed', 'rejected')
    or p_admin_user_id is null
    or nullif(btrim(p_resolution_method), '') is null then
    raise exception using
      errcode = '22023',
      message = 'AITT_IDENTITY_RESOLUTION_INPUT_INVALID';
  end if;

  select * into v_previous
  from public.source_angler_identities
  where id = p_source_identity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_SOURCE_IDENTITY_NOT_FOUND';
  end if;

  if p_decision = 'confirmed' and not exists (
    select 1 from public.anglers
    where id = p_angler_id
      and is_active = true
      and merged_into_angler_id is null
  ) then
    raise exception using
      errcode = '23503',
      message = 'AITT_IDENTITY_ANGLER_NOT_FOUND';
  end if;

  v_status := p_decision;

  update public.source_angler_identities
  set angler_id = case when v_status = 'confirmed' then p_angler_id else null end,
      reconciliation_status = v_status,
      resolution_method = btrim(p_resolution_method),
      resolved_at = now(),
      resolved_by_admin_id = p_admin_user_id,
      updated_at = now()
  where id = p_source_identity_id
  returning * into v_identity;

  insert into public.source_angler_identity_history (
    source_identity_id,
    previous_angler_id,
    angler_id,
    previous_status,
    reconciliation_status,
    resolution_method,
    resolved_by_admin_id
  ) values (
    v_identity.id,
    v_previous.angler_id,
    v_identity.angler_id,
    v_previous.reconciliation_status,
    v_identity.reconciliation_status,
    v_identity.resolution_method,
    p_admin_user_id
  );

  return v_identity;
end;
$$;

create or replace function public.set_source_identity_candidates(
  p_source_identity_id uuid,
  p_status text,
  p_candidate_angler_ids uuid[],
  p_match_method text
)
returns public.source_angler_identities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_identity public.source_angler_identities;
begin
  if p_status not in ('unresolved', 'suggested', 'review_required')
    or nullif(btrim(p_match_method), '') is null then
    raise exception using
      errcode = '22023',
      message = 'AITT_IDENTITY_CANDIDATE_INPUT_INVALID';
  end if;

  select * into v_identity
  from public.source_angler_identities
  where id = p_source_identity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_SOURCE_IDENTITY_NOT_FOUND';
  end if;

  if v_identity.reconciliation_status = 'confirmed' then
    return v_identity;
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_candidate_angler_ids, array[]::uuid[])) candidate_id
    left join public.anglers angler
      on angler.id = candidate_id
      and angler.is_active = true
      and angler.merged_into_angler_id is null
    where angler.id is null
  ) then
    raise exception using
      errcode = '23503',
      message = 'AITT_IDENTITY_CANDIDATE_ANGLER_NOT_FOUND';
  end if;

  delete from public.source_angler_identity_candidates
  where source_identity_id = v_identity.id;

  insert into public.source_angler_identity_candidates (
    source_identity_id,
    angler_id,
    match_method
  )
  select
    v_identity.id,
    candidate_id,
    btrim(p_match_method)
  from (
    select distinct unnest(
      coalesce(p_candidate_angler_ids, array[]::uuid[])
    ) as candidate_id
  ) candidates;

  update public.source_angler_identities
  set reconciliation_status = p_status,
      resolution_method = btrim(p_match_method),
      updated_at = now()
  where id = v_identity.id
  returning * into v_identity;

  return v_identity;
end;
$$;

create or replace function public.resolve_imported_competitive_identity(
  p_imported_identity_id uuid,
  p_competitive_record_id uuid,
  p_registration_id uuid,
  p_decision text,
  p_resolution_method text,
  p_admin_user_id uuid
)
returns public.imported_competitive_identities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_identity public.imported_competitive_identities;
  v_previous public.imported_competitive_identities;
  v_record public.teams;
  v_resolved_ids uuid[];
  v_record_ids uuid[];
begin
  if p_decision not in ('confirmed', 'rejected')
    or p_admin_user_id is null
    or nullif(btrim(p_resolution_method), '') is null then
    raise exception using
      errcode = '22023',
      message = 'AITT_IDENTITY_RESOLUTION_INPUT_INVALID';
  end if;

  select * into v_previous
  from public.imported_competitive_identities
  where id = p_imported_identity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_IMPORTED_IDENTITY_NOT_FOUND';
  end if;

  if p_decision = 'confirmed' then
    select * into v_record
    from public.teams
    where id = p_competitive_record_id
      and season_id = v_previous.season_id
      and record_type = v_previous.record_type;

    if not found then
      raise exception using
        errcode = '23514',
        message = 'AITT_IDENTITY_COMPETITIVE_RECORD_MISMATCH';
    end if;

    select array_agg(identity.angler_id order by identity.angler_id::text)
    into v_resolved_ids
    from public.imported_competitive_identity_members member
    join public.source_angler_identities identity
      on identity.id = member.source_identity_id
    where member.imported_identity_id = v_previous.id
      and identity.reconciliation_status = 'confirmed'
      and identity.angler_id is not null;

    select array_agg(member.angler_id order by member.angler_id::text)
    into v_record_ids
    from public.team_members member
    where member.team_id = v_record.id;

    if v_resolved_ids is distinct from v_record_ids then
      raise exception using
        errcode = '23514',
        message = 'AITT_IDENTITY_COMPETITIVE_RECORD_MEMBERS_MISMATCH';
    end if;
  end if;

  update public.imported_competitive_identities
  set competitive_record_id = case
        when p_decision = 'confirmed' then p_competitive_record_id
        else null
      end,
      registration_id = case
        when p_decision = 'confirmed' then p_registration_id
        else null
      end,
      reconciliation_status = p_decision,
      resolution_method = btrim(p_resolution_method),
      resolved_at = now(),
      resolved_by_admin_id = p_admin_user_id,
      updated_at = now()
  where id = p_imported_identity_id
  returning * into v_identity;

  insert into public.imported_competitive_identity_history (
    imported_identity_id,
    previous_competitive_record_id,
    competitive_record_id,
    previous_status,
    reconciliation_status,
    resolution_method,
    resolved_by_admin_id
  ) values (
    v_identity.id,
    v_previous.competitive_record_id,
    v_identity.competitive_record_id,
    v_previous.reconciliation_status,
    v_identity.reconciliation_status,
    v_identity.resolution_method,
    p_admin_user_id
  );

  return v_identity;
end;
$$;

create or replace function public.set_imported_identity_candidates(
  p_imported_identity_id uuid,
  p_status text,
  p_candidate_record_ids uuid[],
  p_match_method text
)
returns public.imported_competitive_identities
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_identity public.imported_competitive_identities;
begin
  if p_status not in ('unresolved', 'suggested', 'review_required')
    or nullif(btrim(p_match_method), '') is null then
    raise exception using
      errcode = '22023',
      message = 'AITT_IDENTITY_CANDIDATE_INPUT_INVALID';
  end if;

  select * into v_identity
  from public.imported_competitive_identities
  where id = p_imported_identity_id
  for update;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'AITT_IMPORTED_IDENTITY_NOT_FOUND';
  end if;

  if v_identity.reconciliation_status = 'confirmed' then
    return v_identity;
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_candidate_record_ids, array[]::uuid[])) candidate_id
    left join public.teams record
      on record.id = candidate_id
      and record.season_id = v_identity.season_id
      and record.record_type = v_identity.record_type
    where record.id is null
  ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_IDENTITY_COMPETITIVE_RECORD_MISMATCH';
  end if;

  delete from public.imported_competitive_identity_candidates
  where imported_identity_id = v_identity.id;

  insert into public.imported_competitive_identity_candidates (
    imported_identity_id,
    competitive_record_id,
    match_method
  )
  select
    v_identity.id,
    candidate_id,
    btrim(p_match_method)
  from (
    select distinct unnest(
      coalesce(p_candidate_record_ids, array[]::uuid[])
    ) as candidate_id
  ) candidates;

  update public.imported_competitive_identities
  set reconciliation_status = p_status,
      resolution_method = btrim(p_match_method),
      updated_at = now()
  where id = v_identity.id
  returning * into v_identity;

  return v_identity;
end;
$$;

alter table public.source_angler_identities enable row level security;
alter table public.source_angler_identity_candidates enable row level security;
alter table public.source_angler_identity_history enable row level security;
alter table public.imported_competitive_identities enable row level security;
alter table public.imported_competitive_identity_members enable row level security;
alter table public.imported_competitive_identity_candidates enable row level security;
alter table public.imported_competitive_identity_history enable row level security;

revoke all on table public.source_angler_identities
  from public, anon, authenticated;
revoke all on table public.source_angler_identity_candidates
  from public, anon, authenticated;
revoke all on table public.source_angler_identity_history
  from public, anon, authenticated;
revoke all on table public.imported_competitive_identities
  from public, anon, authenticated;
revoke all on table public.imported_competitive_identity_members
  from public, anon, authenticated;
revoke all on table public.imported_competitive_identity_candidates
  from public, anon, authenticated;
revoke all on table public.imported_competitive_identity_history
  from public, anon, authenticated;

grant select on table public.source_angler_identities to service_role;
grant select on table public.source_angler_identity_candidates
  to service_role;
grant select on table public.source_angler_identity_history to service_role;
grant select on table public.imported_competitive_identities
  to service_role;
grant select on table public.imported_competitive_identity_members
  to service_role;
grant select on table public.imported_competitive_identity_candidates
  to service_role;
grant select on table public.imported_competitive_identity_history
  to service_role;

revoke all on function public.resolve_source_angler_identity(
  uuid, uuid, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.resolve_source_angler_identity(
  uuid, uuid, text, text, uuid
) to service_role;

revoke all on function public.set_source_identity_candidates(
  uuid, text, uuid[], text
) from public, anon, authenticated;
grant execute on function public.set_source_identity_candidates(
  uuid, text, uuid[], text
) to service_role;

revoke all on function public.set_imported_identity_candidates(
  uuid, text, uuid[], text
) from public, anon, authenticated;
grant execute on function public.set_imported_identity_candidates(
  uuid, text, uuid[], text
) to service_role;

revoke all on function public.record_imported_competitive_identity(
  text, text, uuid, text, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.record_imported_competitive_identity(
  text, text, uuid, text, jsonb, jsonb
) to service_role;

revoke all on function public.resolve_imported_competitive_identity(
  uuid, uuid, uuid, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.resolve_imported_competitive_identity(
  uuid, uuid, uuid, text, text, uuid
) to service_role;

comment on table public.source_angler_identities is
  'Immutable imported person identities and their controlled canonical Angler mapping.';
comment on table public.imported_competitive_identities is
  'Immutable imported entry identities and their controlled Team or Solo Competitive Record mapping.';
comment on table public.source_angler_identity_history is
  'Append-only audit history for source Angler identity resolution and reassignment.';
comment on table public.imported_competitive_identity_history is
  'Append-only audit history for imported Competitive Record resolution and reassignment.';

-- Extend the existing teams/team_members foundation into the constitutional
-- Competitive Record model. The public.teams name is retained for compatibility.

alter table public.teams
  add column if not exists record_type text;

update public.teams as record
set record_type = member_counts.record_type
from (
  select
    team.id,
    case count(member.angler_id)
      when 1 then 'solo'
      when 2 then 'team'
      else null
    end as record_type
  from public.teams as team
  left join public.team_members as member
    on member.team_id = team.id
  where team.record_type is null
  group by team.id
) as member_counts
where record.id = member_counts.id;

do $$
begin
  if exists (
    select 1
    from public.teams
    where record_type is null
  ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_COMPETITIVE_RECORD_INVALID_LEGACY_MEMBERSHIP';
  end if;
end;
$$;

alter table public.teams
  alter column record_type set not null,
  drop constraint if exists teams_record_type_check,
  add constraint teams_record_type_check
    check (record_type in ('team', 'solo'));

comment on table public.teams is
  'Stable season Competitive Records. record_type team has exactly two stable anglers; record_type solo has exactly one.';

comment on column public.teams.record_type is
  'Constitutional Competitive Record type: team or solo.';

comment on column public.teams.canonical_member_key is
  'Stable unordered UUID key. Team records contain two sorted angler UUIDs; Solo records contain one angler UUID.';

alter table public.team_members
  drop constraint if exists team_members_team_id_fkey,
  add constraint team_members_team_id_fkey
    foreign key (team_id)
    references public.teams(id)
    on delete restrict;

create or replace function public.prevent_competitive_record_identity_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'teams' then
    if new.season_id is distinct from old.season_id
      or new.record_type is distinct from old.record_type
      or new.canonical_member_key is distinct from old.canonical_member_key then
      raise exception using
        errcode = '23514',
        message = 'AITT_COMPETITIVE_RECORD_IDENTITY_IMMUTABLE';
    end if;

    return new;
  end if;

  raise exception using
    errcode = '23514',
    message = 'AITT_COMPETITIVE_RECORD_MEMBERSHIP_IMMUTABLE';
end;
$$;

drop trigger if exists teams_prevent_competitive_record_identity_change
  on public.teams;
create trigger teams_prevent_competitive_record_identity_change
before update of season_id, record_type, canonical_member_key
on public.teams
for each row execute function public.prevent_competitive_record_identity_change();

drop trigger if exists team_members_prevent_competitive_record_membership_change
  on public.team_members;
create trigger team_members_prevent_competitive_record_membership_change
before update or delete
on public.team_members
for each row execute function public.prevent_competitive_record_identity_change();

create or replace function public.validate_competitive_record_members()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_record_id uuid;
  v_record_type text;
  v_member_count integer;
begin
  if tg_table_name = 'teams' then
    v_record_id := coalesce(new.id, old.id);
  else
    v_record_id := coalesce(new.team_id, old.team_id);
  end if;

  select record.record_type, count(member.angler_id)::integer
  into v_record_type, v_member_count
  from public.teams as record
  left join public.team_members as member
    on member.team_id = record.id
  where record.id = v_record_id
  group by record.record_type;

  -- A missing record can occur only while its parent row is being removed.
  -- The restrictive foreign key and immutable-membership trigger normally
  -- prevent Competitive Record deletion.
  if not found then
    return null;
  end if;

  if (v_record_type = 'team' and v_member_count <> 2)
    or (v_record_type = 'solo' and v_member_count <> 1) then
    raise exception using
      errcode = '23514',
      message = 'AITT_COMPETITIVE_RECORD_MEMBER_COUNT_MISMATCH';
  end if;

  return null;
end;
$$;

drop trigger if exists teams_validate_competitive_record_members
  on public.teams;
create constraint trigger teams_validate_competitive_record_members
after insert or update of record_type
on public.teams
deferrable initially deferred
for each row execute function public.validate_competitive_record_members();

drop trigger if exists team_members_validate_competitive_record_members
  on public.team_members;
create constraint trigger team_members_validate_competitive_record_members
after insert or update or delete
on public.team_members
deferrable initially deferred
for each row execute function public.validate_competitive_record_members();

create or replace function public.create_competitive_record(
  p_season_id uuid,
  p_record_type text,
  p_angler_ids uuid[],
  p_display_name text default null
)
returns public.teams
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_record public.teams;
  v_angler_ids uuid[];
  v_expected_count integer;
  v_canonical_key text;
begin
  if p_record_type not in ('team', 'solo') then
    raise exception using
      errcode = '22023',
      message = 'AITT_COMPETITIVE_RECORD_TYPE_INVALID';
  end if;

  v_expected_count := case p_record_type
    when 'team' then 2
    else 1
  end;

  select array_agg(id order by id::text)
  into v_angler_ids
  from (
    select distinct unnest(p_angler_ids) as id
  ) as distinct_anglers;

  if coalesce(array_length(v_angler_ids, 1), 0) <> v_expected_count
    or coalesce(array_length(p_angler_ids, 1), 0) <> v_expected_count then
    raise exception using
      errcode = '22023',
      message = 'AITT_COMPETITIVE_RECORD_MEMBER_COUNT_INVALID';
  end if;

  if not exists (
    select 1 from public.seasons where id = p_season_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'AITT_COMPETITIVE_RECORD_SEASON_NOT_FOUND';
  end if;

  if (
    select count(*)
    from public.anglers
    where id = any(v_angler_ids)
      and is_active = true
      and merged_into_angler_id is null
  ) <> v_expected_count then
    raise exception using
      errcode = '23503',
      message = 'AITT_COMPETITIVE_RECORD_ANGLER_NOT_FOUND';
  end if;

  v_canonical_key := array_to_string(v_angler_ids, ':');

  perform pg_advisory_xact_lock(
    hashtextextended(
      'competitive-record:' || p_season_id::text || ':' || v_canonical_key,
      0
    )
  );

  select *
  into v_record
  from public.teams
  where season_id = p_season_id
    and canonical_member_key = v_canonical_key;

  if found then
    if v_record.record_type <> p_record_type then
      raise exception using
        errcode = '23514',
        message = 'AITT_COMPETITIVE_RECORD_TYPE_MISMATCH';
    end if;

    return v_record;
  end if;

  insert into public.teams (
    season_id,
    record_type,
    display_name,
    canonical_member_key
  )
  values (
    p_season_id,
    p_record_type,
    nullif(btrim(p_display_name), ''),
    v_canonical_key
  )
  returning * into v_record;

  insert into public.team_members (
    team_id,
    angler_id,
    member_position
  )
  select
    v_record.id,
    angler_id,
    row_number() over (order by angler_id::text)::smallint
  from unnest(v_angler_ids) as angler_id;

  return v_record;
end;
$$;

revoke all on function public.create_competitive_record(
  uuid, text, uuid[], text
) from public, anon, authenticated;

grant execute on function public.create_competitive_record(
  uuid, text, uuid[], text
) to service_role;

comment on function public.create_competitive_record(
  uuid, text, uuid[], text
) is
  'Atomically finds or creates one stable Team or Solo Competitive Record and its exact stable membership.';

alter table public.tournament_registrations
  add column if not exists competitive_record_id uuid;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_competitive_record_id_fkey,
  add constraint tournament_registrations_competitive_record_id_fkey
    foreign key (competitive_record_id)
    references public.teams(id)
    on delete restrict;

create index if not exists tournament_registrations_competitive_record_id_idx
  on public.tournament_registrations (competitive_record_id);

-- Do not use a NOT VALID non-null check here. PostgreSQL would enforce that
-- check on any later update to a legacy null row, preventing harmless
-- administrative updates before identity reconciliation. The trigger below
-- requires the relationship for every new registration and whenever ownership
-- fields on an existing registration are changed.
alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_competitive_record_required;

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

  select season_id
  into v_tournament_season_id
  from public.tournaments
  where id = new.tournament_id;

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
before insert or update of competitive_record_id, registration_type, tournament_id
on public.tournament_registrations
for each row execute function public.validate_registration_competitive_record();

comment on column public.tournament_registrations.competitive_record_id is
  'Permanent owner of this registration and all future season credit. Legacy null rows require reviewed identity reconciliation.';

-- Rebuildable AOY projection. Immutable Official Results remain authoritative.

create table public.aoy_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete restrict,
  source_fingerprint text not null,
  calculation_version text not null,
  calculated_by_admin_id uuid not null,
  calculated_at timestamptz not null default now(),
  constraint aoy_runs_fingerprint_not_blank check (
    btrim(source_fingerprint) <> ''
  ),
  constraint aoy_runs_unique_source
    unique (season_id, source_fingerprint, calculation_version)
);

create table public.aoy_tournament_performances (
  id uuid primary key default gen_random_uuid(),
  calculation_run_id uuid not null
    references public.aoy_calculation_runs(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  tournament_id uuid not null
    references public.tournaments(id) on delete restrict,
  regular_season_number smallint not null,
  registration_id uuid not null
    references public.tournament_registrations(id) on delete restrict,
  official_result_entry_id uuid not null
    references public.official_result_entries(id) on delete restrict,
  publication_audit_id uuid not null
    references public.official_results_publication_audit(id) on delete restrict,
  competitive_record_id uuid not null
    references public.teams(id) on delete restrict,
  record_type text not null,
  official_placement integer,
  aoy_placement integer,
  official_weight numeric not null,
  official_penalty numeric not null,
  points integer not null,
  participation_status text not null,
  eligible boolean not null,
  counted boolean not null,
  calculated_at timestamptz not null,
  constraint aoy_performance_number_check
    check (regular_season_number between 1 and 8),
  constraint aoy_performance_record_type_check
    check (record_type in ('team', 'solo')),
  constraint aoy_performance_place_check check (
    (official_placement is null or official_placement > 0)
    and (aoy_placement is null or aoy_placement > 0)
  ),
  constraint aoy_performance_values_check check (
    official_weight >= 0 and official_penalty >= 0 and points >= 0
  ),
  constraint aoy_performance_status_check check (
    participation_status in (
      'participated', 'withdrew_after_start', 'no_show', 'disqualified'
    )
  ),
  constraint aoy_performance_unique_record_tournament
    unique (calculation_run_id, tournament_id, competitive_record_id),
  constraint aoy_performance_unique_official_result
    unique (calculation_run_id, official_result_entry_id)
);

create table public.aoy_season_standings (
  id uuid primary key default gen_random_uuid(),
  calculation_run_id uuid not null
    references public.aoy_calculation_runs(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  rank integer not null,
  competitive_record_id uuid not null
    references public.teams(id) on delete restrict,
  display_name text not null,
  record_type text not null,
  canonical_members jsonb not null,
  total_counted_points integer not null,
  counted_tournament_count smallint not null,
  official_participation_count smallint not null,
  wins integer not null,
  top_tens integer not null,
  total_official_season_weight numeric not null,
  counted_performance_ids jsonb not null,
  dropped_performance_ids jsonb not null,
  tie_status text not null,
  tie_break_details jsonb not null,
  calculated_at timestamptz not null,
  constraint aoy_standings_rank_check check (rank > 0),
  constraint aoy_standings_type_check check (record_type in ('team', 'solo')),
  constraint aoy_standings_nonnegative_check check (
    total_counted_points >= 0 and counted_tournament_count between 0 and 5
    and official_participation_count between 0 and 8
    and wins >= 0 and top_tens >= 0
    and total_official_season_weight >= 0
  ),
  constraint aoy_standings_json_check check (
    jsonb_typeof(canonical_members) = 'array'
    and jsonb_typeof(counted_performance_ids) = 'array'
    and jsonb_array_length(counted_performance_ids) <= 5
    and jsonb_typeof(dropped_performance_ids) = 'array'
    and jsonb_typeof(tie_break_details) = 'object'
  ),
  constraint aoy_standings_tie_check check (
    tie_status in ('resolved', 'unresolved')
  ),
  constraint aoy_standings_unique_record
    unique (calculation_run_id, competitive_record_id)
);

create table public.aoy_current_projections (
  season_id uuid primary key references public.seasons(id) on delete restrict,
  calculation_run_id uuid not null unique
    references public.aoy_calculation_runs(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create index aoy_performances_record_idx
  on public.aoy_tournament_performances (
    season_id, competitive_record_id, regular_season_number
  );
create index aoy_standings_rank_idx
  on public.aoy_season_standings (season_id, rank);

create view public.current_aoy_standings as
select standing.*
from public.aoy_season_standings standing
join public.aoy_current_projections current
  on current.calculation_run_id = standing.calculation_run_id;

create view public.current_aoy_performances as
select performance.*
from public.aoy_tournament_performances performance
join public.aoy_current_projections current
  on current.calculation_run_id = performance.calculation_run_id;

create or replace function public.replace_aoy_projection(
  p_season_id uuid,
  p_source_fingerprint text,
  p_calculation_version text,
  p_performances jsonb,
  p_standings jsonb,
  p_admin_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_run_id uuid;
  v_row jsonb;
begin
  if p_admin_user_id is null
    or nullif(btrim(p_source_fingerprint), '') is null
    or nullif(btrim(p_calculation_version), '') is null
    or jsonb_typeof(p_performances) <> 'array'
    or jsonb_typeof(p_standings) <> 'array' then
    raise exception using errcode = '22023',
      message = 'AITT_AOY_PROJECTION_INPUT_INVALID';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended('aoy-season:' || p_season_id::text, 0)
  );

  select id into v_run_id from public.aoy_calculation_runs
  where season_id = p_season_id
    and source_fingerprint = p_source_fingerprint
    and calculation_version = p_calculation_version;
  if found then
    insert into public.aoy_current_projections (
      season_id, calculation_run_id, updated_at
    ) values (p_season_id, v_run_id, now())
    on conflict (season_id) do update set
      calculation_run_id = excluded.calculation_run_id,
      updated_at = excluded.updated_at;
    return v_run_id;
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_performances) item
    left join public.official_result_entries official
      on official.id = (item ->> 'official_result_entry_id')::uuid
    left join public.tournaments tournament
      on tournament.id = official.tournament_id
    left join public.official_results_publication_audit publication
      on publication.id = (item ->> 'publication_audit_id')::uuid
    left join public.teams record
      on record.id = official.competitive_record_id
    where official.id is null
      or official.tournament_id <> (item ->> 'tournament_id')::uuid
      or official.registration_id <> (item ->> 'registration_id')::uuid
      or official.competitive_record_id <>
        (item ->> 'competitive_record_id')::uuid
      or official.record_type <> item ->> 'record_type'
      or publication.tournament_id <> official.tournament_id
      or publication.season_id <> p_season_id
      or tournament.season_id <> p_season_id
      or tournament.result_status <> 'official'
      or tournament.event_type <> 'regular_season'
      or tournament.regular_season_number not between 1 and 8
      or record.record_type <> official.record_type
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_AOY_OFFICIAL_SOURCE_INVALID';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_performances) item
    where coalesce((item ->> 'counted')::boolean, false)
    group by item ->> 'competitive_record_id'
    having count(*) > 5
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_AOY_BEST_FIVE_INVALID';
  end if;

  insert into public.aoy_calculation_runs (
    season_id, source_fingerprint, calculation_version,
    calculated_by_admin_id
  ) values (
    p_season_id, btrim(p_source_fingerprint),
    btrim(p_calculation_version), p_admin_user_id
  ) returning id into v_run_id;

  for v_row in select value from jsonb_array_elements(p_performances) loop
    insert into public.aoy_tournament_performances (
      calculation_run_id, season_id, tournament_id,
      regular_season_number, registration_id, official_result_entry_id,
      publication_audit_id, competitive_record_id, record_type,
      official_placement, aoy_placement, official_weight,
      official_penalty, points, participation_status, eligible, counted,
      calculated_at
    ) values (
      v_run_id, p_season_id, (v_row ->> 'tournament_id')::uuid,
      (v_row ->> 'regular_season_number')::smallint,
      (v_row ->> 'registration_id')::uuid,
      (v_row ->> 'official_result_entry_id')::uuid,
      (v_row ->> 'publication_audit_id')::uuid,
      (v_row ->> 'competitive_record_id')::uuid,
      v_row ->> 'record_type',
      nullif(v_row ->> 'official_placement', '')::integer,
      nullif(v_row ->> 'aoy_placement', '')::integer,
      (v_row ->> 'official_weight')::numeric,
      (v_row ->> 'official_penalty')::numeric,
      (v_row ->> 'points')::integer,
      v_row ->> 'participation_status',
      (v_row ->> 'eligible')::boolean,
      (v_row ->> 'counted')::boolean,
      (v_row ->> 'calculated_at')::timestamptz
    );
  end loop;

  for v_row in select value from jsonb_array_elements(p_standings) loop
    insert into public.aoy_season_standings (
      calculation_run_id, season_id, rank, competitive_record_id,
      display_name, record_type, canonical_members,
      total_counted_points, counted_tournament_count,
      official_participation_count, wins, top_tens,
      total_official_season_weight, counted_performance_ids,
      dropped_performance_ids, tie_status, tie_break_details,
      calculated_at
    ) values (
      v_run_id, p_season_id, (v_row ->> 'rank')::integer,
      (v_row ->> 'competitive_record_id')::uuid,
      v_row ->> 'display_name', v_row ->> 'record_type',
      v_row -> 'canonical_members',
      (v_row ->> 'total_counted_points')::integer,
      (v_row ->> 'counted_tournament_count')::smallint,
      (v_row ->> 'official_participation_count')::smallint,
      (v_row ->> 'wins')::integer, (v_row ->> 'top_tens')::integer,
      (v_row ->> 'total_official_season_weight')::numeric,
      v_row -> 'counted_performance_ids',
      v_row -> 'dropped_performance_ids',
      v_row ->> 'tie_status', v_row -> 'tie_break_details',
      (v_row ->> 'calculated_at')::timestamptz
    );
  end loop;

  insert into public.aoy_current_projections (
    season_id, calculation_run_id, updated_at
  ) values (p_season_id, v_run_id, now())
  on conflict (season_id) do update set
    calculation_run_id = excluded.calculation_run_id,
    updated_at = excluded.updated_at;
  return v_run_id;
end;
$$;

alter table public.aoy_calculation_runs enable row level security;
alter table public.aoy_tournament_performances enable row level security;
alter table public.aoy_season_standings enable row level security;
alter table public.aoy_current_projections enable row level security;
revoke all on table public.aoy_calculation_runs from public, anon, authenticated;
revoke all on table public.aoy_tournament_performances
  from public, anon, authenticated;
revoke all on table public.aoy_season_standings
  from public, anon, authenticated;
revoke all on table public.aoy_current_projections
  from public, anon, authenticated;
grant select on public.current_aoy_standings to anon, authenticated;
grant select on public.current_aoy_performances to anon, authenticated;
grant select on public.aoy_calculation_runs to service_role;
grant select on public.aoy_tournament_performances to service_role;
grant select on public.aoy_season_standings to service_role;
grant select on public.aoy_current_projections to service_role;
revoke all on function public.replace_aoy_projection(
  uuid, text, text, jsonb, jsonb, uuid
) from public, anon, authenticated;
grant execute on function public.replace_aoy_projection(
  uuid, text, text, jsonb, jsonb, uuid
) to service_role;

-- The name-based compatibility table is no longer an authoritative write path.
revoke insert, update, delete on public.tournament_aoy_points from anon;
drop policy if exists "Temporary anonymous AOY point creates"
  on public.tournament_aoy_points;
drop policy if exists "Temporary anonymous AOY point updates"
  on public.tournament_aoy_points;
drop policy if exists "Temporary anonymous AOY point deletes"
  on public.tournament_aoy_points;

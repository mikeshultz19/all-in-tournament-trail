-- Rebuildable Championship qualification projection, separate from AOY.

create table public.championship_qualification_runs (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete restrict,
  source_fingerprint text not null,
  calculation_version text not null,
  calculated_by_admin_id uuid not null,
  calculated_at timestamptz not null default now(),
  constraint championship_runs_fingerprint_not_blank
    check (btrim(source_fingerprint) <> ''),
  constraint championship_runs_unique_source
    unique (season_id, source_fingerprint, calculation_version)
);

create table public.championship_participation_records (
  id uuid primary key default gen_random_uuid(),
  calculation_run_id uuid not null
    references public.championship_qualification_runs(id) on delete restrict,
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
  participation_status text not null,
  historically_eligible boolean not null,
  counts_toward_qualification boolean not null,
  exclusion_reason text,
  calculated_at timestamptz not null,
  constraint championship_participation_number_check
    check (regular_season_number between 1 and 8),
  constraint championship_participation_type_check
    check (record_type in ('team', 'solo')),
  constraint championship_participation_status_check check (
    participation_status in (
      'participated', 'withdrew_after_start', 'no_show', 'disqualified'
    )
  ),
  constraint championship_participation_reason_check check (
    exclusion_reason is null
    or exclusion_reason in ('ineligible', 'no_show', 'disqualified')
  ),
  constraint championship_participation_consistency_check check (
    (counts_toward_qualification and historically_eligible
      and participation_status in ('participated', 'withdrew_after_start')
      and exclusion_reason is null)
    or
    (not counts_toward_qualification and exclusion_reason is not null)
  ),
  constraint championship_participation_unique_record_event
    unique (calculation_run_id, tournament_id, competitive_record_id),
  constraint championship_participation_unique_official_result
    unique (calculation_run_id, official_result_entry_id)
);

create table public.championship_qualification_records (
  id uuid primary key default gen_random_uuid(),
  calculation_run_id uuid not null
    references public.championship_qualification_runs(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  competitive_record_id uuid not null
    references public.teams(id) on delete restrict,
  display_name text not null,
  record_type text not null,
  canonical_members jsonb not null,
  official_participations smallint not null,
  qualifying_tournament_numbers jsonb not null,
  nonqualifying_official_result_ids jsonb not null,
  remaining_participation_count smallint not null,
  uncredited_regular_season_numbers jsonb not null,
  qualification_status text not null,
  qualified_at timestamptz,
  calculated_at timestamptz not null,
  constraint championship_qualification_type_check
    check (record_type in ('team', 'solo')),
  constraint championship_qualification_counts_check check (
    official_participations between 0 and 8
    and remaining_participation_count between 0 and 5
  ),
  constraint championship_qualification_json_check check (
    jsonb_typeof(canonical_members) = 'array'
    and jsonb_typeof(qualifying_tournament_numbers) = 'array'
    and jsonb_typeof(nonqualifying_official_result_ids) = 'array'
    and jsonb_typeof(uncredited_regular_season_numbers) = 'array'
  ),
  constraint championship_qualification_status_check check (
    (qualification_status = 'qualified'
      and official_participations >= 5 and qualified_at is not null)
    or
    (qualification_status = 'not_qualified'
      and official_participations < 5 and qualified_at is null)
  ),
  constraint championship_qualification_unique_record
    unique (calculation_run_id, competitive_record_id)
);

create table public.championship_current_projections (
  season_id uuid primary key references public.seasons(id) on delete restrict,
  calculation_run_id uuid not null unique
    references public.championship_qualification_runs(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create index championship_participation_record_idx
  on public.championship_participation_records (
    season_id, competitive_record_id, regular_season_number
  );
create index championship_qualification_status_idx
  on public.championship_qualification_records (
    season_id, qualification_status, display_name
  );

create view public.current_championship_qualifications as
select qualification.*
from public.championship_qualification_records qualification
join public.championship_current_projections current
  on current.calculation_run_id = qualification.calculation_run_id;

create view public.current_championship_participations as
select participation.*
from public.championship_participation_records participation
join public.championship_current_projections current
  on current.calculation_run_id = participation.calculation_run_id;

create or replace function public.replace_championship_qualification_projection(
  p_season_id uuid,
  p_source_fingerprint text,
  p_calculation_version text,
  p_participations jsonb,
  p_qualifications jsonb,
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
    or jsonb_typeof(p_participations) <> 'array'
    or jsonb_typeof(p_qualifications) <> 'array' then
    raise exception using errcode = '22023',
      message = 'AITT_CHAMPIONSHIP_PROJECTION_INPUT_INVALID';
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended('championship-season:' || p_season_id::text, 0)
  );

  select id into v_run_id from public.championship_qualification_runs
  where season_id = p_season_id
    and source_fingerprint = p_source_fingerprint
    and calculation_version = p_calculation_version;
  if found then
    insert into public.championship_current_projections (
      season_id, calculation_run_id, updated_at
    ) values (p_season_id, v_run_id, now())
    on conflict (season_id) do update set
      calculation_run_id = excluded.calculation_run_id,
      updated_at = excluded.updated_at;
    return v_run_id;
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_participations) item
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
      or official.participation_status <> item ->> 'participation_status'
      or official.aoy_eligible is distinct from
        (item ->> 'historically_eligible')::boolean
      or publication.tournament_id <> official.tournament_id
      or publication.season_id <> p_season_id
      or tournament.season_id <> p_season_id
      or tournament.result_status <> 'official'
      or tournament.event_type <> 'regular_season'
      or tournament.regular_season_number not between 1 and 8
      or tournament.regular_season_number <>
        (item ->> 'regular_season_number')::smallint
      or tournament.status = 'Cancelled'
      or record.record_type <> official.record_type
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_CHAMPIONSHIP_OFFICIAL_SOURCE_INVALID';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_qualifications) qualification
    where (qualification ->> 'official_participations')::integer <> (
      select count(*)
      from jsonb_array_elements(p_participations) participation
      where participation ->> 'competitive_record_id' =
          qualification ->> 'competitive_record_id'
        and coalesce(
          (participation ->> 'counts_toward_qualification')::boolean,
          false
        )
    )
      or jsonb_array_length(
        qualification -> 'qualifying_tournament_numbers'
      ) <> (qualification ->> 'official_participations')::integer
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_CHAMPIONSHIP_PARTICIPATION_TOTAL_INVALID';
  end if;

  insert into public.championship_qualification_runs (
    season_id, source_fingerprint, calculation_version,
    calculated_by_admin_id
  ) values (
    p_season_id, btrim(p_source_fingerprint),
    btrim(p_calculation_version), p_admin_user_id
  ) returning id into v_run_id;

  for v_row in select value from jsonb_array_elements(p_participations) loop
    insert into public.championship_participation_records (
      calculation_run_id, season_id, tournament_id,
      regular_season_number, registration_id, official_result_entry_id,
      publication_audit_id, competitive_record_id, record_type,
      participation_status, historically_eligible,
      counts_toward_qualification, exclusion_reason, calculated_at
    ) values (
      v_run_id, p_season_id, (v_row ->> 'tournament_id')::uuid,
      (v_row ->> 'regular_season_number')::smallint,
      (v_row ->> 'registration_id')::uuid,
      (v_row ->> 'official_result_entry_id')::uuid,
      (v_row ->> 'publication_audit_id')::uuid,
      (v_row ->> 'competitive_record_id')::uuid,
      v_row ->> 'record_type', v_row ->> 'participation_status',
      (v_row ->> 'historically_eligible')::boolean,
      (v_row ->> 'counts_toward_qualification')::boolean,
      nullif(v_row ->> 'exclusion_reason', ''),
      (v_row ->> 'calculated_at')::timestamptz
    );
  end loop;

  for v_row in select value from jsonb_array_elements(p_qualifications) loop
    insert into public.championship_qualification_records (
      calculation_run_id, season_id, competitive_record_id,
      display_name, record_type, canonical_members,
      official_participations, qualifying_tournament_numbers,
      nonqualifying_official_result_ids, remaining_participation_count,
      uncredited_regular_season_numbers, qualification_status,
      qualified_at, calculated_at
    ) values (
      v_run_id, p_season_id,
      (v_row ->> 'competitive_record_id')::uuid,
      v_row ->> 'display_name', v_row ->> 'record_type',
      v_row -> 'canonical_members',
      (v_row ->> 'official_participations')::smallint,
      v_row -> 'qualifying_tournament_numbers',
      v_row -> 'nonqualifying_official_result_ids',
      (v_row ->> 'remaining_participation_count')::smallint,
      v_row -> 'uncredited_regular_season_numbers',
      v_row ->> 'qualification_status',
      nullif(v_row ->> 'qualified_at', '')::timestamptz,
      (v_row ->> 'calculated_at')::timestamptz
    );
  end loop;

  insert into public.championship_current_projections (
    season_id, calculation_run_id, updated_at
  ) values (p_season_id, v_run_id, now())
  on conflict (season_id) do update set
    calculation_run_id = excluded.calculation_run_id,
    updated_at = excluded.updated_at;
  return v_run_id;
end;
$$;

alter table public.championship_qualification_runs enable row level security;
alter table public.championship_participation_records enable row level security;
alter table public.championship_qualification_records enable row level security;
alter table public.championship_current_projections enable row level security;
revoke all on table public.championship_qualification_runs
  from public, anon, authenticated;
revoke all on table public.championship_participation_records
  from public, anon, authenticated;
revoke all on table public.championship_qualification_records
  from public, anon, authenticated;
revoke all on table public.championship_current_projections
  from public, anon, authenticated;
grant select on public.current_championship_qualifications
  to anon, authenticated;
grant select on public.current_championship_participations
  to anon, authenticated;
grant select on public.championship_qualification_runs to service_role;
grant select on public.championship_participation_records to service_role;
grant select on public.championship_qualification_records to service_role;
grant select on public.championship_current_projections to service_role;
revoke all on function public.replace_championship_qualification_projection(
  uuid, text, text, jsonb, jsonb, uuid
) from public, anon, authenticated;
grant execute on function public.replace_championship_qualification_projection(
  uuid, text, text, jsonb, jsonb, uuid
) to service_role;

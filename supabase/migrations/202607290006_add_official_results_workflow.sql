-- Constitutional Working Results -> immutable Official Results workflow.

alter table public.tournaments
  add column if not exists result_status text not null default 'pending',
  add column if not exists official_results_published_at timestamptz,
  add column if not exists official_results_published_by uuid;

alter table public.tournaments
  drop constraint if exists tournaments_result_status_check,
  add constraint tournaments_result_status_check check (
    result_status in (
      'pending', 'imported', 'under_review',
      'ready_to_publish', 'official'
    )
  );

update public.tournaments
set result_status = case
  when status = 'Results Published' then 'official'
  when weighfish_imported then 'imported'
  else 'pending'
end
where result_status = 'pending';

alter table public.registration_identity_reviews
  drop constraint if exists registration_identity_reviews_registration_id_fkey,
  add constraint registration_identity_reviews_registration_id_fkey
    foreign key (registration_id)
    references public.tournament_registrations(id)
    on delete cascade;
alter table public.registration_identity_review_history
  drop constraint if exists registration_identity_review_history_review_id_fkey,
  add constraint registration_identity_review_history_review_id_fkey
    foreign key (review_id)
    references public.registration_identity_reviews(id)
    on delete cascade;
alter table public.imported_competitive_identities
  drop constraint if exists imported_competitive_identities_registration_id_fkey,
  add constraint imported_competitive_identities_registration_id_fkey
    foreign key (registration_id)
    references public.tournament_registrations(id)
    on delete set null;

alter table public.tournament_result_entries
  add column if not exists penalty_weight numeric not null default 0,
  add column if not exists original_import_data jsonb not null default '{}'::jsonb;

alter table public.tournament_result_entries
  add constraint tournament_result_entries_penalty_nonnegative_check
    check (penalty_weight >= 0),
  add constraint tournament_result_entries_original_import_object_check
    check (jsonb_typeof(original_import_data) = 'object');

create table if not exists public.working_result_audit (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null
    references public.tournaments(id) on delete restrict,
  result_entry_id uuid,
  action text not null,
  previous_value jsonb,
  new_value jsonb,
  reason text not null,
  admin_user_id uuid not null,
  created_at timestamptz not null default now(),
  constraint working_result_audit_action_check check (
    action in ('import', 'replace_import', 'correction', 'identity_resolution')
  ),
  constraint working_result_audit_reason_check check (btrim(reason) <> '')
);

create index if not exists working_result_audit_tournament_idx
  on public.working_result_audit (tournament_id, created_at);

create table if not exists public.official_result_entries (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null
    references public.tournaments(id) on delete restrict,
  working_result_entry_id uuid,
  place integer not null,
  team_name text not null,
  fish_count integer not null,
  total_weight numeric not null,
  penalty_weight numeric not null default 0,
  big_fish_weight numeric,
  competitive_record_id uuid not null
    references public.teams(id) on delete restrict,
  imported_competitive_identity_id uuid
    references public.imported_competitive_identities(id) on delete restrict,
  base_payout numeric not null default 0,
  bronze_payout numeric not null default 0,
  silver_payout numeric not null default 0,
  gold_payout numeric not null default 0,
  big_bass_place integer,
  big_bass_payout numeric not null default 0,
  insurance_payout numeric not null default 0,
  prize_description text,
  original_import_data jsonb not null,
  published_at timestamptz not null,
  published_by_admin_id uuid not null,
  created_at timestamptz not null default now(),
  constraint official_result_entries_place_check check (place > 0),
  constraint official_result_entries_weights_check check (
    total_weight >= 0 and penalty_weight >= 0
    and (big_fish_weight is null or big_fish_weight >= 0)
  ),
  constraint official_result_entries_import_object_check
    check (jsonb_typeof(original_import_data) = 'object'),
  constraint official_result_entries_unique_working
    unique (tournament_id, working_result_entry_id)
);

create index if not exists official_result_entries_tournament_idx
  on public.official_result_entries (tournament_id, place);
create index if not exists official_result_entries_record_idx
  on public.official_result_entries (competitive_record_id);

create table if not exists public.official_results_publication_audit (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique
    references public.tournaments(id) on delete restrict,
  season_id uuid not null references public.seasons(id) on delete restrict,
  regular_season_number smallint,
  published_at timestamptz not null,
  published_by_admin_id uuid not null,
  entry_count integer not null,
  official_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  constraint official_results_publication_snapshot_array
    check (jsonb_typeof(official_snapshot) = 'array')
);

create table if not exists public.official_result_corrections (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null
    references public.tournaments(id) on delete restrict,
  official_result_entry_id uuid not null
    references public.official_result_entries(id) on delete restrict,
  previous_value jsonb not null,
  new_value jsonb not null,
  reason text not null,
  admin_user_id uuid not null,
  corrected_at timestamptz not null default now(),
  constraint official_result_corrections_reason_check
    check (btrim(reason) <> '')
);

create index if not exists official_result_corrections_tournament_idx
  on public.official_result_corrections (tournament_id, corrected_at);

create or replace function public.prevent_official_result_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'tournament_results'
    and not exists (
      select 1 from public.tournaments
      where id = coalesce(new.tournament_id, old.tournament_id)
        and result_status = 'official'
    ) then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  if current_setting('aitt.official_correction', true) <> 'on' then
    raise exception using errcode = '55000',
      message = 'AITT_OFFICIAL_RESULTS_IMMUTABLE';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger official_result_entries_prevent_update
before update or delete on public.official_result_entries
for each row execute function public.prevent_official_result_mutation();

create trigger tournament_results_prevent_update
before update or delete on public.tournament_results
for each row execute function public.prevent_official_result_mutation();

create or replace function public.prevent_official_working_changes()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from public.tournaments
    where id = coalesce(new.tournament_id, old.tournament_id)
      and result_status = 'official'
  ) then
    raise exception using errcode = '55000',
      message = 'AITT_OFFICIAL_RESULTS_IMMUTABLE';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger working_results_prevent_official_changes
before insert or update or delete on public.tournament_result_entries
for each row execute function public.prevent_official_working_changes();

create or replace function public.rebuild_public_results_snapshot(
  p_tournament_id uuid
)
returns public.tournament_results
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.tournament_results;
  v_entries jsonb;
  v_big_bass public.official_result_entries;
  v_tournament public.tournaments;
begin
  select * into v_tournament from public.tournaments
  where id = p_tournament_id;

  select coalesce(jsonb_agg(entry order by sort_group, sort_place), '[]'::jsonb)
  into v_entries
  from (
    select 0 as sort_group, official.place as sort_place,
      jsonb_build_object(
        'kind', 'final', 'place', official.place,
        'team', official.team_name,
        'weight', official.total_weight,
        'baseWinnings', official.base_payout
      ) as entry
    from public.official_result_entries official
    where official.tournament_id = p_tournament_id
    union all
    select side.sort_group, side.side_place,
      jsonb_build_object(
        'kind', 'sidePot', 'place', side.side_place,
        'team', side.team_name, 'weight', side.total_weight,
        'sidePot', side.side_pot,
        'sidePotPlacement', side.side_place,
        'sidePotWeight', side.total_weight,
        'sidePotPayout', side.side_payout
      )
    from (
      select 1 as sort_group, 'bronze'::text as side_pot,
        row_number() over (order by place)::integer as side_place,
        team_name, total_weight, bronze_payout as side_payout
      from public.official_result_entries
      where tournament_id = p_tournament_id and bronze_payout > 0
      union all
      select 2, 'silver',
        row_number() over (order by place)::integer,
        team_name, total_weight, silver_payout
      from public.official_result_entries
      where tournament_id = p_tournament_id and silver_payout > 0
      union all
      select 3, 'gold',
        row_number() over (order by place)::integer,
        team_name, total_weight, gold_payout
      from public.official_result_entries
      where tournament_id = p_tournament_id and gold_payout > 0
    ) side
  ) public_entries;

  select * into v_big_bass
  from public.official_result_entries
  where tournament_id = p_tournament_id
  order by big_fish_weight desc nulls last limit 1;

  perform set_config('aitt.official_correction', 'on', true);
  insert into public.tournament_results (
    tournament_id, entries, total_payout, bronze_payout, silver_payout,
    gold_payout, insurance_pot_payout, big_bass_payout,
    big_bass_angler, big_bass_team, big_bass_weight,
    champion_image_url, big_bass_image_url, published_at
  )
  select p_tournament_id, v_entries,
    coalesce(sum(base_payout), 0), coalesce(sum(bronze_payout), 0),
    coalesce(sum(silver_payout), 0), coalesce(sum(gold_payout), 0),
    coalesce(v_tournament.insurance_payout, 0),
    coalesce(sum(big_bass_payout), 0),
    v_big_bass.team_name, v_big_bass.team_name, v_big_bass.big_fish_weight,
    v_tournament.champion_photo_url, v_tournament.big_bass_photo_url,
    coalesce(v_tournament.official_results_published_at, now())
  from public.official_result_entries
  where tournament_id = p_tournament_id
  on conflict (tournament_id) do update set
    entries = excluded.entries, total_payout = excluded.total_payout,
    bronze_payout = excluded.bronze_payout,
    silver_payout = excluded.silver_payout,
    gold_payout = excluded.gold_payout,
    insurance_pot_payout = excluded.insurance_pot_payout,
    big_bass_payout = excluded.big_bass_payout,
    big_bass_angler = excluded.big_bass_angler,
    big_bass_team = excluded.big_bass_team,
    big_bass_weight = excluded.big_bass_weight,
    champion_image_url = excluded.champion_image_url,
    big_bass_image_url = excluded.big_bass_image_url,
    updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.import_working_results(
  p_tournament_id uuid,
  p_entries jsonb,
  p_admin_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous jsonb;
  v_entry jsonb;
  v_count integer := 0;
begin
  if p_admin_user_id is null or jsonb_typeof(p_entries) <> 'array'
    or jsonb_array_length(p_entries) = 0 then
    raise exception using errcode = '22023',
      message = 'AITT_WORKING_RESULTS_INPUT_INVALID';
  end if;
  if not exists (
    select 1 from public.tournaments
    where id = p_tournament_id and result_status <> 'official'
  ) then
    raise exception using errcode = '55000',
      message = 'AITT_OFFICIAL_RESULTS_IMMUTABLE';
  end if;

  select coalesce(jsonb_agg(to_jsonb(entry)), '[]'::jsonb)
  into v_previous from public.tournament_result_entries entry
  where tournament_id = p_tournament_id;

  delete from public.tournament_result_entries
  where tournament_id = p_tournament_id;

  for v_entry in select value from jsonb_array_elements(p_entries) loop
    insert into public.tournament_result_entries (
      tournament_id, place, team_name, fish_count, total_weight,
      penalty_weight, big_fish_weight, base_payout, bronze_payout,
      silver_payout, gold_payout, big_bass_place, big_bass_payout,
      insurance_payout, prize_description, raw_payout_breakdown,
      original_import_data, is_demo
    ) values (
      p_tournament_id, (v_entry ->> 'place')::integer,
      btrim(v_entry ->> 'entryName'),
      coalesce((v_entry ->> 'fishCount')::integer, 0),
      coalesce((v_entry ->> 'totalWeight')::numeric, 0), 0,
      nullif(v_entry ->> 'bigFishWeight', '')::numeric,
      coalesce((v_entry ->> 'basePayout')::numeric, 0),
      coalesce((v_entry ->> 'bronzePayout')::numeric, 0),
      coalesce((v_entry ->> 'silverPayout')::numeric, 0),
      coalesce((v_entry ->> 'goldPayout')::numeric, 0),
      nullif(v_entry ->> 'bigBassPlace', '')::integer,
      coalesce((v_entry ->> 'bigBassPayout')::numeric, 0), 0,
      nullif(v_entry ->> 'prizeDescription', ''),
      nullif(v_entry ->> 'payoutBreakdown', ''),
      v_entry, false
    );
    v_count := v_count + 1;
  end loop;

  insert into public.working_result_audit (
    tournament_id, action, previous_value, new_value, reason, admin_user_id
  ) values (
    p_tournament_id,
    case when jsonb_array_length(v_previous) = 0
      then 'import' else 'replace_import' end,
    v_previous, p_entries, 'WeighFish CSV import', p_admin_user_id
  );

  update public.tournaments set result_status = 'imported',
    weighfish_imported = true, weighfish_imported_at = now()
  where id = p_tournament_id;
  return v_count;
end;
$$;

create or replace function public.publish_official_results(
  p_tournament_id uuid,
  p_admin_user_id uuid
)
returns public.tournaments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_count integer;
  v_snapshot jsonb;
begin
  select * into v_tournament from public.tournaments
  where id = p_tournament_id for update;
  if not found or v_tournament.season_id is null then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_INVALID_SEASON';
  end if;
  if v_tournament.result_status = 'official' then
    raise exception using errcode = '55000',
      message = 'AITT_OFFICIAL_RESULTS_IMMUTABLE';
  end if;
  if v_tournament.event_type = 'regular_season'
    and v_tournament.regular_season_number not between 1 and 8 then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_INVALID_TOURNAMENT_NUMBER';
  end if;
  if v_tournament.event_type = 'championship'
    and v_tournament.regular_season_number is not null then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_INVALID_TOURNAMENT_NUMBER';
  end if;
  if exists (
    select 1 from public.tournament_registrations
    where tournament_id = p_tournament_id
      and identity_review_status = 'review_required'
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_IDENTITY_REVIEW_REQUIRED';
  end if;
  if not exists (
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id
  ) or exists (
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id
      and (place <= 0 or total_weight < 0
        or competitive_record_id is null)
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_VALIDATION_FAILED';
  end if;
  if exists (
    select 1
    from public.tournament_result_entries working
    left join public.teams record
      on record.id = working.competitive_record_id
    left join public.imported_competitive_identities imported
      on imported.id = working.imported_competitive_identity_id
    where working.tournament_id = p_tournament_id
      and (
        record.id is null
        or record.season_id <> v_tournament.season_id
        or (
          imported.id is not null
          and (
            imported.competitive_record_id <> record.id
            or imported.reconciliation_status <> 'confirmed'
          )
        )
      )
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_IDENTITY_REVIEW_REQUIRED';
  end if;

  insert into public.official_result_entries (
    tournament_id, working_result_entry_id, place, team_name, fish_count,
    total_weight, penalty_weight, big_fish_weight, competitive_record_id,
    imported_competitive_identity_id, base_payout, bronze_payout,
    silver_payout, gold_payout, big_bass_place, big_bass_payout,
    insurance_payout, prize_description, original_import_data,
    published_at, published_by_admin_id
  )
  select tournament_id, id, place, team_name, fish_count, total_weight,
    penalty_weight, big_fish_weight, competitive_record_id,
    imported_competitive_identity_id, base_payout, bronze_payout,
    silver_payout, gold_payout, big_bass_place, big_bass_payout,
    insurance_payout, prize_description, original_import_data,
    now(), p_admin_user_id
  from public.tournament_result_entries
  where tournament_id = p_tournament_id;
  get diagnostics v_count = row_count;

  update public.tournaments set result_status = 'official',
    status = 'Results Published', official_results_published_at = now(),
    official_results_published_by = p_admin_user_id
  where id = p_tournament_id returning * into v_tournament;

  perform public.rebuild_public_results_snapshot(p_tournament_id);
  select jsonb_agg(to_jsonb(entry) order by place)
  into v_snapshot from public.official_result_entries entry
  where tournament_id = p_tournament_id;

  insert into public.official_results_publication_audit (
    tournament_id, season_id, regular_season_number, published_at,
    published_by_admin_id, entry_count, official_snapshot
  ) values (
    p_tournament_id, v_tournament.season_id,
    v_tournament.regular_season_number,
    v_tournament.official_results_published_at,
    p_admin_user_id, v_count, v_snapshot
  );
  return v_tournament;
end;
$$;

create or replace function public.correct_working_result(
  p_result_entry_id uuid,
  p_changes jsonb,
  p_reason text,
  p_admin_user_id uuid
)
returns public.tournament_result_entries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous public.tournament_result_entries;
  v_corrected public.tournament_result_entries;
begin
  if p_admin_user_id is null or nullif(btrim(p_reason), '') is null
    or jsonb_typeof(p_changes) <> 'object' then
    raise exception using errcode = '22023',
      message = 'AITT_WORKING_CORRECTION_INPUT_INVALID';
  end if;
  if p_changes - array[
    'place', 'teamName', 'fishCount', 'totalWeight', 'penaltyWeight',
    'bigFishWeight', 'competitiveRecordId', 'importedIdentityId'
  ] <> '{}'::jsonb then
    raise exception using errcode = '22023',
      message = 'AITT_WORKING_CORRECTION_FIELD_INVALID';
  end if;

  select * into v_previous from public.tournament_result_entries
  where id = p_result_entry_id for update;
  if not found then
    raise exception using errcode = '23503',
      message = 'AITT_WORKING_RESULT_NOT_FOUND';
  end if;

  update public.tournament_result_entries set
    place = coalesce((p_changes ->> 'place')::integer, place),
    team_name = coalesce(nullif(btrim(p_changes ->> 'teamName'), ''), team_name),
    fish_count = coalesce((p_changes ->> 'fishCount')::integer, fish_count),
    total_weight = coalesce((p_changes ->> 'totalWeight')::numeric, total_weight),
    penalty_weight = coalesce((p_changes ->> 'penaltyWeight')::numeric, penalty_weight),
    big_fish_weight = case when p_changes ? 'bigFishWeight'
      then nullif(p_changes ->> 'bigFishWeight', '')::numeric
      else big_fish_weight end,
    competitive_record_id = case when p_changes ? 'competitiveRecordId'
      then nullif(p_changes ->> 'competitiveRecordId', '')::uuid
      else competitive_record_id end,
    imported_competitive_identity_id =
      case when p_changes ? 'importedIdentityId'
        then nullif(p_changes ->> 'importedIdentityId', '')::uuid
        else imported_competitive_identity_id end,
    updated_at = now()
  where id = p_result_entry_id returning * into v_corrected;

  insert into public.working_result_audit (
    tournament_id, result_entry_id, action, previous_value, new_value,
    reason, admin_user_id
  ) values (
    v_corrected.tournament_id, v_corrected.id,
    case when p_changes ? 'competitiveRecordId'
      or p_changes ? 'importedIdentityId'
      then 'identity_resolution' else 'correction' end,
    to_jsonb(v_previous), to_jsonb(v_corrected),
    btrim(p_reason), p_admin_user_id
  );
  update public.tournaments set result_status = 'under_review'
  where id = v_corrected.tournament_id;
  return v_corrected;
end;
$$;

create or replace function public.correct_official_result(
  p_official_result_entry_id uuid,
  p_changes jsonb,
  p_reason text,
  p_admin_user_id uuid
)
returns public.official_result_entries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous public.official_result_entries;
  v_corrected public.official_result_entries;
begin
  if p_admin_user_id is null or nullif(btrim(p_reason), '') is null
    or jsonb_typeof(p_changes) <> 'object' then
    raise exception using errcode = '22023',
      message = 'AITT_OFFICIAL_CORRECTION_INPUT_INVALID';
  end if;
  if p_changes - array[
    'place', 'teamName', 'fishCount', 'totalWeight', 'penaltyWeight',
    'bigFishWeight', 'competitiveRecordId'
  ] <> '{}'::jsonb then
    raise exception using errcode = '22023',
      message = 'AITT_OFFICIAL_CORRECTION_FIELD_INVALID';
  end if;

  select * into v_previous from public.official_result_entries
  where id = p_official_result_entry_id for update;
  if not found then
    raise exception using errcode = '23503',
      message = 'AITT_OFFICIAL_RESULT_NOT_FOUND';
  end if;

  perform set_config('aitt.official_correction', 'on', true);
  update public.official_result_entries set
    place = coalesce((p_changes ->> 'place')::integer, place),
    team_name = coalesce(nullif(btrim(p_changes ->> 'teamName'), ''), team_name),
    fish_count = coalesce((p_changes ->> 'fishCount')::integer, fish_count),
    total_weight = coalesce((p_changes ->> 'totalWeight')::numeric, total_weight),
    penalty_weight = coalesce((p_changes ->> 'penaltyWeight')::numeric, penalty_weight),
    big_fish_weight = case when p_changes ? 'bigFishWeight'
      then nullif(p_changes ->> 'bigFishWeight', '')::numeric
      else big_fish_weight end,
    competitive_record_id = coalesce(
      (p_changes ->> 'competitiveRecordId')::uuid,
      competitive_record_id
    )
  where id = p_official_result_entry_id returning * into v_corrected;

  insert into public.official_result_corrections (
    tournament_id, official_result_entry_id, previous_value, new_value,
    reason, admin_user_id
  ) values (
    v_corrected.tournament_id, v_corrected.id, to_jsonb(v_previous),
    to_jsonb(v_corrected), btrim(p_reason), p_admin_user_id
  );
  perform public.rebuild_public_results_snapshot(v_corrected.tournament_id);
  return v_corrected;
end;
$$;

alter table public.working_result_audit enable row level security;
alter table public.official_result_entries enable row level security;
alter table public.official_results_publication_audit enable row level security;
alter table public.official_result_corrections enable row level security;
revoke all on table public.working_result_audit from public, anon, authenticated;
revoke all on table public.official_result_entries from public, anon, authenticated;
revoke all on table public.official_results_publication_audit from public, anon, authenticated;
revoke all on table public.official_result_corrections from public, anon, authenticated;
grant select on table public.working_result_audit to service_role;
grant select on table public.official_result_entries to service_role;
grant select on table public.official_results_publication_audit to service_role;
grant select on table public.official_result_corrections to service_role;

revoke all on function public.rebuild_public_results_snapshot(uuid)
  from public, anon, authenticated;
grant execute on function public.rebuild_public_results_snapshot(uuid)
  to service_role;

revoke insert, update, delete on table public.tournament_results from anon;
drop policy if exists "Temporary anonymous tournament results creates"
  on public.tournament_results;
drop policy if exists "Temporary anonymous tournament results updates"
  on public.tournament_results;
drop policy if exists "Temporary anonymous tournament results deletes"
  on public.tournament_results;

revoke all on function public.import_working_results(uuid,jsonb,uuid)
  from public, anon, authenticated;
grant execute on function public.import_working_results(uuid,jsonb,uuid)
  to service_role;
revoke all on function public.publish_official_results(uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.publish_official_results(uuid,uuid)
  to service_role;
revoke all on function public.correct_working_result(uuid,jsonb,text,uuid)
  from public, anon, authenticated;
grant execute on function public.correct_working_result(uuid,jsonb,text,uuid)
  to service_role;
revoke all on function public.correct_official_result(uuid,jsonb,text,uuid)
  from public, anon, authenticated;
grant execute on function public.correct_official_result(uuid,jsonb,text,uuid)
  to service_role;

-- Immutable historical facts required by downstream competition engines.

alter table public.tournament_result_entries
  alter column place drop not null,
  add column if not exists source_placement text not null default '',
  add column if not exists registration_id uuid
    references public.tournament_registrations(id) on delete restrict,
  add column if not exists record_type text,
  add column if not exists participation_status text not null
    default 'participated',
  add column if not exists aoy_eligible boolean,
  add column if not exists aoy_eligibility_snapshot jsonb,
  add column if not exists eligibility_reviewed_at timestamptz,
  add column if not exists eligibility_reviewed_by_admin_id uuid;

alter table public.official_result_entries
  alter column place drop not null,
  add column if not exists source_placement text not null default '',
  add column if not exists registration_id uuid
    references public.tournament_registrations(id) on delete restrict,
  add column if not exists record_type text,
  add column if not exists participation_status text,
  add column if not exists aoy_eligible boolean,
  add column if not exists aoy_eligibility_snapshot jsonb,
  add column if not exists eligibility_reviewed_at timestamptz,
  add column if not exists eligibility_reviewed_by_admin_id uuid;

alter table public.tournament_result_entries
  add constraint tournament_result_entries_record_type_check
    check (record_type is null or record_type in ('team', 'solo')),
  add constraint tournament_result_entries_participation_status_check
    check (participation_status in (
      'participated', 'withdrew_after_start', 'no_show', 'disqualified'
    )),
  add constraint tournament_result_entries_place_semantics_check
    check (place is null or place > 0),
  add constraint tournament_result_entries_eligibility_snapshot_check
    check (
      aoy_eligibility_snapshot is null
      or jsonb_typeof(aoy_eligibility_snapshot) = 'object'
    );

alter table public.official_result_entries
  add constraint official_result_entries_record_type_check
    check (record_type in ('team', 'solo')),
  add constraint official_result_entries_participation_status_check
    check (participation_status in (
      'participated', 'withdrew_after_start', 'no_show', 'disqualified'
    )),
  add constraint official_result_entries_place_semantics_check
    check (place is null or place > 0),
  add constraint official_result_entries_eligibility_snapshot_check
    check (jsonb_typeof(aoy_eligibility_snapshot) = 'object'),
  add constraint official_result_entries_unique_registration
    unique (tournament_id, registration_id);

create index if not exists working_results_registration_idx
  on public.tournament_result_entries (registration_id);
create index if not exists official_results_registration_idx
  on public.official_result_entries (registration_id);

create or replace function public.validate_result_historical_ownership()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_record public.teams;
begin
  if new.registration_id is null then
    return new;
  end if;

  select * into v_registration from public.tournament_registrations
  where id = new.registration_id;
  select * into v_record from public.teams
  where id = new.competitive_record_id;

  if v_registration.id is null
    or v_registration.tournament_id <> new.tournament_id
    or v_registration.competitive_record_id <> new.competitive_record_id
    or v_registration.registration_type <> new.record_type
    or v_record.id is null
    or v_record.record_type <> new.record_type then
    raise exception using errcode = '23514',
      message = 'AITT_RESULT_HISTORICAL_OWNERSHIP_INVALID';
  end if;
  return new;
end;
$$;

create trigger working_result_validate_historical_ownership
before insert or update of registration_id, competitive_record_id, record_type
on public.tournament_result_entries
for each row execute function public.validate_result_historical_ownership();

create trigger official_result_validate_historical_ownership
before insert or update of registration_id, competitive_record_id, record_type
on public.official_result_entries
for each row execute function public.validate_result_historical_ownership();

create or replace function public.review_working_result_history(
  p_result_entry_id uuid,
  p_registration_id uuid,
  p_participation_status text,
  p_aoy_eligible boolean,
  p_eligibility_reason text,
  p_admin_user_id uuid
)
returns public.tournament_result_entries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous public.tournament_result_entries;
  v_registration public.tournament_registrations;
  v_result public.tournament_result_entries;
  v_snapshot jsonb;
begin
  if p_participation_status not in (
    'participated', 'withdrew_after_start', 'no_show', 'disqualified'
  ) or p_aoy_eligible is null
    or nullif(btrim(p_eligibility_reason), '') is null
    or p_admin_user_id is null then
    raise exception using errcode = '22023',
      message = 'AITT_RESULT_HISTORY_REVIEW_INPUT_INVALID';
  end if;

  select * into v_previous from public.tournament_result_entries
  where id = p_result_entry_id for update;
  select * into v_registration from public.tournament_registrations
  where id = p_registration_id;

  if v_previous.id is null or v_registration.id is null
    or v_registration.tournament_id <> v_previous.tournament_id
    or v_registration.competitive_record_id is null then
    raise exception using errcode = '23514',
      message = 'AITT_RESULT_HISTORICAL_OWNERSHIP_INVALID';
  end if;

  v_snapshot := jsonb_build_object(
    'eligible', p_aoy_eligible,
    'reason', btrim(p_eligibility_reason),
    'registrationId', v_registration.id,
    'competitiveRecordId', v_registration.competitive_record_id,
    'recordType', v_registration.registration_type,
    'membershipSnapshot', v_registration.membership_snapshot,
    'reviewedAt', now(),
    'reviewedByAdminId', p_admin_user_id
  );

  update public.tournament_result_entries set
    registration_id = v_registration.id,
    competitive_record_id = v_registration.competitive_record_id,
    record_type = v_registration.registration_type,
    participation_status = p_participation_status,
    aoy_eligible = p_aoy_eligible,
    aoy_eligibility_snapshot = v_snapshot,
    eligibility_reviewed_at = now(),
    eligibility_reviewed_by_admin_id = p_admin_user_id,
    updated_at = now()
  where id = p_result_entry_id returning * into v_result;

  insert into public.working_result_audit (
    tournament_id, result_entry_id, action, previous_value, new_value,
    reason, admin_user_id
  ) values (
    v_result.tournament_id, v_result.id, 'identity_resolution',
    to_jsonb(v_previous), to_jsonb(v_result),
    'Historical ownership and eligibility review: ' ||
      btrim(p_eligibility_reason), p_admin_user_id
  );
  update public.tournaments set result_status = 'under_review'
  where id = v_result.tournament_id;
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
  v_status text;
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
    v_status := v_entry ->> 'participationStatus';
    if v_status not in (
      'participated', 'withdrew_after_start', 'no_show', 'disqualified'
    ) then
      raise exception using errcode = '22023',
        message = 'AITT_RESULT_PARTICIPATION_STATUS_INVALID';
    end if;
    insert into public.tournament_result_entries (
      tournament_id, place, source_placement, participation_status,
      team_name, fish_count, total_weight, penalty_weight, big_fish_weight,
      base_payout, bronze_payout, silver_payout, gold_payout,
      big_bass_place, big_bass_payout, insurance_payout,
      prize_description, raw_payout_breakdown, original_import_data, is_demo
    ) values (
      p_tournament_id, nullif(v_entry ->> 'place', '')::integer,
      coalesce(v_entry ->> 'sourcePlacement', ''),
      v_status, btrim(v_entry ->> 'entryName'),
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

alter function public.publish_official_results(uuid, uuid)
  rename to publish_official_results_without_history;

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
begin
  if not exists (
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id
  ) or exists (
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id and (
      registration_id is null or competitive_record_id is null
      or record_type is null or aoy_eligible is null
      or aoy_eligibility_snapshot is null
      or eligibility_reviewed_at is null
      or eligibility_reviewed_by_admin_id is null
    )
  ) then
    raise exception using errcode = '23514',
      message = 'AITT_OFFICIAL_RESULTS_HISTORICAL_REVIEW_REQUIRED';
  end if;

  select * into v_tournament
  from public.publish_official_results_without_history(
    p_tournament_id, p_admin_user_id
  );

  perform set_config('aitt.official_correction', 'on', true);
  update public.official_result_entries official set
    source_placement = working.source_placement,
    registration_id = working.registration_id,
    record_type = working.record_type,
    participation_status = working.participation_status,
    aoy_eligible = working.aoy_eligible,
    aoy_eligibility_snapshot = working.aoy_eligibility_snapshot,
    eligibility_reviewed_at = working.eligibility_reviewed_at,
    eligibility_reviewed_by_admin_id =
      working.eligibility_reviewed_by_admin_id
  from public.tournament_result_entries working
  where official.working_result_entry_id = working.id;

  update public.official_results_publication_audit audit set
    official_snapshot = (
      select jsonb_agg(to_jsonb(entry) order by place nulls last)
      from public.official_result_entries entry
      where entry.tournament_id = p_tournament_id
    )
  where audit.tournament_id = p_tournament_id;
  return v_tournament;
end;
$$;

create or replace function public.correct_official_result_history(
  p_official_result_entry_id uuid,
  p_registration_id uuid,
  p_participation_status text,
  p_aoy_eligible boolean,
  p_eligibility_reason text,
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
  v_registration public.tournament_registrations;
  v_result public.official_result_entries;
  v_snapshot jsonb;
begin
  if p_participation_status not in (
    'participated', 'withdrew_after_start', 'no_show', 'disqualified'
  ) or p_aoy_eligible is null
    or nullif(btrim(p_eligibility_reason), '') is null
    or nullif(btrim(p_reason), '') is null
    or p_admin_user_id is null then
    raise exception using errcode = '22023',
      message = 'AITT_OFFICIAL_HISTORY_CORRECTION_INPUT_INVALID';
  end if;

  select * into v_previous from public.official_result_entries
  where id = p_official_result_entry_id for update;
  select * into v_registration from public.tournament_registrations
  where id = p_registration_id;
  if v_previous.id is null or v_registration.id is null
    or v_registration.tournament_id <> v_previous.tournament_id
    or v_registration.competitive_record_id is null then
    raise exception using errcode = '23514',
      message = 'AITT_RESULT_HISTORICAL_OWNERSHIP_INVALID';
  end if;

  v_snapshot := jsonb_build_object(
    'eligible', p_aoy_eligible,
    'reason', btrim(p_eligibility_reason),
    'registrationId', v_registration.id,
    'competitiveRecordId', v_registration.competitive_record_id,
    'recordType', v_registration.registration_type,
    'membershipSnapshot', v_registration.membership_snapshot,
    'reviewedAt', now(),
    'reviewedByAdminId', p_admin_user_id
  );

  perform set_config('aitt.official_correction', 'on', true);
  update public.official_result_entries set
    registration_id = v_registration.id,
    competitive_record_id = v_registration.competitive_record_id,
    record_type = v_registration.registration_type,
    participation_status = p_participation_status,
    aoy_eligible = p_aoy_eligible,
    aoy_eligibility_snapshot = v_snapshot,
    eligibility_reviewed_at = now(),
    eligibility_reviewed_by_admin_id = p_admin_user_id
  where id = p_official_result_entry_id returning * into v_result;

  insert into public.official_result_corrections (
    tournament_id, official_result_entry_id, previous_value, new_value,
    reason, admin_user_id
  ) values (
    v_result.tournament_id, v_result.id, to_jsonb(v_previous),
    to_jsonb(v_result), btrim(p_reason), p_admin_user_id
  );
  perform public.rebuild_public_results_snapshot(v_result.tournament_id);
  return v_result;
end;
$$;

revoke all on function public.publish_official_results_without_history(
  uuid, uuid
) from public, anon, authenticated;
revoke all on function public.publish_official_results_without_history(
  uuid, uuid
) from service_role;
revoke all on function public.review_working_result_history(
  uuid, uuid, text, boolean, text, uuid
) from public, anon, authenticated;
grant execute on function public.review_working_result_history(
  uuid, uuid, text, boolean, text, uuid
) to service_role;
revoke all on function public.correct_official_result_history(
  uuid, uuid, text, boolean, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.correct_official_result_history(
  uuid, uuid, text, boolean, text, text, uuid
) to service_role;
revoke all on function public.publish_official_results(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.publish_official_results(uuid, uuid)
  to service_role;

comment on column public.official_result_entries.original_import_data is
  'Immutable raw source row retained separately from corrected official fields.';
comment on column public.official_result_entries.aoy_eligibility_snapshot is
  'Reviewed historical eligibility decision and registration membership evidence at publication.';

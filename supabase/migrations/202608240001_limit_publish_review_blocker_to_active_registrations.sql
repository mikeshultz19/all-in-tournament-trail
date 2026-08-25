create or replace function public.publish_official_results_without_history(
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
      and registration_status = 'active'
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
  where entry.tournament_id = p_tournament_id;

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

revoke all on function public.publish_official_results_without_history(
  uuid, uuid
) from public, anon, authenticated, service_role;

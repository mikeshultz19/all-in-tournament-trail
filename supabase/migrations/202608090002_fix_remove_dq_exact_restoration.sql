-- Restore the exact pre-DQ eligibility state, including SQL NULL values.

create or replace function public.set_working_result_disqualification(
  p_tournament_id uuid,
  p_result_entry_id uuid,
  p_disqualified boolean,
  p_admin_user_id uuid
)
returns public.tournament_result_entries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_previous public.tournament_result_entries;
  v_result public.tournament_result_entries;
  v_restore jsonb;
begin
  if p_admin_user_id is null or p_disqualified is null then
    raise exception using errcode = '22023', message = 'AITT_DQ_INPUT_INVALID';
  end if;

  select * into v_tournament from public.tournaments
  where id = p_tournament_id for update;
  select * into v_previous from public.tournament_result_entries
  where id = p_result_entry_id and tournament_id = p_tournament_id for update;

  if v_tournament.id is null or v_previous.id is null then
    raise exception using errcode = '23503', message = 'AITT_DQ_RESULT_NOT_FOUND';
  end if;
  if v_tournament.results_verified_at is null
    or v_tournament.result_status = 'official'
    or v_tournament.official_results_published_at is not null
    or exists (
      select 1 from public.on_site_tournament_closeouts closeout
      where closeout.tournament_id = p_tournament_id
    ) then
    raise exception using errcode = '55000', message = 'AITT_DQ_EDIT_LOCKED';
  end if;

  if p_disqualified and v_previous.participation_status <> 'disqualified' then
    update public.tournament_result_entries set
      participation_status = 'disqualified',
      aoy_eligible = false,
      aoy_eligibility_snapshot = coalesce(aoy_eligibility_snapshot, '{}'::jsonb)
        || jsonb_build_object(
          'eligible', false,
          'reason', 'Explicit Admin disqualification',
          'disqualifiedAt', now(),
          'disqualifiedByAdminId', p_admin_user_id
        )
    where id = p_result_entry_id returning * into v_result;
  elsif not p_disqualified and v_previous.participation_status = 'disqualified' then
    select audit.previous_value into v_restore
    from public.working_result_audit audit
    where audit.tournament_id = p_tournament_id
      and audit.action = 'mark_disqualified'
      and audit.new_value ->> 'id' = p_result_entry_id::text
    order by audit.created_at desc limit 1;

    if v_restore is null then
      raise exception using errcode = '55000', message = 'AITT_DQ_RESTORE_AUDIT_MISSING';
    end if;

    update public.tournament_result_entries set
      participation_status = v_restore ->> 'participation_status',
      aoy_eligible = (v_restore ->> 'aoy_eligible')::boolean,
      aoy_eligibility_snapshot = nullif(
        v_restore -> 'aoy_eligibility_snapshot',
        'null'::jsonb
      ),
      base_payout = coalesce((original_import_data ->> 'basePayout')::numeric, 0),
      bronze_payout = coalesce((original_import_data ->> 'bronzePayout')::numeric, 0),
      silver_payout = coalesce((original_import_data ->> 'silverPayout')::numeric, 0),
      gold_payout = coalesce((original_import_data ->> 'goldPayout')::numeric, 0),
      big_bass_payout = coalesce((original_import_data ->> 'bigBassPayout')::numeric, 0)
    where id = p_result_entry_id returning * into v_result;
  else
    return v_previous;
  end if;

  insert into public.working_result_audit (
    tournament_id, action, previous_value, new_value, reason, admin_user_id
  ) values (
    p_tournament_id,
    case when p_disqualified then 'mark_disqualified' else 'remove_disqualification' end,
    to_jsonb(v_previous), to_jsonb(v_result),
    case when p_disqualified then 'Explicit Admin disqualification' else 'Explicit Admin DQ removal before closeout' end,
    p_admin_user_id
  );
  return v_result;
end;
$$;

revoke all on function public.set_working_result_disqualification(uuid, uuid, boolean, uuid)
  from public, anon, authenticated;
grant execute on function public.set_working_result_disqualification(uuid, uuid, boolean, uuid)
  to service_role;

comment on function public.set_working_result_disqualification(uuid, uuid, boolean, uuid) is
  'Explicitly marks or removes DQ on a verified Working Result before financial closeout/publication; removal restores the exact audited pre-DQ eligibility state.';

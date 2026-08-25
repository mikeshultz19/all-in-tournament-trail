create or replace function public.reset_tournament_payout_workflow(
  p_tournament_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_closeouts_deleted integer := 0;
  v_insurance_deleted integer := 0;
begin
  if not exists (
    select 1 from public.tournaments where id = p_tournament_id
  ) then
    raise exception using errcode = 'P0002',
      message = 'AITT_TOURNAMENT_NOT_FOUND';
  end if;

  if exists (
    select 1 from public.tournament_insurance_pot_results
    where tournament_id = p_tournament_id and published = true
  ) then
    raise exception using errcode = '55000',
      message = 'AITT_PUBLISHED_INSURANCE_RESET_PROTECTED';
  end if;

  delete from public.on_site_tournament_closeouts
  where tournament_id = p_tournament_id;
  get diagnostics v_closeouts_deleted = row_count;

  delete from public.tournament_insurance_pot_results
  where tournament_id = p_tournament_id and published = false;
  get diagnostics v_insurance_deleted = row_count;

  return jsonb_build_object(
    'closeoutsDeleted', v_closeouts_deleted,
    'unpublishedInsuranceResultsDeleted', v_insurance_deleted
  );
end;
$$;

revoke all on function public.reset_tournament_payout_workflow(uuid)
  from public, anon, authenticated;
grant execute on function public.reset_tournament_payout_workflow(uuid)
  to service_role;

comment on function public.reset_tournament_payout_workflow(uuid) is
  'Resets generated closeout work and its unpublished nested Insurance Pot result while protecting published Insurance history.';

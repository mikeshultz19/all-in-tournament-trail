-- Remove pre-launch operational test data without changing schedule or website
-- content. Exact-count guards prevent this cleanup from deleting newer rows if
-- the live dataset changes before the migration is applied.
do $$
declare
  registration_count integer;
  result_entry_count integer;
  result_summary_count integer;
  aoy_point_count integer;
begin
  select count(*) into registration_count
  from public.tournament_registrations;

  select count(*) into result_entry_count
  from public.tournament_result_entries;

  select count(*) into result_summary_count
  from public.tournament_results;

  select count(*) into aoy_point_count
  from public.tournament_aoy_points;

  if registration_count <> 6
    or result_entry_count <> 60
    or result_summary_count <> 2
    or aoy_point_count <> 6 then
    raise exception using
      message = 'AITT_PRELAUNCH_CLEANUP_DATA_CHANGED',
      detail = format(
        'Expected registrations=6, result_entries=60, results=2, aoy_points=6; found registrations=%s, result_entries=%s, results=%s, aoy_points=%s.',
        registration_count,
        result_entry_count,
        result_summary_count,
        aoy_point_count
      );
  end if;

  -- The audited demo result summaries belong to tournaments marked official.
  -- Use the existing transaction-local correction gate for their removal.
  perform set_config('aitt.official_correction', 'on', true);

  -- Working-result immutability has no cleanup gate. Disable only its named
  -- trigger for this transaction and restore it immediately after deletion.
  alter table public.tournament_result_entries
    disable trigger working_results_prevent_official_changes;

  -- Payments are stored on registrations as payment_reference/price snapshots.
  delete from public.tournament_aoy_points;
  delete from public.tournament_result_entries;

  alter table public.tournament_result_entries
    enable trigger working_results_prevent_official_changes;

  delete from public.tournament_results;
  delete from public.tournament_registrations;
end
$$;

alter table public.tournament_insurance_pot_results
  add column if not exists calculated_payouts jsonb not null default '[]'::jsonb
  check (jsonb_typeof(calculated_payouts) = 'array');

update public.tournament_insurance_pot_results
set calculated_payouts = (
  select coalesce(jsonb_agg((winner ->> 'amountCents')::bigint order by ordinal), '[]'::jsonb)
  from jsonb_array_elements(winners) with ordinality as item(winner, ordinal)
)
where calculated_payouts = '[]'::jsonb and winners <> '[]'::jsonb;

drop trigger if exists publish_insurance_pot_with_results on public.tournaments;
drop function if exists public.validate_and_publish_insurance_pot();

create or replace function public.publish_insurance_pot_results(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.tournament_insurance_pot_results;
  v_required_places integer;
  v_winner_count integer;
  v_unique_count integer;
  v_assigned bigint;
begin
  select * into v_result from public.tournament_insurance_pot_results
  where tournament_id = p_tournament_id for update;
  if not found or v_result.published then
    raise exception using errcode = '23514', message = 'AITT_INSURANCE_POT_VALIDATION_FAILED';
  end if;
  v_required_places := case when v_result.entry_count <= 0 then 0 when v_result.entry_count < 10 then 1 else floor(v_result.entry_count / 5.0)::integer end;
  select count(*), count(distinct lower(btrim(winner ->> 'entryName'))),
    coalesce(sum((winner ->> 'amountCents')::bigint), 0)
  into v_winner_count, v_unique_count, v_assigned
  from jsonb_array_elements(v_result.winners) winner;
  if v_result.places_paid <> v_required_places
    or v_winner_count <> v_required_places
    or v_unique_count <> v_winner_count
    or exists (select 1 from jsonb_array_elements(v_result.winners) winner
      where nullif(btrim(winner ->> 'entryName'), '') is null
        or coalesce((winner ->> 'finishingPosition')::integer, 0) <= 0
        or (winner ->> 'amountCents')::bigint < 0)
    or v_assigned <> v_result.total_pot_cents then
    raise exception using errcode = '23514', message = 'AITT_INSURANCE_POT_VALIDATION_FAILED';
  end if;
  update public.tournament_insurance_pot_results
  set published = true, published_at = now(), updated_at = now()
  where id = v_result.id;
end;
$$;

revoke all on function public.publish_insurance_pot_results(uuid) from public, anon, authenticated;
grant execute on function public.publish_insurance_pot_results(uuid) to service_role;

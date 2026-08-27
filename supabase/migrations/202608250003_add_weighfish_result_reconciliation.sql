create unique index if not exists tournament_result_entries_unique_registration
  on public.tournament_result_entries (tournament_id, registration_id)
  where registration_id is not null;

create or replace function public.reconcile_working_result_registration(
  p_tournament_id uuid,
  p_result_entry_id uuid,
  p_registration_id uuid,
  p_match_method text,
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
begin
  if p_admin_user_id is null or p_match_method not in ('auto_exact', 'auto_fuzzy', 'manual') then
    raise exception using errcode = '22023', message = 'AITT_WEIGHFISH_RECONCILIATION_INPUT_INVALID';
  end if;
  select * into v_previous from public.tournament_result_entries
    where id = p_result_entry_id and tournament_id = p_tournament_id for update;
  select * into v_registration from public.tournament_registrations
    where id = p_registration_id and tournament_id = p_tournament_id
      and registration_status = 'active' for update;
  if v_previous.id is null or v_registration.id is null or v_registration.competitive_record_id is null then
    raise exception using errcode = '23514', message = 'AITT_WEIGHFISH_ROSTER_OWNERSHIP_INVALID';
  end if;
  if exists (select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id and registration_id = p_registration_id
      and id <> p_result_entry_id) then
    raise exception using errcode = '23505', message = 'AITT_WEIGHFISH_REGISTRATION_ALREADY_OWNED';
  end if;
  update public.tournament_result_entries set
    registration_id = v_registration.id,
    competitive_record_id = v_registration.competitive_record_id,
    record_type = v_registration.registration_type,
    updated_at = now()
  where id = v_previous.id returning * into v_result;
  if v_previous.registration_id is distinct from v_result.registration_id then
    insert into public.working_result_audit (
      tournament_id, result_entry_id, action, previous_value, new_value, reason, admin_user_id
    ) values (
      p_tournament_id, v_result.id, 'identity_resolution', to_jsonb(v_previous), to_jsonb(v_result),
      'WeighFish roster reconciliation: ' || p_match_method, p_admin_user_id
    );
  end if;
  return v_result;
end;
$$;

revoke all on function public.reconcile_working_result_registration(uuid,uuid,uuid,text,uuid)
  from public, anon, authenticated;
grant execute on function public.reconcile_working_result_registration(uuid,uuid,uuid,text,uuid)
  to service_role;

create or replace function public.verify_tournament_import(
  p_tournament_id uuid,
  p_admin_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.tournament_result_entries where tournament_id = p_tournament_id
  ) then
    raise exception using errcode = '23514', message = 'AITT_IMPORT_HAS_NO_ROWS';
  end if;
  if exists (
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id and registration_id is null
  ) then
    raise exception using errcode = '23514', message = 'AITT_WEIGHFISH_RECONCILIATION_REQUIRED';
  end if;
  if exists (
    select registration_id from public.tournament_result_entries
    where tournament_id = p_tournament_id and registration_id is not null
    group by registration_id having count(*) > 1
  ) then
    raise exception using errcode = '23505', message = 'AITT_WEIGHFISH_DUPLICATE_REGISTRATION_OWNERSHIP';
  end if;
  if exists (
    select 1 from public.tournament_registrations registration
    where registration.tournament_id = p_tournament_id
      and registration.registration_status = 'active'
      and not exists (
        select 1 from public.tournament_result_entries result
        where result.tournament_id = p_tournament_id
          and result.registration_id = registration.id
      )
  ) then
    raise exception using errcode = '23514', message = 'AITT_WEIGHFISH_ACTIVE_REGISTRATION_MISSING';
  end if;
  if exists (
    select 1 from public.tournament_result_entries result
    left join public.tournament_registrations registration
      on registration.id = result.registration_id
      and registration.tournament_id = p_tournament_id
      and registration.registration_status = 'active'
    where result.tournament_id = p_tournament_id and registration.id is null
  ) then
    raise exception using errcode = '23514', message = 'AITT_WEIGHFISH_UNMATCHED_IMPORT';
  end if;
  update public.tournaments
  set results_verified_at = now(), results_verified_by = p_admin_user_id
  where id = p_tournament_id and result_status <> 'official';
  if not found then
    raise exception using errcode = '55000', message = 'AITT_PUBLISHED_RESULTS_IMMUTABLE';
  end if;
end;
$$;

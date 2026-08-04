alter table public.tournaments
  add column if not exists results_verified_at timestamptz,
  add column if not exists results_verified_by uuid;

create table if not exists public.tournament_import_reset_audit (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  admin_user_id uuid not null,
  reset_at timestamptz not null default now(),
  imported_rows_deleted integer not null,
  closeout_invalidated boolean not null,
  published_override boolean not null default false
);

alter table public.tournament_import_reset_audit enable row level security;
revoke all on table public.tournament_import_reset_audit from public, anon, authenticated;
grant select on table public.tournament_import_reset_audit to service_role;

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
    select 1 from public.tournament_result_entries
    where tournament_id = p_tournament_id
  ) then
    raise exception using errcode = '23514', message = 'AITT_IMPORT_HAS_NO_ROWS';
  end if;

  update public.tournaments
  set results_verified_at = now(), results_verified_by = p_admin_user_id
  where id = p_tournament_id and result_status <> 'official';

  if not found then
    raise exception using errcode = '55000', message = 'AITT_PUBLISHED_RESULTS_IMMUTABLE';
  end if;
end;
$$;

create or replace function public.reset_tournament_import(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_override_published boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_deleted integer := 0;
  v_closeout boolean := false;
begin
  select result_status into v_status from public.tournaments
  where id = p_tournament_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'AITT_TOURNAMENT_NOT_FOUND';
  end if;
  if v_status = 'official' and not p_override_published then
    raise exception using errcode = '55000', message = 'AITT_PUBLISHED_RESULTS_OVERRIDE_REQUIRED';
  end if;

  if v_status = 'official' then
    perform set_config('aitt.official_correction', 'on', true);
    delete from public.tournament_aoy_points where tournament_id = p_tournament_id;
    delete from public.official_result_entries where tournament_id = p_tournament_id;
    delete from public.official_results_publication_audit where tournament_id = p_tournament_id;
    delete from public.tournament_results where tournament_id = p_tournament_id;
  end if;

  delete from public.tournament_result_entries where tournament_id = p_tournament_id;
  get diagnostics v_deleted = row_count;
  delete from public.on_site_tournament_closeouts where tournament_id = p_tournament_id;
  v_closeout := found;

  update public.tournaments set
    weighfish_imported = false,
    weighfish_imported_at = null,
    results_verified_at = null,
    results_verified_by = null,
    result_status = 'pending',
    official_results_published_at = case when v_status = 'official' then null else official_results_published_at end,
    official_results_published_by = case when v_status = 'official' then null else official_results_published_by end,
    status = case when v_status = 'official' then 'Tournament Day' else status end
  where id = p_tournament_id;

  insert into public.tournament_import_reset_audit (
    tournament_id, admin_user_id, imported_rows_deleted,
    closeout_invalidated, published_override
  ) values (p_tournament_id, p_admin_user_id, v_deleted, v_closeout, p_override_published);
  return v_deleted;
end;
$$;

revoke all on function public.verify_tournament_import(uuid,uuid) from public, anon, authenticated;
revoke all on function public.reset_tournament_import(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.verify_tournament_import(uuid,uuid) to service_role;
grant execute on function public.reset_tournament_import(uuid,uuid,boolean) to service_role;

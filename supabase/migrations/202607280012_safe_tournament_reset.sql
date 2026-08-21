create table if not exists public.tournament_result_entries (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  place integer not null,
  team_name text not null,
  fish_count integer not null default 0,
  total_weight numeric not null default 0,
  big_fish_weight numeric,
  base_payout numeric not null default 0,
  bronze_payout numeric not null default 0,
  silver_payout numeric not null default 0,
  gold_payout numeric not null default 0,
  big_bass_place integer,
  big_bass_payout numeric not null default 0,
  insurance_payout numeric not null default 0,
  prize_description text,
  raw_payout_breakdown text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournament_result_entries_tournament_id_idx
  on public.tournament_result_entries (tournament_id);

alter table public.tournaments
  add column if not exists insurance_payout numeric(10, 2),
  add column if not exists insurance_notes text,
  add column if not exists insurance_reviewed boolean not null default false,
  add column if not exists insurance_reviewed_at timestamptz,
  add column if not exists champion_photo_url text,
  add column if not exists champion_photo_path text,
  add column if not exists big_bass_photo_url text,
  add column if not exists big_bass_photo_path text,
  add column if not exists photos_reviewed boolean not null default false,
  add column if not exists photos_reviewed_at timestamptz,
  add column if not exists weighfish_imported boolean not null default false,
  add column if not exists weighfish_imported_at timestamptz;

alter table public.tournaments drop constraint if exists tournaments_status_check;
alter table public.tournaments add constraint tournaments_status_check check (
  status in (
    'Scheduled', 'Ready for Registration', 'Registration Open',
    'Registration Closed', 'Postponed', 'Cancelled', 'Tournament Day',
    'Results Published'
  )
);

create table if not exists public.tournament_reset_log (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  admin_user_id uuid not null,
  admin_email text not null,
  reset_at timestamptz not null default now(),
  registrations_deleted integer not null,
  result_entries_deleted integer not null,
  published_results_deleted integer not null,
  aoy_contributions_deleted integer not null
);

alter table public.tournament_reset_log enable row level security;
revoke all on table public.tournament_reset_log from public, anon, authenticated;

create or replace function public.admin_tournament_reset_preview(
  p_tournament_id uuid
)
returns table (
  registrations bigint,
  result_entries bigint,
  published_results bigint,
  aoy_contributions bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    (select count(*) from public.tournament_registrations where tournament_id = p_tournament_id),
    (select count(*) from public.tournament_result_entries where tournament_id = p_tournament_id),
    (select count(*) from public.tournament_results where tournament_id = p_tournament_id),
    (select count(*) from public.tournament_aoy_points where tournament_id = p_tournament_id)
  where exists (select 1 from public.tournaments where id = p_tournament_id);
$$;

create or replace function public.admin_reset_tournament(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_admin_email text
)
returns table (
  registrations_deleted integer,
  result_entries_deleted integer,
  published_results_deleted integer,
  aoy_contributions_deleted integer,
  champion_photo_path text,
  big_bass_photo_path text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registrations integer;
  v_result_entries integer;
  v_published_results integer;
  v_aoy integer;
  v_champion_path text;
  v_big_bass_path text;
begin
  select t.champion_photo_path, t.big_bass_photo_path
  into v_champion_path, v_big_bass_path
  from public.tournaments t
  where t.id = p_tournament_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'AITT_TOURNAMENT_NOT_FOUND';
  end if;

  delete from public.tournament_registrations
  where tournament_id = p_tournament_id;
  get diagnostics v_registrations = row_count;

  delete from public.tournament_result_entries
  where tournament_id = p_tournament_id;
  get diagnostics v_result_entries = row_count;

  delete from public.tournament_results
  where tournament_id = p_tournament_id;
  get diagnostics v_published_results = row_count;

  delete from public.tournament_aoy_points
  where tournament_id = p_tournament_id;
  get diagnostics v_aoy = row_count;

  update public.tournaments
  set
    status = 'Ready for Registration',
    insurance_payout = null,
    insurance_notes = null,
    insurance_reviewed = false,
    insurance_reviewed_at = null,
    champion_photo_url = null,
    champion_photo_path = null,
    big_bass_photo_url = null,
    big_bass_photo_path = null,
    photos_reviewed = false,
    photos_reviewed_at = null,
    weighfish_imported = false,
    weighfish_imported_at = null,
    updated_by = p_admin_email
  where id = p_tournament_id;

  insert into public.tournament_reset_log (
    tournament_id, admin_user_id, admin_email,
    registrations_deleted, result_entries_deleted,
    published_results_deleted, aoy_contributions_deleted
  ) values (
    p_tournament_id, p_admin_user_id, p_admin_email,
    v_registrations, v_result_entries, v_published_results, v_aoy
  );

  return query select
    v_registrations, v_result_entries, v_published_results, v_aoy,
    v_champion_path, v_big_bass_path;
end;
$$;

revoke all on function public.admin_tournament_reset_preview(uuid)
from public, anon, authenticated;
revoke all on function public.admin_reset_tournament(uuid,uuid,text)
from public, anon, authenticated;
grant execute on function public.admin_tournament_reset_preview(uuid) to service_role;
grant execute on function public.admin_reset_tournament(uuid,uuid,text) to service_role;

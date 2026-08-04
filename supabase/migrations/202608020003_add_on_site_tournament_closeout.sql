create table if not exists public.on_site_tournament_closeouts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique references public.tournaments(id) on delete restrict,
  source_file_name text,
  source_rows jsonb not null default '[]'::jsonb check (jsonb_typeof(source_rows) = 'array'),
  entry_count integer not null default 0 check (entry_count >= 0),
  total_collected_cents bigint not null default 0 check (total_collected_cents >= 0),
  total_paid_cents bigint not null default 0 check (total_paid_cents >= 0),
  trail_retained_cents bigint not null default 0 check (trail_retained_cents >= 0),
  difference_cents bigint not null default 0,
  checks jsonb not null default '[]'::jsonb check (jsonb_typeof(checks) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'complete')),
  completed_at timestamptz,
  completed_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.save_on_site_tournament_closeout(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_source_file_name text,
  p_source_rows jsonb,
  p_entry_count integer,
  p_total_collected_cents bigint,
  p_trail_retained_cents bigint,
  p_checks jsonb,
  p_complete boolean default false
)
returns public.on_site_tournament_closeouts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.on_site_tournament_closeouts;
  v_total_paid bigint;
  v_difference bigint;
begin
  if p_admin_user_id is null or p_entry_count < 0
    or p_total_collected_cents < 0 or p_trail_retained_cents < 0
    or jsonb_typeof(p_source_rows) <> 'array' or jsonb_typeof(p_checks) <> 'array'
    or jsonb_array_length(p_source_rows) <> p_entry_count then
    raise exception using errcode = '22023', message = 'AITT_CLOSEOUT_INPUT_INVALID';
  end if;
  if exists (select 1 from jsonb_array_elements(p_checks) item where
    nullif(btrim(item ->> 'entryName'), '') is null
    or nullif(btrim(item ->> 'category'), '') is null
    or coalesce((item ->> 'amountCents')::bigint, -1) <= 0
    or coalesce((item ->> 'finishingPlace')::integer, 0) <= 0
    or coalesce(item ->> 'status', '') not in ('not_written', 'written', 'delivered')) then
    raise exception using errcode = '22023', message = 'AITT_CLOSEOUT_CHECK_INVALID';
  end if;
  select coalesce(sum((item ->> 'amountCents')::bigint), 0) into v_total_paid
  from jsonb_array_elements(p_checks) item;
  v_difference := p_total_collected_cents - p_trail_retained_cents - v_total_paid;
  if p_complete and v_difference <> 0 then
    raise exception using errcode = '23514', message = 'AITT_CLOSEOUT_NOT_RECONCILED';
  end if;
  insert into public.on_site_tournament_closeouts (
    tournament_id, source_file_name, source_rows, entry_count,
    total_collected_cents, total_paid_cents, trail_retained_cents,
    difference_cents, checks, status, completed_at, completed_by_admin_id
  ) values (
    p_tournament_id, nullif(btrim(p_source_file_name), ''), p_source_rows,
    p_entry_count, p_total_collected_cents, v_total_paid, p_trail_retained_cents,
    v_difference, p_checks, case when p_complete then 'complete' else 'draft' end,
    case when p_complete then now() else null end,
    case when p_complete then p_admin_user_id else null end
  ) on conflict (tournament_id) do update set
    source_file_name = excluded.source_file_name,
    source_rows = excluded.source_rows,
    entry_count = excluded.entry_count,
    total_collected_cents = excluded.total_collected_cents,
    total_paid_cents = excluded.total_paid_cents,
    trail_retained_cents = excluded.trail_retained_cents,
    difference_cents = excluded.difference_cents,
    checks = excluded.checks,
    status = excluded.status,
    completed_at = excluded.completed_at,
    completed_by_admin_id = excluded.completed_by_admin_id,
    updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

alter table public.on_site_tournament_closeouts enable row level security;
revoke all on table public.on_site_tournament_closeouts from public, anon, authenticated;
grant select, insert, update on table public.on_site_tournament_closeouts to service_role;
revoke all on function public.save_on_site_tournament_closeout(uuid,uuid,text,jsonb,integer,bigint,bigint,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.save_on_site_tournament_closeout(uuid,uuid,text,jsonb,integer,bigint,bigint,jsonb,boolean) to service_role;

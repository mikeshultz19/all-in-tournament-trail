create table if not exists public.tournament_insurance_pot_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique
    references public.tournaments(id) on delete restrict,
  entry_count integer not null default 0 check (entry_count >= 0),
  total_pot_cents bigint not null default 0 check (total_pot_cents >= 0),
  places_paid integer not null default 0 check (places_paid >= 0),
  winners jsonb not null default '[]'::jsonb
    check (jsonb_typeof(winners) = 'array'),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.validate_and_publish_insurance_pot()
returns trigger
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
  if new.result_status <> 'official'
    or old.result_status = 'official' then
    return new;
  end if;

  select * into v_result
  from public.tournament_insurance_pot_results
  where tournament_id = new.id for update;

  if not found then
    if coalesce(new.insurance_payout, 0) > 0 then
      raise exception using errcode = '23514',
        message = 'AITT_INSURANCE_POT_VALIDATION_FAILED';
    end if;
    return new;
  end if;

  v_required_places := case
    when v_result.entry_count <= 0 then 0
    when v_result.entry_count < 10 then 1
    else floor(v_result.entry_count / 5.0)::integer
  end;

  select count(*), count(distinct lower(btrim(winner ->> 'entryName'))),
    coalesce(sum((winner ->> 'amountCents')::bigint), 0)
  into v_winner_count, v_unique_count, v_assigned
  from jsonb_array_elements(v_result.winners) winner;

  if v_result.places_paid <> v_required_places
    or v_winner_count <> v_required_places
    or v_unique_count <> v_winner_count
    or exists (
      select 1 from jsonb_array_elements(v_result.winners) winner
      where nullif(btrim(winner ->> 'entryName'), '') is null
        or (winner ->> 'amountCents')::bigint < 0
    )
    or v_assigned <> v_result.total_pot_cents
    or round(coalesce(new.insurance_payout, 0) * 100)::bigint
      <> v_result.total_pot_cents then
    raise exception using errcode = '23514',
      message = 'AITT_INSURANCE_POT_VALIDATION_FAILED';
  end if;

  update public.tournament_insurance_pot_results
  set published = true, published_at = now(), updated_at = now()
  where id = v_result.id;
  return new;
end;
$$;

drop trigger if exists publish_insurance_pot_with_results
  on public.tournaments;
create trigger publish_insurance_pot_with_results
before update of result_status on public.tournaments
for each row execute function public.validate_and_publish_insurance_pot();

create or replace function public.prevent_published_insurance_pot_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.published then
    raise exception using errcode = '55000',
      message = 'AITT_OFFICIAL_RESULTS_IMMUTABLE';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists insurance_pot_prevent_published_mutation
  on public.tournament_insurance_pot_results;
create trigger insurance_pot_prevent_published_mutation
before update or delete on public.tournament_insurance_pot_results
for each row execute function public.prevent_published_insurance_pot_mutation();

alter table public.tournament_insurance_pot_results enable row level security;
revoke all on table public.tournament_insurance_pot_results
  from public, anon, authenticated;
grant select, insert, update, delete
  on table public.tournament_insurance_pot_results to service_role;

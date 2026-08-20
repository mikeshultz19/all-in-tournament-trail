alter table public.tournament_registrations
  add column if not exists online_payment_state text,
  add column if not exists square_payment_id text;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_online_payment_state_check,
  add constraint tournament_registrations_online_payment_state_check check (
    online_payment_state is null or online_payment_state = 'completed'
  );

create unique index if not exists tournament_registrations_square_payment_uidx
  on public.tournament_registrations (square_payment_id)
  where square_payment_id is not null;

create table if not exists public.online_registration_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  idempotency_key uuid not null default gen_random_uuid() unique,
  registration_request jsonb not null,
  quote_snapshot jsonb not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  state text not null default 'pending' check (state in (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'reconciliation_required'
  )),
  square_payment_id text unique,
  square_status text,
  registration_id uuid unique references public.tournament_registrations(id) on delete restrict,
  failure_code text,
  failure_message text,
  hold_expires_at timestamptz not null default (now() + interval '15 minutes'),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint online_registration_payment_attempts_request_check
    check (jsonb_typeof(registration_request) = 'object'),
  constraint online_registration_payment_attempts_quote_check
    check (jsonb_typeof(quote_snapshot) = 'object'),
  constraint online_registration_payment_attempts_completion_check check (
    state <> 'completed'
    or (square_payment_id is not null and square_status = 'COMPLETED' and registration_id is not null)
  )
);

create index if not exists online_registration_payment_attempts_tournament_idx
  on public.online_registration_payment_attempts (tournament_id, state, created_at);

drop trigger if exists online_registration_payment_attempts_set_updated_at
  on public.online_registration_payment_attempts;
create trigger online_registration_payment_attempts_set_updated_at
before update on public.online_registration_payment_attempts
for each row execute function public.set_updated_at();

alter table public.online_registration_payment_attempts enable row level security;
revoke all on table public.online_registration_payment_attempts from public, anon, authenticated;
grant select, insert, update on table public.online_registration_payment_attempts to service_role;

comment on table public.online_registration_payment_attempts is
  'Private, short-lived online payment recovery records. Only completed verified Square payments may reference durable tournament registrations.';

create or replace function public.create_online_registration_payment_attempt(
  p_tournament_id uuid,
  p_registration_request jsonb,
  p_quote_snapshot jsonb,
  p_amount_cents integer
)
returns public.online_registration_payment_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_attempt public.online_registration_payment_attempts;
  v_reserved bigint;
begin
  if jsonb_typeof(p_registration_request) <> 'object'
    or jsonb_typeof(p_quote_snapshot) <> 'object'
    or p_amount_cents <= 0 then
    raise exception using errcode = '22023', message = 'AITT_PAYMENT_ATTEMPT_INVALID';
  end if;
  select * into v_tournament from public.tournaments where id = p_tournament_id for update;
  if not found then raise exception using errcode = '23503', message = 'AITT_PAYMENT_TOURNAMENT_NOT_FOUND'; end if;
  select
    (select count(*) from public.tournament_registrations
      where tournament_id = p_tournament_id and registration_status = 'active')
    +
    (select count(*) from public.online_registration_payment_attempts
      where tournament_id = p_tournament_id
        and (state = 'reconciliation_required'
          or (state in ('pending', 'processing') and hold_expires_at > now())))
  into v_reserved;
  if v_tournament.capacity is not null and v_reserved >= v_tournament.capacity then
    raise exception using errcode = '23514', message = 'AITT_TOURNAMENT_CAPACITY_REACHED';
  end if;
  insert into public.online_registration_payment_attempts (
    tournament_id, registration_request, quote_snapshot, amount_cents
  ) values (
    p_tournament_id, p_registration_request, p_quote_snapshot, p_amount_cents
  ) returning * into v_attempt;
  return v_attempt;
end;
$$;

revoke all on function public.create_online_registration_payment_attempt(uuid,jsonb,jsonb,integer)
  from public, anon, authenticated;
grant execute on function public.create_online_registration_payment_attempt(uuid,jsonb,jsonb,integer)
  to service_role;

create or replace function public.claim_online_registration_payment_attempt(p_attempt_id uuid)
returns public.online_registration_payment_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.online_registration_payment_attempts;
  v_capacity integer;
  v_reserved bigint;
begin
  select * into v_attempt from public.online_registration_payment_attempts where id = p_attempt_id for update;
  if not found or v_attempt.state <> 'pending' then
    raise exception using errcode = '23514', message = 'AITT_PAYMENT_ATTEMPT_NOT_PENDING';
  end if;
  select capacity into v_capacity from public.tournaments where id = v_attempt.tournament_id for update;
  select
    (select count(*) from public.tournament_registrations
      where tournament_id = v_attempt.tournament_id and registration_status = 'active')
    +
    (select count(*) from public.online_registration_payment_attempts
      where tournament_id = v_attempt.tournament_id and id <> v_attempt.id
        and (state = 'reconciliation_required'
          or (state in ('pending', 'processing') and hold_expires_at > now())))
  into v_reserved;
  if v_capacity is not null and v_reserved >= v_capacity then
    raise exception using errcode = '23514', message = 'AITT_TOURNAMENT_CAPACITY_REACHED';
  end if;
  update public.online_registration_payment_attempts
  set state = 'processing', hold_expires_at = now() + interval '15 minutes'
  where id = v_attempt.id returning * into v_attempt;
  return v_attempt;
end;
$$;

revoke all on function public.claim_online_registration_payment_attempt(uuid)
  from public, anon, authenticated;
grant execute on function public.claim_online_registration_payment_attempt(uuid)
  to service_role;

create or replace function public.mark_online_registration_payment_completed(
  p_registration_id uuid,
  p_square_payment_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if nullif(btrim(p_square_payment_id), '') is null then
    raise exception using errcode = '22023', message = 'AITT_SQUARE_PAYMENT_ID_REQUIRED';
  end if;
  update public.tournament_registrations
  set online_payment_state = 'completed', square_payment_id = btrim(p_square_payment_id), updated_at = now()
  where id = p_registration_id and registration_source = 'online'
    and payment_reference = btrim(p_square_payment_id);
  if not found then
    raise exception using errcode = '23503', message = 'AITT_ONLINE_REGISTRATION_PAYMENT_NOT_FOUND';
  end if;
end;
$$;

revoke all on function public.mark_online_registration_payment_completed(uuid,text)
  from public, anon, authenticated;
grant execute on function public.mark_online_registration_payment_completed(uuid,text)
  to service_role;

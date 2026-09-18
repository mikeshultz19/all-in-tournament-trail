-- Registration disaster-recovery synchronization outbox.
--
-- This migration is intentionally forward-only. Rollback requires stopping the
-- worker, draining/archiving outbox evidence, dropping the trigger/functions,
-- and then dropping the table. Google credentials and external API calls never
-- belong in a database transaction.

create table if not exists public.registration_disaster_recovery_events (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.tournament_registrations(id) on delete restrict,
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  event_type text not null check (event_type in (
    'registration_created', 'registration_updated', 'registration_cancelled',
    'identity_review_updated', 'membership_review_updated', 'check_in_updated'
  )),
  event_version text not null,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'synchronized', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_retry_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synchronized_at timestamptz,
  constraint registration_disaster_recovery_event_version_key
    unique (registration_id, event_version)
);

create index if not exists registration_disaster_recovery_status_idx
  on public.registration_disaster_recovery_events (status, next_retry_at, created_at);

alter table public.registration_disaster_recovery_events enable row level security;
revoke all on table public.registration_disaster_recovery_events from public, anon, authenticated;
grant select, insert, update on table public.registration_disaster_recovery_events to service_role;

create or replace function public.enqueue_registration_disaster_recovery_event(
  p_registration_id uuid,
  p_event_type text,
  p_event_version text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_version text := coalesce(nullif(btrim(p_event_version), ''), to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.USOF'));
  v_key text := 'registration-dr:' || p_registration_id::text || ':' || v_version;
  v_id uuid;
begin
  if p_event_type not in ('registration_created', 'registration_updated', 'registration_cancelled', 'identity_review_updated', 'membership_review_updated', 'check_in_updated') then
    raise exception using errcode = '22023', message = 'AITT_INVALID_DISASTER_RECOVERY_EVENT_TYPE';
  end if;
  select * into v_registration from public.tournament_registrations where id = p_registration_id;
  if not found then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_NOT_FOUND';
  end if;
  insert into public.registration_disaster_recovery_events (
    registration_id, tournament_id, event_type, event_version, idempotency_key
  ) values (
    v_registration.id, v_registration.tournament_id, p_event_type, v_version, v_key
  ) on conflict (idempotency_key) do nothing
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.enqueue_registration_disaster_recovery_event(uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.enqueue_registration_disaster_recovery_event(uuid,text,text)
  to service_role;

create or replace function public.enqueue_registration_disaster_recovery_registration()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_type text;
begin
  v_type := case
    when tg_op = 'INSERT' then 'registration_created'
    when new.registration_status = 'cancelled' and old.registration_status is distinct from new.registration_status then 'registration_cancelled'
    when new.checked_in_at is distinct from old.checked_in_at then 'check_in_updated'
    else 'registration_updated'
  end;
  perform public.enqueue_registration_disaster_recovery_event(new.id, v_type, new.updated_at::text);
  return new;
end;
$$;

drop trigger if exists registration_disaster_recovery_registration_enqueue on public.tournament_registrations;
create trigger registration_disaster_recovery_registration_enqueue
after insert or update of registration_status, angler1_name, angler2_name, participant_contact_snapshot,
  membership_snapshot, price_snapshot, payment_reference, payment_method, checked_in_at,
  checked_in_by_admin_id, boat_number, big_bass, member_pot, insurance
on public.tournament_registrations
for each row execute function public.enqueue_registration_disaster_recovery_registration();

create or replace function public.enqueue_registration_disaster_recovery_review()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.enqueue_registration_disaster_recovery_event(
    new.registration_id,
    case when new.review_kind = 'membership' then 'membership_review_updated' else 'identity_review_updated' end,
    coalesce(new.updated_at, new.created_at)::text
  );
  return new;
end;
$$;

revoke all on function public.enqueue_registration_disaster_recovery_registration() from public, anon, authenticated;
revoke all on function public.enqueue_registration_disaster_recovery_review() from public, anon, authenticated;

drop trigger if exists registration_disaster_recovery_review_enqueue on public.registration_identity_reviews;
create trigger registration_disaster_recovery_review_enqueue
after insert or update of review_status, review_note, canonical_angler_id, differing_fields
on public.registration_identity_reviews
for each row execute function public.enqueue_registration_disaster_recovery_review();

create or replace function public.claim_registration_disaster_recovery_event()
returns public.registration_disaster_recovery_events
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_event public.registration_disaster_recovery_events;
begin
  select * into v_event
  from public.registration_disaster_recovery_events
  where (status = 'pending' or (status = 'failed' and next_retry_at <= now())
    or (status = 'processing' and updated_at < now() - interval '10 minutes'))
  order by created_at, id
  for update skip locked limit 1;
  if not found then return null; end if;
  update public.registration_disaster_recovery_events
  set status = 'processing', attempt_count = attempt_count + 1, updated_at = now(), last_error = null
  where id = v_event.id returning * into v_event;
  return v_event;
end;
$$;

create or replace function public.finish_registration_disaster_recovery_event(
  p_event_id uuid, p_succeeded boolean, p_error text default null, p_retry_after_seconds integer default 300
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.registration_disaster_recovery_events
  set status = case when p_succeeded then 'synchronized' else 'failed' end,
      synchronized_at = case when p_succeeded then now() else synchronized_at end,
      next_retry_at = case when p_succeeded then next_retry_at else now() + make_interval(secs => greatest(1, least(coalesce(p_retry_after_seconds, 300), 86400))) end,
      last_error = case when p_succeeded then null else left(coalesce(nullif(btrim(p_error), ''), 'GOOGLE_SHEETS_SYNC_FAILED'), 500) end,
      updated_at = now()
  where id = p_event_id and status = 'processing';
  if not found then raise exception using errcode = '23514', message = 'AITT_DISASTER_RECOVERY_EVENT_NOT_PROCESSING'; end if;
end;
$$;

revoke all on function public.claim_registration_disaster_recovery_event() from public, anon, authenticated;
revoke all on function public.finish_registration_disaster_recovery_event(uuid,boolean,text,integer) from public, anon, authenticated;
grant execute on function public.claim_registration_disaster_recovery_event() to service_role;
grant execute on function public.finish_registration_disaster_recovery_event(uuid,boolean,text,integer) to service_role;

create or replace function public.admin_retry_failed_disaster_recovery_events()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_count integer;
begin
  update public.registration_disaster_recovery_events
  set status = 'pending', next_retry_at = now(), updated_at = now()
  where status = 'failed';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.admin_enqueue_tournament_disaster_recovery_rebuild(p_tournament_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_count integer;
begin
  insert into public.registration_disaster_recovery_events (registration_id, tournament_id, event_type, event_version, idempotency_key)
  select id, tournament_id, 'registration_updated', 'rebuild:' || to_char(current_date, 'YYYY-MM-DD'),
    'registration-dr-rebuild:' || id::text || ':' || to_char(current_date, 'YYYY-MM-DD')
  from public.tournament_registrations
  where tournament_id = p_tournament_id
  on conflict (idempotency_key) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.admin_retry_failed_disaster_recovery_events() from public, anon;
revoke all on function public.admin_enqueue_tournament_disaster_recovery_rebuild(uuid) from public, anon;
grant execute on function public.admin_retry_failed_disaster_recovery_events() to authenticated, service_role;
grant execute on function public.admin_enqueue_tournament_disaster_recovery_rebuild(uuid) to authenticated, service_role;

create trigger registration_disaster_recovery_events_set_updated_at
before update on public.registration_disaster_recovery_events
for each row execute function public.set_updated_at();

comment on table public.registration_disaster_recovery_events is
  'Private durable registration DR outbox. External Google Sheets calls occur only in a server-side worker after registration commit.';

create table public.registration_confirmation_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.tournament_registrations(id) on delete restrict,
  payment_attempt_id uuid not null references public.online_registration_payment_attempts(id) on delete restrict,
  recipient_email text not null,
  normalized_recipient_email text not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text,
  provider_idempotency_key text not null unique,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_confirmation_email_registration_recipient_key
    unique (registration_id, normalized_recipient_email),
  constraint registration_confirmation_email_normalized_check check (
    normalized_recipient_email = lower(btrim(recipient_email))
    and normalized_recipient_email <> ''
  )
);

create index registration_confirmation_email_delivery_status_idx
  on public.registration_confirmation_email_deliveries (status, created_at);

alter table public.registration_confirmation_email_deliveries enable row level security;
revoke all on table public.registration_confirmation_email_deliveries from public, anon, authenticated;
grant select, insert, update on table public.registration_confirmation_email_deliveries to service_role;

create trigger registration_confirmation_email_deliveries_set_updated_at
before update on public.registration_confirmation_email_deliveries
for each row execute function public.set_updated_at();

comment on table public.registration_confirmation_email_deliveries is
  'Private per-recipient outbox for confirmation email after verified completed online registration payment.';

create or replace function public.enqueue_registration_confirmation_email_deliveries()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_angler jsonb;
  v_email text;
begin
  if new.state <> 'completed' or new.registration_id is null or new.square_status <> 'COMPLETED' then
    return new;
  end if;

  for v_angler in
    select value from jsonb_array_elements(new.registration_request -> 'anglers')
  loop
    v_email := lower(btrim(v_angler ->> 'email'));
    if v_email is not null and v_email <> '' then
      insert into public.registration_confirmation_email_deliveries (
        registration_id,
        payment_attempt_id,
        recipient_email,
        normalized_recipient_email,
        provider_idempotency_key
      ) values (
        new.registration_id,
        new.id,
        v_email,
        v_email,
        'registration-confirmation:' || new.registration_id::text || ':' || md5(v_email)
      )
      on conflict (registration_id, normalized_recipient_email) do nothing;
    end if;
  end loop;

  return new;
end;
$$;

revoke all on function public.enqueue_registration_confirmation_email_deliveries()
  from public, anon, authenticated;

create trigger online_registration_payment_attempt_enqueue_confirmation_email
after insert or update of state, registration_id, square_status
on public.online_registration_payment_attempts
for each row
when (new.state = 'completed' and new.registration_id is not null and new.square_status = 'COMPLETED')
execute function public.enqueue_registration_confirmation_email_deliveries();

create or replace function public.claim_registration_confirmation_email_delivery(
  p_registration_id uuid
)
returns public.registration_confirmation_email_deliveries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_delivery public.registration_confirmation_email_deliveries;
begin
  select * into v_delivery
  from public.registration_confirmation_email_deliveries
  where registration_id = p_registration_id
    and (
      status = 'pending'
      or (status = 'failed' and last_attempt_at < now() - interval '5 minutes')
      or (status = 'sending' and last_attempt_at < now() - interval '10 minutes')
    )
  order by created_at, id
  for update skip locked
  limit 1;

  if not found then
    return null;
  end if;

  update public.registration_confirmation_email_deliveries
  set status = 'sending',
      attempt_count = attempt_count + 1,
      last_attempt_at = now(),
      last_error_code = null
  where id = v_delivery.id
  returning * into v_delivery;

  return v_delivery;
end;
$$;

revoke all on function public.claim_registration_confirmation_email_delivery(uuid)
  from public, anon, authenticated;
grant execute on function public.claim_registration_confirmation_email_delivery(uuid)
  to service_role;

create or replace function public.finish_registration_confirmation_email_delivery(
  p_delivery_id uuid,
  p_succeeded boolean,
  p_provider_message_id text default null,
  p_error_code text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.registration_confirmation_email_deliveries
  set status = case when p_succeeded then 'sent' else 'failed' end,
      provider_message_id = case when p_succeeded then nullif(btrim(p_provider_message_id), '') else provider_message_id end,
      sent_at = case when p_succeeded then now() else sent_at end,
      last_error_code = case when p_succeeded then null else left(coalesce(nullif(btrim(p_error_code), ''), 'EMAIL_PROVIDER_ERROR'), 100) end
  where id = p_delivery_id and status = 'sending';

  if not found then
    raise exception using errcode = '23514', message = 'AITT_EMAIL_DELIVERY_NOT_CLAIMED';
  end if;
end;
$$;

revoke all on function public.finish_registration_confirmation_email_delivery(uuid,boolean,text,text)
  from public, anon, authenticated;
grant execute on function public.finish_registration_confirmation_email_delivery(uuid,boolean,text,text)
  to service_role;

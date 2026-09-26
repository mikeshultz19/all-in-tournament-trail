-- M1: one active registration per angler per tournament.
-- Canceled registrations are intentionally not considered duplicates; they may
-- return once through tournament-day walk-up registration.

create or replace function public.reject_duplicate_online_payment_attempt()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_submitted jsonb;
  v_existing jsonb;
begin
  if jsonb_typeof(new.registration_request -> 'anglers') <> 'array' then
    return new;
  end if;

  for v_submitted in select value from jsonb_array_elements(new.registration_request -> 'anglers') loop
    if exists (
      select 1
      from public.tournament_registrations registration
      join public.anglers angler
        on angler.id = any (array[registration.angler1_id, registration.angler2_id])
      where registration.tournament_id = new.tournament_id
        and registration.registration_status = 'cancelled'
        and lower(regexp_replace(angler.first_name || angler.last_name, '[^a-z0-9]', '', 'gi')) =
            lower(regexp_replace(coalesce(v_submitted ->> 'firstName', '') || coalesce(v_submitted ->> 'lastName', ''), '[^a-z0-9]', '', 'gi'))
        and (
          (nullif(lower(btrim(angler.email)), '') is not null
            and nullif(lower(btrim(v_submitted ->> 'email')), '') = lower(btrim(angler.email)))
          or
          (nullif(regexp_replace(angler.phone, '[^0-9]', '', 'g'), '') is not null
            and nullif(regexp_replace(v_submitted ->> 'mobilePhone', '[^0-9]', '', 'g'), '') = regexp_replace(angler.phone, '[^0-9]', '', 'g'))
        )
    ) then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_CANCELLED_ONLINE_REENTRY_NOT_ALLOWED';
    end if;

    if exists (
      select 1
      from public.tournament_registrations registration
      join public.anglers angler
        on angler.id = any (array[registration.angler1_id, registration.angler2_id])
      where registration.tournament_id = new.tournament_id
        and registration.registration_status = 'active'
        and lower(regexp_replace(angler.first_name || angler.last_name, '[^a-z0-9]', '', 'gi')) =
            lower(regexp_replace(coalesce(v_submitted ->> 'firstName', '') || coalesce(v_submitted ->> 'lastName', ''), '[^a-z0-9]', '', 'gi'))
        and (
          (nullif(lower(btrim(angler.email)), '') is not null
            and nullif(lower(btrim(v_submitted ->> 'email')), '') = lower(btrim(angler.email)))
          or
          (nullif(regexp_replace(angler.phone, '[^0-9]', '', 'g'), '') is not null
            and nullif(regexp_replace(v_submitted ->> 'mobilePhone', '[^0-9]', '', 'g'), '') = regexp_replace(angler.phone, '[^0-9]', '', 'g'))
        )
    ) then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_DUPLICATE_ACTIVE_PARTICIPATION';
    end if;

    if exists (
      select 1
      from public.online_registration_payment_attempts attempt
      cross join lateral jsonb_array_elements(attempt.registration_request -> 'anglers') existing(value)
      where attempt.tournament_id = new.tournament_id
        and attempt.id <> new.id
        and attempt.state in ('pending', 'processing', 'reconciliation_required')
        and attempt.hold_expires_at > now()
        and lower(regexp_replace(coalesce(existing.value ->> 'firstName', '') || coalesce(existing.value ->> 'lastName', ''), '[^a-z0-9]', '', 'gi')) =
            lower(regexp_replace(coalesce(v_submitted ->> 'firstName', '') || coalesce(v_submitted ->> 'lastName', ''), '[^a-z0-9]', '', 'gi'))
        and (
          (nullif(lower(btrim(existing.value ->> 'email')), '') is not null
            and lower(btrim(existing.value ->> 'email')) = lower(btrim(v_submitted ->> 'email')))
          or
          (nullif(regexp_replace(existing.value ->> 'mobilePhone', '[^0-9]', '', 'g'), '') is not null
            and regexp_replace(existing.value ->> 'mobilePhone', '[^0-9]', '', 'g') = regexp_replace(v_submitted ->> 'mobilePhone', '[^0-9]', '', 'g'))
        )
    ) then
      raise exception using errcode = '23514', message = 'AITT_REGISTRATION_DUPLICATE_ACTIVE_PARTICIPATION';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists reject_duplicate_online_payment_attempt
  on public.online_registration_payment_attempts;
create trigger reject_duplicate_online_payment_attempt
before insert on public.online_registration_payment_attempts
for each row execute function public.reject_duplicate_online_payment_attempt();

revoke all on function public.reject_duplicate_online_payment_attempt() from public, anon, authenticated;
grant execute on function public.reject_duplicate_online_payment_attempt() to service_role;

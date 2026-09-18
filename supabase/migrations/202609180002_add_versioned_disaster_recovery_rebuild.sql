-- Versioned, idempotent disaster-recovery rebuild requests.
--
-- This preserves the existing date-based rebuild function and adds an explicit
-- version for controlled recovery of a previously misclassified batch. It does
-- not reset, delete, or rewrite existing outbox rows.
--
-- Rollback limitations: dropping this function removes only the ability to
-- queue future explicitly-versioned rebuilds. Existing events and any external
-- Google Sheet rows are not removed or reconstructed by rollback.

create or replace function public.admin_enqueue_tournament_disaster_recovery_rebuild_versioned(
  p_tournament_id uuid,
  p_rebuild_version text
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_version text := btrim(coalesce(p_rebuild_version, ''));
  v_event_version text;
  v_count integer;
begin
  if p_tournament_id is null or not exists (
    select 1 from public.tournaments where id = p_tournament_id
  ) then
    raise exception using errcode = '23503', message = 'AITT_TOURNAMENT_NOT_FOUND';
  end if;
  if v_version = '' or length(v_version) > 64 or v_version !~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$' then
    raise exception using errcode = '22023', message = 'AITT_INVALID_DISASTER_RECOVERY_REBUILD_VERSION';
  end if;

  v_event_version := 'rebuild:' || v_version;
  insert into public.registration_disaster_recovery_events (
    registration_id, tournament_id, event_type, event_version, idempotency_key
  )
  select id, tournament_id, 'registration_updated', v_event_version,
    'registration-dr-rebuild:' || id::text || ':' || v_event_version
  from public.tournament_registrations
  where tournament_id = p_tournament_id
  on conflict (idempotency_key) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.admin_enqueue_tournament_disaster_recovery_rebuild_versioned(uuid,text)
  from public, anon;
grant execute on function public.admin_enqueue_tournament_disaster_recovery_rebuild_versioned(uuid,text)
  to authenticated, service_role;

comment on function public.admin_enqueue_tournament_disaster_recovery_rebuild_versioned(uuid,text) is
  'Queues an idempotent authoritative DR rebuild version; callers must provide an authenticated admin context or service role.';

-- Expire abandoned payment-processing leases into the existing manual recovery
-- queue. This never retries a Square charge and never creates a registration.

create or replace function public.recover_stale_online_payment_attempt(
  p_attempt_id uuid
)
returns public.online_registration_payment_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.online_registration_payment_attempts;
begin
  update public.online_registration_payment_attempts
  set state = 'reconciliation_required',
      failure_code = 'PAYMENT_PROCESSING_EXPIRED',
      failure_message = 'Payment processing exceeded its recovery window. Verify the Square payment before taking any action.',
      updated_at = now()
  where id = p_attempt_id
    and state = 'processing'
    and hold_expires_at <= now();

  select * into v_attempt
  from public.online_registration_payment_attempts
  where id = p_attempt_id;
  if not found then
    raise exception using errcode = '23503', message = 'AITT_PAYMENT_ATTEMPT_NOT_FOUND';
  end if;
  return v_attempt;
end;
$$;

create or replace function public.admin_recover_stale_online_payment_attempts()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_recovered integer;
begin
  update public.online_registration_payment_attempts
  set state = 'reconciliation_required',
      failure_code = 'PAYMENT_PROCESSING_EXPIRED',
      failure_message = 'Payment processing exceeded its recovery window. Verify the Square payment before taking any action.',
      updated_at = now()
  where state = 'processing'
    and hold_expires_at <= now();
  get diagnostics v_recovered = row_count;
  return v_recovered;
end;
$$;

revoke all on function public.recover_stale_online_payment_attempt(uuid)
  from public, anon, authenticated;
revoke all on function public.admin_recover_stale_online_payment_attempts()
  from public, anon, authenticated;
grant execute on function public.recover_stale_online_payment_attempt(uuid)
  to service_role;
grant execute on function public.admin_recover_stale_online_payment_attempts()
  to service_role;

comment on function public.recover_stale_online_payment_attempt(uuid) is
  'Moves an expired processing attempt to manual reconciliation without retrying a Square charge.';

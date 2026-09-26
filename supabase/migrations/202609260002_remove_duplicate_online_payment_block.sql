-- Governance decision: do not block customer registration for duplicate identity
-- matches. Preserve payment/registration capture and let the Tournament
-- Director resolve duplicate rows administratively afterward.

drop trigger if exists reject_duplicate_online_payment_attempt
  on public.online_registration_payment_attempts;

drop function if exists public.reject_duplicate_online_payment_attempt();

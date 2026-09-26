-- Governance decision: duplicate tournament registrations remain valid records
-- until the Tournament Director resolves them administratively. Do not let the
-- stable competitive record uniqueness index reject a second paid entry.

drop index if exists public.tournament_registrations_record_event_uidx;

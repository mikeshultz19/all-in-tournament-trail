-- Remove the deferred Google Sheets registration continuity feature.
--
-- The external-drive database/application backup remains the current release
-- gate. A future Google Drive archive will be a separate, non-transactional
-- process. This forward migration removes only the abandoned outbox and its
-- administrative functions from staging; it does not alter registrations,
-- payments, memberships, or review history.

drop trigger if exists registration_disaster_recovery_registration_enqueue
  on public.tournament_registrations;
drop trigger if exists registration_disaster_recovery_review_enqueue
  on public.registration_identity_reviews;
drop trigger if exists registration_disaster_recovery_events_set_updated_at
  on public.registration_disaster_recovery_events;

drop function if exists public.admin_enqueue_tournament_disaster_recovery_rebuild_versioned(uuid, text);
drop function if exists public.admin_enqueue_tournament_disaster_recovery_rebuild(uuid);
drop function if exists public.admin_retry_failed_disaster_recovery_events();
drop function if exists public.finish_registration_disaster_recovery_event(uuid, boolean, text, integer);
drop function if exists public.claim_registration_disaster_recovery_event();
drop function if exists public.enqueue_registration_disaster_recovery_review();
drop function if exists public.enqueue_registration_disaster_recovery_registration();
drop function if exists public.enqueue_registration_disaster_recovery_event(uuid, text, text);

drop table if exists public.registration_disaster_recovery_events;

alter table public.tournaments
  add column if not exists prepare_registration_review_complete boolean not null default false;

comment on column public.tournaments.prepare_registration_review_complete is
  'Tracks whether registration review has been confirmed complete for this tournament before Import Results is unlocked.';

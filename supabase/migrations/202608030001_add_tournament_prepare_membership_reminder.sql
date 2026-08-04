alter table public.tournaments
  add column if not exists paper_membership_reminder_checked boolean not null default false;

comment on column public.tournaments.paper_membership_reminder_checked is
  'Tracks whether the tournament-morning paper membership reminder has been completed for this tournament.';

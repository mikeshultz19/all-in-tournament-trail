alter table public.tournaments
  add column if not exists hours text,
  add column if not exists stop_fishing text;

comment on column public.tournaments.hours is
  'Optional public tournament-hours text entered by an administrator and displayed verbatim.';

comment on column public.tournaments.stop_fishing is
  'Optional public stop-fishing text entered by an administrator and displayed verbatim.';

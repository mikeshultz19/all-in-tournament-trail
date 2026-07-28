alter table public.tournaments
  add column if not exists registration_information text;

comment on column public.tournaments.registration_information is
  'Official free-form registration information displayed with the featured tournament.';

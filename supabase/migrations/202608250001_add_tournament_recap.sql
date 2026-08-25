alter table public.tournaments
  add column if not exists tournament_recap text;

alter table public.tournaments
  add constraint tournaments_tournament_recap_length
  check (
    tournament_recap is null
    or char_length(tournament_recap) <= 300
  );

comment on column public.tournaments.tournament_recap is
  'Optional public editorial recap. It remains editable after Official Results publication.';

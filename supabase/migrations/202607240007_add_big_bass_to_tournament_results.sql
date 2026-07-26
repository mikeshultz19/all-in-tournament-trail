alter table public.tournament_results
  add column if not exists big_bass_angler text,
  add column if not exists big_bass_weight numeric(6, 2);

alter table public.tournament_results
  drop constraint if exists tournament_results_big_bass_weight_nonnegative_check;

alter table public.tournament_results
  add constraint tournament_results_big_bass_weight_nonnegative_check
  check (big_bass_weight is null or big_bass_weight >= 0);

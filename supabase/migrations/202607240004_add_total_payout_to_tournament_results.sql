alter table public.tournament_results
  add column if not exists total_payout numeric(12, 2) not null default 0;

alter table public.tournament_results
  drop constraint if exists tournament_results_total_payout_nonnegative_check;

alter table public.tournament_results
  add constraint tournament_results_total_payout_nonnegative_check
  check (total_payout >= 0);

alter table public.tournament_results
  add column if not exists bronze_payout numeric(12, 2) not null default 0,
  add column if not exists silver_payout numeric(12, 2) not null default 0,
  add column if not exists gold_payout numeric(12, 2) not null default 0;

alter table public.tournament_results
  drop constraint if exists tournament_results_bronze_payout_nonnegative_check,
  drop constraint if exists tournament_results_silver_payout_nonnegative_check,
  drop constraint if exists tournament_results_gold_payout_nonnegative_check;

alter table public.tournament_results
  add constraint tournament_results_bronze_payout_nonnegative_check
    check (bronze_payout >= 0),
  add constraint tournament_results_silver_payout_nonnegative_check
    check (silver_payout >= 0),
  add constraint tournament_results_gold_payout_nonnegative_check
    check (gold_payout >= 0);

comment on column public.tournament_results.total_payout is
  'Standard tournament payout only; excludes Bronze, Silver, Gold, and Insurance Pot payouts.';
comment on column public.tournament_results.bronze_payout is
  'Final Weighfish Side Pot 1 (Bronze) payout.';
comment on column public.tournament_results.silver_payout is
  'Final Weighfish Side Pot 2 (Silver) payout.';
comment on column public.tournament_results.gold_payout is
  'Final Weighfish Side Pot 3 (Gold) payout.';

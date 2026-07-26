alter table public.tournament_results
  add column if not exists insurance_pot_payout numeric(12, 2) not null default 0;

comment on column public.tournament_results.insurance_pot_payout is
  'Final Insurance Pot cash payout entered manually; managed outside Weighfish.';

alter table public.tournament_results
  drop constraint if exists tournament_results_insurance_pot_payout_nonnegative_check;

alter table public.tournament_results
  add constraint tournament_results_insurance_pot_payout_nonnegative_check
  check (insurance_pot_payout >= 0);

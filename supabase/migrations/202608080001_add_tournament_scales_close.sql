alter table public.tournaments
  add column if not exists scales_close text;

comment on column public.tournaments.scales_close is
  'Optional public scales-close text entered by an administrator and displayed verbatim.';

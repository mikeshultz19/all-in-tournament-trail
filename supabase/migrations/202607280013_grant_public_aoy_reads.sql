grant select on table public.tournament_aoy_points to service_role;

comment on table public.tournament_aoy_points is
  'Tournament-level AOY awards. Public season standings are derived only from rows belonging to officially published tournaments.';

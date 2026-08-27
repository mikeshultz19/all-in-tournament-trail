-- Administrative/server-side reads use the service-role client. Keep the
-- public views readable only as already configured, while explicitly granting
-- the service role access required by Tournament Manager projections.
grant select on public.current_aoy_standings to service_role;
grant select on public.current_aoy_performances to service_role;
grant select on public.current_championship_qualifications to service_role;
grant select on public.current_championship_participations to service_role;

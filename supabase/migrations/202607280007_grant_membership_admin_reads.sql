grant select on table public.seasons to service_role;
grant select on table public.anglers to service_role;
grant select on table public.memberships to service_role;

comment on table public.memberships is
  'One current membership record per angler and season. Administrative reads use the server service role; atomic creation uses admin_create_member.';

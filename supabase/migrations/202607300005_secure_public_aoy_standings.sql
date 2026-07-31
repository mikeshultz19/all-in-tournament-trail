-- Keep full AOY calculation rows private while exposing only the fields used
-- by the public standings pages.
revoke all on table public.current_aoy_standings
  from public, anon, authenticated;
grant select on table public.current_aoy_standings to service_role;

create or replace function public.get_public_aoy_standings(
  p_season_id uuid
)
returns table (
  rank integer,
  display_name text,
  official_participation_count smallint,
  total_counted_points integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    standing.rank,
    standing.display_name,
    standing.official_participation_count,
    standing.total_counted_points
  from public.current_aoy_standings standing
  where standing.season_id = p_season_id
  order by standing.rank, standing.display_name;
$$;

revoke all on function public.get_public_aoy_standings(uuid)
  from public;
grant execute on function public.get_public_aoy_standings(uuid)
  to anon, authenticated, service_role;

comment on function public.get_public_aoy_standings(uuid) is
  'Public AOY projection containing rank, display name, participation count, and points only.';

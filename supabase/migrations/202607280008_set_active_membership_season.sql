create or replace function public.admin_set_active_season(
  p_season_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1
    from public.seasons
    where id = p_season_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'AITT_SEASON_NOT_FOUND';
  end if;

  update public.seasons
  set is_active = false
  where is_active = true
    and id <> p_season_id;

  update public.seasons
  set is_active = true
  where id = p_season_id
    and is_active = false;
end;
$$;

revoke all on function public.admin_set_active_season(uuid)
from public, anon, authenticated;

grant execute on function public.admin_set_active_season(uuid)
to service_role;

comment on function public.admin_set_active_season(uuid) is
  'Service-role-only transaction that selects the single active membership season after application-level Admin authorization.';

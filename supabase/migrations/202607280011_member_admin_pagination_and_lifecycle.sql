create or replace function public.admin_list_members(
  p_season_id uuid,
  p_search text default '',
  p_active boolean default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  membership_id uuid,
  angler_id uuid,
  first_name text,
  last_name text,
  display_name text,
  email text,
  phone text,
  is_active boolean,
  membership_status text,
  season_id uuid,
  season_name text,
  first_eligible_tournament_id uuid,
  first_eligible_tournament_name text,
  effective_date date,
  updated_at timestamptz,
  total_count bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    m.id,
    a.id,
    a.first_name,
    a.last_name,
    a.display_name,
    a.email,
    a.phone,
    a.is_active,
    m.status,
    s.id,
    s.name,
    t.id,
    t.name,
    m.effective_date,
    m.updated_at,
    count(*) over()
  from public.memberships m
  join public.anglers a on a.id = m.angler_id
  join public.seasons s on s.id = m.season_id
  left join public.tournaments t
    on t.id = m.first_eligible_tournament_id
  where m.season_id = p_season_id
    and (p_active is null or a.is_active = p_active)
    and (
      nullif(btrim(p_search), '') is null
      or a.first_name ilike '%' || btrim(p_search) || '%'
      or a.last_name ilike '%' || btrim(p_search) || '%'
      or a.display_name ilike '%' || btrim(p_search) || '%'
      or coalesce(a.email, '') ilike '%' || btrim(p_search) || '%'
      or coalesce(a.phone, '') ilike '%' || btrim(p_search) || '%'
    )
  order by a.display_name, a.id
  limit greatest(1, least(coalesce(p_limit, 25), 10000))
  offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.admin_set_angler_active(
  p_angler_id uuid,
  p_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.anglers
  set is_active = p_is_active
  where id = p_angler_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'AITT_MEMBER_NOT_FOUND';
  end if;
end;
$$;

create or replace function public.admin_delete_member(
  p_angler_id uuid
)
returns table (deleted boolean, history_found boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
  v_history_found boolean;
begin
  select display_name into v_name
  from public.anglers
  where id = p_angler_id
  for update;

  if v_name is null then
    raise exception using errcode = 'P0002', message = 'AITT_MEMBER_NOT_FOUND';
  end if;

  select
    exists (
      select 1 from public.team_members where angler_id = p_angler_id
    )
    or exists (
      select 1 from public.anglers where merged_into_angler_id = p_angler_id
    )
    or exists (
      select 1
      from public.tournament_registrations
      where lower(btrim(angler1_name)) = lower(btrim(v_name))
         or lower(btrim(coalesce(angler2_name, ''))) = lower(btrim(v_name))
    )
    or exists (
      select 1
      from public.tournament_aoy_points
      where lower(anglers::text) like
        '%' || lower(to_jsonb(v_name)::text) || '%'
    )
    or exists (
      select 1
      from public.tournament_results
      where lower(entries::text) like
        '%' || lower(to_jsonb(v_name)::text) || '%'
    )
  into v_history_found;

  if v_history_found then
    return query select false, true;
    return;
  end if;

  delete from public.memberships where angler_id = p_angler_id;
  delete from public.anglers where id = p_angler_id;

  return query select true, false;
end;
$$;

revoke all on function public.admin_list_members(uuid,text,boolean,integer,integer)
from public, anon, authenticated;
revoke all on function public.admin_set_angler_active(uuid,boolean)
from public, anon, authenticated;
revoke all on function public.admin_delete_member(uuid)
from public, anon, authenticated;

grant execute on function public.admin_list_members(uuid,text,boolean,integer,integer)
to service_role;
grant execute on function public.admin_set_angler_active(uuid,boolean)
to service_role;
grant execute on function public.admin_delete_member(uuid)
to service_role;

create or replace function public.ensure_initial_membership_season()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended('aitt-initial-membership-season', 0)
  );

  if not exists (select 1 from public.seasons) then
    insert into public.seasons (
      year,
      name,
      slug,
      is_active
    )
    values (
      2026,
      '2026–2027',
      '2026-2027',
      true
    );
  end if;
end;
$$;

revoke all on function public.ensure_initial_membership_season()
from public, anon, authenticated;

grant execute on function public.ensure_initial_membership_season()
to service_role;

comment on function public.ensure_initial_membership_season() is
  'Idempotently creates the initial active 2026–2027 membership season only when the seasons table is empty.';

select public.ensure_initial_membership_season();

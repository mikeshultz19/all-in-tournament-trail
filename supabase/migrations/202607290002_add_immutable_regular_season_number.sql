alter table public.tournaments
  add column if not exists regular_season_number smallint;

-- The two UUIDs are environment-specific identities previously used for the
-- inaugural Eagle Mountain tournament. Exactly one may exist in a database.
do $$
declare
  v_eagle_count integer;
begin
  select count(*) into v_eagle_count
  from public.tournaments
  where id in (
    'a54c9b21-7e60-47f0-9007-4c95c8bbf13c'::uuid,
    '54e88b83-2521-4c77-a1b6-5ed4eed2890f'::uuid
  )
    and season_id = (
      select id from public.seasons where slug = '2026-2027'
    )
    and event_type = 'regular_season';

  if v_eagle_count > 1 then
    raise exception using
      errcode = '23514',
      message = 'AITT_REGULAR_SEASON_NUMBER_AMBIGUOUS_EAGLE_MOUNTAIN';
  end if;

  if v_eagle_count = 1 then
    update public.tournaments
    set regular_season_number = 1
    where id in (
      'a54c9b21-7e60-47f0-9007-4c95c8bbf13c'::uuid,
      '54e88b83-2521-4c77-a1b6-5ed4eed2890f'::uuid
    )
      and season_id = (
        select id from public.seasons where slug = '2026-2027'
      )
      and event_type = 'regular_season'
      and regular_season_number is null;
  end if;
end;
$$;

alter table public.tournaments
  drop constraint if exists tournaments_regular_season_number_check,
  add constraint tournaments_regular_season_number_check check (
    (event_type = 'championship' and regular_season_number is null)
    or
    (
      event_type = 'regular_season'
      and (
        (season_id is null and regular_season_number is null)
        or
        (season_id is not null and regular_season_number between 1 and 8)
      )
    )
  );

create unique index if not exists tournaments_unique_regular_season_number_idx
  on public.tournaments (season_id, regular_season_number)
  where event_type = 'regular_season'
    and regular_season_number is not null;

do $$
begin
  if exists (
    select 1
    from public.memberships membership
    join public.tournaments tournament
      on tournament.id = membership.first_eligible_tournament_id
    where membership.first_eligible_tournament_id is not null
      and (
        tournament.season_id is distinct from membership.season_id
        or tournament.event_type <> 'regular_season'
        or tournament.regular_season_number is null
      )
  ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_MEMBERSHIP_FIRST_ELIGIBLE_TOURNAMENT_REVIEW_REQUIRED';
  end if;
end;
$$;

create or replace function public.prevent_regular_season_identity_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.regular_season_number is not null
    and (
      new.regular_season_number is distinct from old.regular_season_number
      or new.season_id is distinct from old.season_id
      or new.event_type is distinct from old.event_type
    ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_REGULAR_SEASON_IDENTITY_IMMUTABLE';
  end if;

  return new;
end;
$$;

drop trigger if exists tournaments_prevent_regular_season_identity_change
  on public.tournaments;
create trigger tournaments_prevent_regular_season_identity_change
before update of regular_season_number, season_id, event_type
on public.tournaments
for each row execute function public.prevent_regular_season_identity_change();

create or replace function public.validate_membership_first_eligible_tournament()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.first_eligible_tournament_id is not null
    and not exists (
      select 1
      from public.tournaments tournament
      where tournament.id = new.first_eligible_tournament_id
        and tournament.season_id = new.season_id
        and tournament.event_type = 'regular_season'
        and tournament.regular_season_number between 1 and 8
    ) then
    raise exception using
      errcode = '23514',
      message = 'AITT_MEMBERSHIP_FIRST_ELIGIBLE_TOURNAMENT_INVALID';
  end if;

  return new;
end;
$$;

drop trigger if exists memberships_validate_first_eligible_tournament
  on public.memberships;
create trigger memberships_validate_first_eligible_tournament
before insert or update of season_id, first_eligible_tournament_id
on public.memberships
for each row execute function public.validate_membership_first_eligible_tournament();

comment on column public.tournaments.regular_season_number is
  'Immutable constitutional tournament number 1-8 within a season. Championship events are unnumbered. Calendar changes never alter this identity.';

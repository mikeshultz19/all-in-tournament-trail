update public.tournaments
set
  season_id = (
    select id
    from public.seasons
    where slug = '2026-2027'
  ),
  event_type = 'regular_season'
where id in (
  'a54c9b21-7e60-47f0-9007-4c95c8bbf13c'::uuid,
  '54e88b83-2521-4c77-a1b6-5ed4eed2890f'::uuid
)
and exists (
  select 1
  from public.seasons
  where slug = '2026-2027'
);

comment on column public.memberships.first_eligible_tournament_id is
  'The first regular-season tournament at which the member becomes eligible; this relationship, not membership effective_date, controls tournament eligibility.';

alter table public.tournaments
  add column if not exists tournament_end_date timestamptz;

alter table public.tournaments
  drop constraint if exists tournaments_end_date_check,
  add constraint tournaments_end_date_check check (
    tournament_end_date is null
    or tournament_end_date >= tournament_date
  );

comment on column public.tournaments.tournament_end_date is
  'Optional final competition date/time for a multi-day tournament. Regular-season identity remains independent of calendar dates.';

do $$
declare
  v_season_id uuid;
  v_tournament_id uuid;
  v_slot record;
begin
  select id
  into v_season_id
  from public.seasons
  where slug = '2026-2027';

  if v_season_id is null then
    raise exception using
      errcode = '23514',
      message = 'AITT_2026_2027_SEASON_REQUIRED';
  end if;

  update public.seasons
  set
    year = 2026,
    name = '2026–2027',
    regular_season_start_date = date '2026-11-01',
    regular_season_end_date = date '2027-05-16',
    championship_start_date = date '2027-06-12',
    championship_end_date = date '2027-06-13'
  where id = v_season_id;

  for v_slot in
    select *
    from (
      values
        (1::smallint, 'Eagle Mountain', 'Eagle Mountain', 'eagle-mountain-november-2026', '2026-11-01 06:00:00-06'::timestamptz),
        (2::smallint, 'Squaw Creek', 'Squaw Creek', 'squaw-creek-november-2026', '2026-11-22 06:00:00-06'::timestamptz),
        (3::smallint, 'Ray Hubbard', 'Ray Hubbard', 'ray-hubbard-december-2026', '2026-12-13 06:00:00-06'::timestamptz),
        (4::smallint, 'Granbury', 'Granbury', 'granbury-january-2027', '2027-01-17 06:00:00-06'::timestamptz),
        (5::smallint, 'Squaw Creek', 'Squaw Creek', 'squaw-creek-february-2027', '2027-02-14 06:00:00-06'::timestamptz),
        (6::smallint, 'Ray Roberts', 'Ray Roberts', 'ray-roberts-march-2027', '2027-03-14 06:00:00-05'::timestamptz),
        (7::smallint, 'Tawakoni', 'Tawakoni', 'tawakoni-april-2027', '2027-04-25 06:00:00-05'::timestamptz),
        (8::smallint, 'Lewisville', 'Lewisville', 'lewisville-may-2027', '2027-05-16 06:00:00-05'::timestamptz)
    ) as schedule(
      regular_season_number,
      name,
      lake,
      slug,
      tournament_date
    )
  loop
    v_tournament_id := null;

    select id
    into v_tournament_id
    from public.tournaments
    where season_id = v_season_id
      and event_type = 'regular_season'
      and regular_season_number = v_slot.regular_season_number;

    if v_tournament_id is null then
      select id
      into v_tournament_id
      from public.tournaments
      where slug = v_slot.slug;
    end if;

    if v_tournament_id is null then
      select id
      into v_tournament_id
      from public.tournaments
      where event_type = 'regular_season'
        and (tournament_date at time zone 'America/Chicago')::date =
          (v_slot.tournament_date at time zone 'America/Chicago')::date
      order by
        (season_id = v_season_id) desc,
        created_at asc
      limit 1;
    end if;

    if v_tournament_id is null then
      insert into public.tournaments (
        name,
        slug,
        lake,
        tournament_date,
        tournament_end_date,
        status,
        is_featured,
        show_on_homepage,
        season_id,
        event_type,
        regular_season_number,
        updated_by
      )
      values (
        v_slot.name,
        v_slot.slug,
        v_slot.lake,
        v_slot.tournament_date,
        null,
        'Scheduled',
        v_slot.regular_season_number = 1,
        v_slot.regular_season_number = 1,
        v_season_id,
        'regular_season',
        v_slot.regular_season_number,
        '2026–2027 official schedule migration'
      )
      returning id into v_tournament_id;
    else
      update public.tournaments
      set
        name = v_slot.name,
        slug = v_slot.slug,
        lake = v_slot.lake,
        tournament_date = v_slot.tournament_date,
        tournament_end_date = null,
        season_id = v_season_id,
        event_type = 'regular_season',
        regular_season_number = v_slot.regular_season_number,
        is_featured = v_slot.regular_season_number = 1,
        show_on_homepage = v_slot.regular_season_number = 1,
        updated_by = '2026–2027 official schedule migration'
      where id = v_tournament_id;
    end if;
  end loop;

  v_tournament_id := null;

  select id
  into v_tournament_id
  from public.tournaments
  where season_id = v_season_id
    and event_type = 'championship'
  order by created_at asc
  limit 1;

  if v_tournament_id is null then
    select id
    into v_tournament_id
    from public.tournaments
    where slug = 'aitt-2026-2027-championship';
  end if;

  if v_tournament_id is null then
    select id
    into v_tournament_id
    from public.tournaments
    where event_type = 'regular_season'
      and regular_season_number is null
      and (tournament_date at time zone 'America/Chicago')::date =
        date '2027-06-13'
    order by
      (season_id = v_season_id) desc,
      created_at asc
    limit 1;
  end if;

  if v_tournament_id is null then
    insert into public.tournaments (
      name,
      slug,
      lake,
      tournament_date,
      tournament_end_date,
      status,
      description,
      is_featured,
      show_on_homepage,
      season_id,
      event_type,
      regular_season_number,
      updated_by
    )
    values (
      'AITT Championship',
      'aitt-2026-2027-championship',
      'TBD',
      '2027-06-12 06:00:00-05'::timestamptz,
      '2027-06-13 15:00:00-05'::timestamptz,
      'Scheduled',
      'The two-day 2026–2027 AITT Championship. Championship lake and event details are to be announced.',
      false,
      false,
      v_season_id,
      'championship',
      null,
      '2026–2027 official schedule migration'
    );
  else
    update public.tournaments
    set
      name = 'AITT Championship',
      slug = 'aitt-2026-2027-championship',
      lake = 'TBD',
      tournament_date = '2027-06-12 06:00:00-05'::timestamptz,
      tournament_end_date = '2027-06-13 15:00:00-05'::timestamptz,
      status = case
        when status in ('Results Published', 'Tournament Day') then status
        else 'Scheduled'
      end,
      description = 'The two-day 2026–2027 AITT Championship. Championship lake and event details are to be announced.',
      is_featured = false,
      show_on_homepage = false,
      season_id = v_season_id,
      event_type = 'championship',
      regular_season_number = null,
      updated_by = '2026–2027 official schedule migration'
    where id = v_tournament_id;
  end if;
end;
$$;

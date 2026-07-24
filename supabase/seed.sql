insert into public.tournaments (
  name,
  slug,
  lake,
  tournament_date,
  ramp,
  status,
  registration_closes,
  description,
  is_featured,
  show_on_homepage,
  updated_by
)
values (
  'Lake Fork Open',
  'lake-fork-open-2026',
  'Lake Fork',
  '2026-08-16T06:00:00-05:00',
  'Pope''s Landing',
  'Registration Open',
  '2026-08-15T18:00:00-05:00',
  'The featured All-In Tournament Trail stop at Lake Fork.',
  true,
  true,
  'AITT Staff'
)
on conflict (slug) do update set
  name = excluded.name,
  lake = excluded.lake,
  tournament_date = excluded.tournament_date,
  ramp = excluded.ramp,
  status = excluded.status,
  registration_closes = excluded.registration_closes,
  description = excluded.description,
  is_featured = excluded.is_featured,
  show_on_homepage = excluded.show_on_homepage,
  updated_by = excluded.updated_by;

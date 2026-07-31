do $$
declare
  target_season_id uuid;
  updated_count integer;
begin
  select id
  into target_season_id
  from public.seasons
  where slug = '2026-2027';

  if target_season_id is null then
    raise exception 'The 2026-2027 season does not exist.';
  end if;

  update public.tournaments as tournament
  set
    description = approved.description,
    updated_at = now(),
    updated_by = 'AITT Staff'
  from (
    values
      (1, 'A powerhouse fishery known for big bass and heavyweight tournament bags. Get ready to see some impressive fish brought to the scales.'),
      (2, 'One of the premier power plant lakes in Texas, known for excellent winter fishing and consistent limits.'),
      (3, 'A big-weight lake where marinas, riprap, and the expansive river system often hold the winning fish.'),
      (4, 'A unique river-system fishery featuring boat docks, deep clear water, and a variety of productive structure.'),
      (5, 'One of the premier power plant lakes in Texas, known for excellent winter fishing and consistent limits.'),
      (6, 'One of the toughest tournament lakes in Texas, but capable of producing trophy bass around rocks, flats, and flooded timber.'),
      (7, 'An expansive fishery known for its abundant boat docks and outstanding shallow-water cover fishing.'),
      (8, 'One of the toughest lakes in DFW, where success often comes from fishing rocks, brush piles, and riprap.')
  ) as approved(regular_season_number, description)
  where tournament.season_id = target_season_id
    and tournament.event_type = 'regular_season'
    and tournament.regular_season_number = approved.regular_season_number;

  get diagnostics updated_count = row_count;

  if updated_count <> 8 then
    raise exception
      'Expected to update 8 regular-season descriptions, but updated %.',
      updated_count;
  end if;
end
$$;

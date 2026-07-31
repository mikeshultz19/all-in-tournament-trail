update public.tournaments
set
  status = 'Registration Closed',
  morning_registration = '05:00',
  updated_at = now(),
  updated_by = 'AITT Staff'
where slug = 'eagle-mountain-november-2026'
  and tournament_date >= now();

do $$
begin
  if not exists (
    select 1
    from public.tournaments
    where slug = 'eagle-mountain-november-2026'
      and status = 'Registration Closed'
      and morning_registration = '05:00'
  ) then
    raise exception 'Eagle Mountain launch-state correction was not applied.';
  end if;
end
$$;

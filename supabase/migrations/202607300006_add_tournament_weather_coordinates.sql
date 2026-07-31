alter table public.tournaments
  add column if not exists weather_latitude double precision,
  add column if not exists weather_longitude double precision;

alter table public.tournaments
  drop constraint if exists tournaments_weather_coordinates_check;

alter table public.tournaments
  add constraint tournaments_weather_coordinates_check check (
    (weather_latitude is null and weather_longitude is null)
    or (
      weather_latitude is not null
      and weather_longitude is not null
      and
      weather_latitude between -90 and 90
      and weather_longitude between -180 and 180
    )
  );

comment on column public.tournaments.weather_latitude is
  'Approved WGS84 latitude used for server-side tournament weather forecasts.';
comment on column public.tournaments.weather_longitude is
  'Approved WGS84 longitude used for server-side tournament weather forecasts.';

-- Texas Parks & Wildlife Department 2024 Eagle Mountain Reservoir survey.
update public.tournaments
set
  weather_latitude = case ramp
    when 'West Bay Marina' then 32.93417
    when 'Twin Points Park' then 32.87562
  end,
  weather_longitude = case ramp
    when 'West Bay Marina' then -97.51397
    when 'Twin Points Park' then -97.49323
  end
where regular_season_number = 1
  and lake = 'Eagle Mountain'
  and ramp in ('West Bay Marina', 'Twin Points Park');

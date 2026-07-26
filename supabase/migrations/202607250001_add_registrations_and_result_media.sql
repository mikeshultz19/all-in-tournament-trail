alter table public.tournaments
  add column if not exists capacity integer;

alter table public.tournaments
  drop constraint if exists tournaments_capacity_nonnegative_check;

alter table public.tournaments
  add constraint tournaments_capacity_nonnegative_check
  check (capacity is null or capacity >= 0);

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_key text not null unique,
  tournament_id uuid not null
    references public.tournaments(id) on delete cascade,
  registered_at timestamptz not null,
  registration_type text not null,
  angler1_name text not null,
  angler2_name text,
  big_bass boolean not null default false,
  member_pot text,
  insurance boolean not null default false,
  payment_reference text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_registrations_type_check check (
    registration_type in ('solo', 'team')
  ),
  constraint tournament_registrations_member_pot_check check (
    member_pot is null or member_pot in ('bronze', 'silver', 'gold')
  ),
  constraint tournament_registrations_angler2_name_check check (
    registration_type = 'team'
    or angler2_name is null
  )
);

create index if not exists tournament_registrations_tournament_id_idx
  on public.tournament_registrations (tournament_id);

create index if not exists tournament_registrations_registered_at_idx
  on public.tournament_registrations (registered_at);

drop trigger if exists tournament_registrations_set_updated_at
  on public.tournament_registrations;
create trigger tournament_registrations_set_updated_at
before update on public.tournament_registrations
for each row execute function public.set_updated_at();

alter table public.tournament_registrations enable row level security;

grant select, insert, update, delete on table public.tournament_registrations to anon;

drop policy if exists "Public tournament registrations are readable"
  on public.tournament_registrations;
create policy "Public tournament registrations are readable"
on public.tournament_registrations
for select
to anon
using (true);

create policy "Temporary anonymous tournament registrations creates"
on public.tournament_registrations
for insert
to anon
with check (true);

create policy "Temporary anonymous tournament registrations updates"
on public.tournament_registrations
for update
to anon
using (true)
with check (true);

create policy "Temporary anonymous tournament registrations deletes"
on public.tournament_registrations
for delete
to anon
using (true);

alter table public.tournament_results
  add column if not exists big_bass_payout numeric(12, 2),
  add column if not exists big_bass_team text,
  add column if not exists champion_image_url text,
  add column if not exists big_bass_image_url text;

alter table public.tournament_results
  drop constraint if exists tournament_results_big_bass_payout_nonnegative_check;

alter table public.tournament_results
  add constraint tournament_results_big_bass_payout_nonnegative_check
  check (big_bass_payout is null or big_bass_payout >= 0);

create table if not exists public.tournament_aoy_points (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null
    references public.tournaments(id) on delete cascade,
  place integer not null,
  team text not null,
  anglers jsonb not null default '[]'::jsonb,
  points numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_aoy_points_place_check check (place > 0),
  constraint tournament_aoy_points_points_check check (points >= 0),
  constraint tournament_aoy_points_anglers_array_check check (
    jsonb_typeof(anglers) = 'array'
  ),
  constraint tournament_aoy_points_unique_tournament_place unique (tournament_id, place)
);

create index if not exists tournament_aoy_points_tournament_id_idx
  on public.tournament_aoy_points (tournament_id);

drop trigger if exists tournament_aoy_points_set_updated_at
  on public.tournament_aoy_points;
create trigger tournament_aoy_points_set_updated_at
before update on public.tournament_aoy_points
for each row execute function public.set_updated_at();

alter table public.tournament_aoy_points enable row level security;

grant select, insert, update, delete on table public.tournament_aoy_points to anon;

create policy "Public AOY points are readable"
on public.tournament_aoy_points
for select
to anon
using (true);

create policy "Temporary anonymous AOY point creates"
on public.tournament_aoy_points
for insert
to anon
with check (true);

create policy "Temporary anonymous AOY point updates"
on public.tournament_aoy_points
for update
to anon
using (true)
with check (true);

create policy "Temporary anonymous AOY point deletes"
on public.tournament_aoy_points
for delete
to anon
using (true);

drop policy if exists "Temporary anonymous tournament results deletes"
  on public.tournament_results;
create policy "Temporary anonymous tournament results deletes"
on public.tournament_results
for delete
to anon
using (true);

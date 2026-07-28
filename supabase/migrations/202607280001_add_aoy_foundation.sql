create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  name text not null,
  slug text not null unique,
  regular_season_start_date date,
  regular_season_end_date date,
  championship_start_date date,
  championship_end_date date,
  membership_sales_open boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_year_reasonable_check check (year between 2020 and 2200),
  constraint seasons_name_not_blank check (btrim(name) <> ''),
  constraint seasons_slug_not_blank check (btrim(slug) <> ''),
  constraint seasons_regular_dates_check check (
    regular_season_start_date is null
    or regular_season_end_date is null
    or regular_season_end_date >= regular_season_start_date
  ),
  constraint seasons_championship_dates_check check (
    championship_start_date is null
    or championship_end_date is null
    or championship_end_date >= championship_start_date
  )
);

create unique index if not exists seasons_one_active_idx
  on public.seasons (is_active)
  where is_active = true;

drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at
before update on public.seasons
for each row execute function public.set_updated_at();

alter table public.tournaments
  add column if not exists season_id uuid,
  add column if not exists event_type text not null default 'regular_season';

alter table public.tournaments
  drop constraint if exists tournaments_season_id_fkey,
  add constraint tournaments_season_id_fkey
    foreign key (season_id)
    references public.seasons(id)
    on delete restrict,
  drop constraint if exists tournaments_event_type_check,
  add constraint tournaments_event_type_check
    check (event_type in ('regular_season', 'championship'));

create index if not exists tournaments_season_id_idx
  on public.tournaments (season_id);

create table if not exists public.anglers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  display_name text not null,
  normalized_name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  merged_into_angler_id uuid
    references public.anglers(id)
    on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anglers_first_name_not_blank check (btrim(first_name) <> ''),
  constraint anglers_last_name_not_blank check (btrim(last_name) <> ''),
  constraint anglers_display_name_not_blank check (btrim(display_name) <> ''),
  constraint anglers_normalized_name_not_blank check (btrim(normalized_name) <> ''),
  constraint anglers_not_merged_into_self_check check (
    merged_into_angler_id is null or merged_into_angler_id <> id
  )
);

create index if not exists anglers_normalized_name_idx
  on public.anglers (normalized_name);

create index if not exists anglers_merged_into_angler_id_idx
  on public.anglers (merged_into_angler_id);

drop trigger if exists anglers_set_updated_at on public.anglers;
create trigger anglers_set_updated_at
before update on public.anglers
for each row execute function public.set_updated_at();

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  angler_id uuid not null
    references public.anglers(id)
    on delete restrict,
  season_id uuid not null
    references public.seasons(id)
    on delete restrict,
  status text not null,
  effective_date date not null,
  source text,
  payment_reference text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_status_check check (
    status in ('active', 'cancelled', 'refunded')
  ),
  constraint memberships_unique_angler_season unique (angler_id, season_id)
);

create index if not exists memberships_season_id_idx
  on public.memberships (season_id);

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null
    references public.seasons(id)
    on delete restrict,
  display_name text,
  canonical_member_key text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_canonical_member_key_not_blank check (
    btrim(canonical_member_key) <> ''
  ),
  constraint teams_unique_season_members unique (
    season_id,
    canonical_member_key
  )
);

create index if not exists teams_season_id_idx
  on public.teams (season_id);

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create table if not exists public.team_members (
  team_id uuid not null
    references public.teams(id)
    on delete cascade,
  angler_id uuid not null
    references public.anglers(id)
    on delete restrict,
  member_position smallint not null,
  created_at timestamptz not null default now(),
  constraint team_members_pkey primary key (team_id, angler_id),
  constraint team_members_unique_position unique (team_id, member_position),
  constraint team_members_position_check check (member_position in (1, 2))
);

create index if not exists team_members_angler_id_idx
  on public.team_members (angler_id);

alter table public.seasons enable row level security;
alter table public.anglers enable row level security;
alter table public.memberships enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

grant select on table public.seasons to anon;

drop policy if exists "Public seasons are readable" on public.seasons;
create policy "Public seasons are readable"
on public.seasons
for select
to anon
using (true);

comment on column public.tournaments.season_id is
  'Nullable during the additive rollout; assign existing tournaments through an explicit reviewed backfill.';

comment on column public.tournaments.event_type is
  'regular_season events may award AOY points; championship events do not.';

comment on column public.teams.canonical_member_key is
  'Sorted stable angler UUIDs joined by a delimiter. A solo appearance by one member of an existing two-person team must retain that existing team identity rather than create a solo team.';

comment on table public.memberships is
  'One current membership record per angler and season. Eligibility begins on effective_date and is never inferred from registration selections.';

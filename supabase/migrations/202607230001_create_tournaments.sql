create extension if not exists pgcrypto;

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  lake text not null,
  tournament_date timestamptz not null,
  ramp text,
  launch_type text,
  morning_registration text,
  registration_opens timestamptz,
  registration_closes timestamptz,
  status text not null default 'Scheduled',
  description text,
  hero_image_url text,
  is_featured boolean not null default false,
  show_on_homepage boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text,
  constraint tournaments_status_check check (
    status in (
      'Scheduled',
      'Registration Open',
      'Registration Closed',
      'Postponed',
      'Cancelled',
      'Tournament Day',
      'Results Published'
    )
  ),
  constraint tournaments_registration_window_check check (
    registration_opens is null
    or registration_closes is null
    or registration_closes >= registration_opens
  )
);

create unique index if not exists tournaments_one_featured_idx
  on public.tournaments (is_featured)
  where is_featured = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at
before update on public.tournaments
for each row execute function public.set_updated_at();

create or replace function public.ensure_single_featured_tournament()
returns trigger
language plpgsql
as $$
begin
  if new.is_featured then
    update public.tournaments
      set is_featured = false
      where id <> new.id and is_featured = true;
  end if;
  return new;
end;
$$;

drop trigger if exists tournaments_ensure_single_featured
  on public.tournaments;
create trigger tournaments_ensure_single_featured
before insert or update of is_featured on public.tournaments
for each row execute function public.ensure_single_featured_tournament();

alter table public.tournaments enable row level security;

drop policy if exists "Public tournament information is readable"
  on public.tournaments;
create policy "Public tournament information is readable"
on public.tournaments
for select
to anon
using (true);

-- TEMPORARY DEVELOPMENT POLICY: remove when Supabase Auth protects Admin Center.
drop policy if exists "Temporary admin tournament updates"
  on public.tournaments;
create policy "Temporary admin tournament updates"
on public.tournaments
for update
to anon
using (true)
with check (true);

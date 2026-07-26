create table if not exists public.tournament_results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique
    references public.tournaments(id) on delete cascade,
  entries jsonb not null default '[]'::jsonb,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_results_entries_array_check check (
    jsonb_typeof(entries) = 'array'
  )
);

create index if not exists tournament_results_published_at_idx
  on public.tournament_results (published_at desc);

drop trigger if exists tournament_results_set_updated_at
  on public.tournament_results;
create trigger tournament_results_set_updated_at
before update on public.tournament_results
for each row execute function public.set_updated_at();

alter table public.tournament_results enable row level security;

grant select, insert, update on table public.tournament_results to anon;

create policy "Published tournament results are publicly readable"
on public.tournament_results
for select
to anon
using (published_at is not null);

-- TEMPORARY DEVELOPMENT POLICIES: INSECURE FOR PRODUCTION.
-- Replace anonymous writes with authenticated Admin policies before launch.
create policy "Temporary anonymous tournament results creates"
on public.tournament_results
for insert
to anon
with check (true);

create policy "Temporary anonymous tournament results updates"
on public.tournament_results
for update
to anon
using (true)
with check (true);

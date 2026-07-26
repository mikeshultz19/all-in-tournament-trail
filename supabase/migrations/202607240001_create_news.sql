create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  content text not null,
  featured_image_url text,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_title_not_blank check (btrim(title) <> ''),
  constraint news_title_length_check check (char_length(title) <= 100),
  constraint news_summary_length_check check (
    summary is null or char_length(summary) <= 200
  ),
  constraint news_slug_not_blank check (btrim(slug) <> ''),
  constraint news_content_not_blank check (btrim(content) <> ''),
  constraint news_content_length_check check (char_length(content) <= 500)
);

create index if not exists news_admin_order_idx
  on public.news (is_pinned desc, created_at desc);

create index if not exists news_tournament_id_idx
  on public.news (tournament_id);

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

alter table public.news enable row level security;

grant select, insert, update, delete on table public.news to anon;

-- TEMPORARY DEVELOPMENT POLICIES: INSECURE FOR PRODUCTION.
-- These policies allow the current unauthenticated Admin development workflow
-- to manage every announcement.
-- Remove all four policies and revoke anon write privileges when Supabase Auth
-- and verified AITT Admin authorization policies are implemented.
drop policy if exists "Temporary anonymous news reads"
  on public.news;
create policy "Temporary anonymous news reads"
on public.news
for select
to anon
using (true);

drop policy if exists "Temporary anonymous news creates"
  on public.news;
create policy "Temporary anonymous news creates"
on public.news
for insert
to anon
with check (true);

drop policy if exists "Temporary anonymous news updates"
  on public.news;
create policy "Temporary anonymous news updates"
on public.news
for update
to anon
using (true)
with check (true);

drop policy if exists "Temporary anonymous news deletes"
  on public.news;
create policy "Temporary anonymous news deletes"
on public.news
for delete
to anon
using (true);

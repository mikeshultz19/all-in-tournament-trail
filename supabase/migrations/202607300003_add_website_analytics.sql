create table public.website_analytics_sessions (
  session_id uuid primary key,
  visitor_id uuid not null,
  first_path text not null,
  referrer_domain text,
  utm_source text,
  qr_code text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index website_analytics_sessions_visitor_idx
  on public.website_analytics_sessions (visitor_id);
create index website_analytics_sessions_seen_idx
  on public.website_analytics_sessions (first_seen_at desc);

create table public.website_page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null
    references public.website_analytics_sessions(session_id) on delete cascade,
  page_name text not null,
  path text not null,
  viewed_at timestamptz not null default now()
);

create index website_page_views_page_idx
  on public.website_page_views (page_name, viewed_at desc);
create index website_page_views_visitor_idx
  on public.website_page_views (visitor_id);

create table public.registration_interest (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  email text not null,
  created_at timestamptz not null default now(),
  constraint registration_interest_email_not_blank
    check (btrim(email) <> ''),
  constraint registration_interest_first_name_length
    check (first_name is null or char_length(first_name) <= 80)
);

create unique index registration_interest_email_unique
  on public.registration_interest (email);
create index registration_interest_created_idx
  on public.registration_interest (created_at desc);

alter table public.website_analytics_sessions enable row level security;
alter table public.website_page_views enable row level security;
alter table public.registration_interest enable row level security;

revoke all on public.website_analytics_sessions from public, anon, authenticated;
revoke all on public.website_page_views from public, anon, authenticated;
revoke all on public.registration_interest from public, anon, authenticated;
grant all on public.website_analytics_sessions to service_role;
grant all on public.website_page_views to service_role;
grant all on public.registration_interest to service_role;
grant usage, select on sequence public.website_page_views_id_seq to service_role;

comment on table public.website_analytics_sessions is
  'First-party anonymous visit sessions. Reserved attribution fields support future sponsor, referral, and QR reporting.';
comment on table public.registration_interest is
  'Visitor opt-ins to receive the official registration opening announcement.';

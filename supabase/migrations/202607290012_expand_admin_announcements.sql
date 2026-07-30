alter table public.news
  add column if not exists publish_date timestamptz,
  add column if not exists is_published boolean not null default false,
  add column if not exists link_label text,
  add column if not exists link_url text,
  add column if not exists display_order integer not null default 0;

update public.news
set
  publish_date = coalesce(publish_date, created_at),
  is_published = true
where publish_date is null;

alter table public.news
  add constraint news_link_fields_together_check
    check (
      (link_label is null and link_url is null)
      or (
        btrim(link_label) <> ''
        and btrim(link_url) <> ''
      )
    ) not valid,
  add constraint news_display_order_nonnegative_check
    check (display_order >= 0) not valid;

create index if not exists news_publication_order_idx
  on public.news (
    is_published,
    display_order,
    publish_date desc
  );

revoke insert, update, delete on table public.news from anon, authenticated;

drop policy if exists "Temporary anonymous news creates"
  on public.news;
drop policy if exists "Temporary anonymous news updates"
  on public.news;
drop policy if exists "Temporary anonymous news deletes"
  on public.news;

grant select, insert, update, delete on table public.news to service_role;

comment on column public.news.publish_date is
  'Scheduled public publication timestamp. Published homepage queries also require is_published = true.';
comment on column public.news.display_order is
  'Ascending homepage display priority; lower values appear first.';

-- Simplify announcements to one title and one plain-text content field.
-- Existing content is preserved before the obsolete topics column is removed.

drop policy if exists "Published announcements are publicly readable"
  on public.news;
drop policy if exists "Published news articles are publicly readable"
  on public.news;

drop index if exists public.news_public_order_idx;

alter table public.news
  drop constraint if exists news_topics_array_check,
  drop constraint if exists news_status_check,
  drop constraint if exists news_title_length_check,
  drop constraint if exists news_content_length_check,
  drop column if exists topics,
  drop column if exists status,
  drop column if exists published_at;

alter table public.news
  add constraint news_title_length_check
    check (char_length(title) <= 100) not valid,
  add constraint news_content_length_check
    check (char_length(content) <= 500) not valid;

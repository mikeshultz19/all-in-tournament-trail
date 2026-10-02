-- Results are written through server-side tournament workflows only.
-- Do not expose direct anonymous or authenticated table writes.

alter table public.tournament_result_entries enable row level security;
revoke all on table public.tournament_result_entries from anon, authenticated;

drop policy if exists "Public can read published tournament results" on public.tournament_result_entries;
create policy "Public can read published tournament results"
on public.tournament_result_entries
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.tournaments tournament
    where tournament.id = tournament_result_entries.tournament_id
      and tournament.status = 'Results Published'
  )
);

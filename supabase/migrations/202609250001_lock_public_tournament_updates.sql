-- Tournament content is public to read, but only the authenticated Admin
-- server actions may update it. The original anonymous update policy was a
-- temporary development exception and must not remain in a live database.

drop policy if exists "Temporary admin tournament updates" on public.tournaments;
revoke insert, update, delete on table public.tournaments from anon;


-- Server-side announcement reads use the Supabase service_role client.
grant select on table public.news to service_role;

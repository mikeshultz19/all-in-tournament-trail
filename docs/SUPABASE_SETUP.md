# Supabase Setup

Updated: 2026-07-23

Supabase provides the project's PostgreSQL database. Supabase Auth and Storage
are planned but are not implemented.

## Environment variables

The server client reads:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

Use the current publishable key as the anonymous/public key. Never document or
commit real values. Never expose a secret or service-role key to browser code.
Restart Next.js after changing environment variables.

## Link and migrate

Use the project's npm-based CLI invocation:

```bash
npx supabase login
npx supabase link
npx supabase db push --dry-run
npx supabase db push
```

The dry run previews pending migrations. The final command applies them to the
linked hosted project. Do not recreate migration columns manually.

The initial applied migration is:

```text
supabase/migrations/202607230001_create_tournaments.sql
```

## Seed

If the current CLI setup does not expose a working seed command:

1. Open the hosted Supabase project's SQL Editor.
2. Run `supabase/seed.sql`.
3. Verify `public.tournaments` contains the `lake-fork-open-2026` row.

The seed is idempotent by slug. It was manually run for the current hosted
project.

## Verify access

Verify:

- `public.tournaments` exists.
- Row Level Security is enabled.
- The public read policy exists.
- Lake Fork Open can be read by the application's anonymous server client.

The initial missing table-level permission was corrected with:

```sql
grant usage on schema public to anon;
grant select on table public.tournaments to anon;
grant update on table public.tournaments to anon;
```

Grants make an operation available to a role; RLS determines which rows that
operation may affect. Both layers must permit a request.

## Development-only write policy

The migration includes `Temporary admin tournament updates`, and the `anon`
role has table-level `UPDATE` used only while Auth is absent. The privilege
permits the role to attempt an update; the RLS policy separately controls the
rows/requests that may update. Both are required for the current workflow and
neither makes anonymous writes production-safe.

AITT Admin Center Tournament Information reads and updates have been tested
successfully against the hosted project. Saved changes persisted after refresh.
This verifies read/update only; tournament creation and deletion are not
verified.

When Supabase Auth is implemented, revoke anonymous `UPDATE` and replace the
temporary policy with authenticated Admin policies.

## Troubleshooting

- Missing environment variables: set both names above and restart Next.js.
- Table permission error: verify schema usage, table privileges, and RLS
  policies separately.
- Missing seed row: run the repository seed in the SQL Editor.
- Migration drift: preview with `npx supabase db push --dry-run`; do not patch
  hosted columns manually.

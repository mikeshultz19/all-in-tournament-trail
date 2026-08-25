Version: 1.2
Last Updated: August 25, 2026

# Supabase Setup

Supabase provides PostgreSQL, Auth, and Storage. The application uses protected
Admin routes, server-authorized actions, durable registration/review
infrastructure, Working and Official Results, payout closeout, AOY, and
Championship projections. Hosted grants, RLS, RPC permissions, and Storage
policies still require periodic verification.

Environment identity is strict: staging project `vcjhufuklqwvnqmarpqi` is
loaded from `.env.local` and production project `qrmnglzylrrdhcvashmx` from
`.env.production.local`. `npm run dev` uses staging. Never print credentials,
mix project data, or apply a production migration without backup, migration
list, dry-run, pending-SQL inspection, and explicit approval.

## Environment variables

The trusted elevated server client reads:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Browser/Auth clients read:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Local values belong in `.env.local`, which must never be committed. In
production, `SUPABASE_SERVICE_ROLE_KEY` remains a Cloudflare Secret and must not
appear in `wrangler.jsonc`. Never place an elevated credential in a
`NEXT_PUBLIC_*` variable, documentation, logs, or browser code. Restart the
local Next.js process after changing environment variables.

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

Apply all checked-in migrations in order. Do not run old demo/Lake Fork seed
instructions against production. Use only an explicitly approved, current
season data procedure and verify the target project before any write.

## Verify access

Verify:

- `public.tournaments` exists.
- Row Level Security is enabled.
- The public read policy exists.
- Public pages can read only the intended public projections.
- Logged-out callers cannot perform protected Admin mutations.
- Service-role-only RPCs are unavailable to anonymous and normal browser
  clients.
- Admin Auth, import/reconciliation, publication, correction, reset, AOY, and
  Championship actions succeed only through their protected server boundaries.

Grants make an operation available to a role; RLS determines which rows that
operation may affect. Both layers must permit a request.

Historical migrations may show earlier permissive development grants. Do not
copy those grants into a current environment. Evaluate effective hosted grants
and policies after the complete migration chain, and revoke any unintended
anonymous INSERT/UPDATE/DELETE access.

AITT Admin Center Auth and protected operational workflows exist. Tournament
Information read/update is verified; this does not imply that tournament
creation or deletion is approved.

## Troubleshooting

- Missing environment variables: set the appropriate server and public/Auth
  names above and restart Next.js.
- Table permission error: verify schema usage, table privileges, and RLS
  policies separately.
- Missing production schedule/data: stop and use the approved current data
  restoration procedure; do not run a demo seed.
- Migration drift: preview with `npx supabase db push --dry-run`; do not patch
  hosted columns manually.


---
For an overview of the project, begin with **00_START_HERE.md**.

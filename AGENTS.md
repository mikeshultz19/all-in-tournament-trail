# All-In Tournament Trail Agent Instructions

## Read first

- Start with `docs/DOCUMENTATION-INDEX.md`, then read the current document for
  the area being changed. Official Rules and waiver text require explicit approval.
- Follow `docs/MasterSiteMap.md`. Reuse existing routes and components; keep
  solutions simple enough for one administrator to maintain.
- Current stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Cloudflare
  Workers/OpenNext, and Supabase PostgreSQL/Auth/Storage. Prisma is not used.

## Environment safety

- `.env.local` is staging-oriented. Local development must use Supabase project
  `vcjhufuklqwvnqmarpqi`.
- Production uses Supabase project `qrmnglzylrrdhcvashmx` and the guarded
  production environment loaded by `scripts/deploy-production.mjs`.
- Never casually relink the Supabase CLI to production. Production linking,
  data changes, or migrations require explicit approval and exact target
  verification. Never alter production data to make a staging test pass.
- Never commit or print credentials, API keys, environment files, or private
  customer/payment data.

## Data and application rules

- Tournament Information is authoritative for tournament display fields.
  Public Schedule and Featured Tournament views must consume database fields
  rather than tournament-specific constants.
- Use the active-season schedule where a current editable/public schedule is
  required. Do not expose obsolete, seasonless, or demo records through those selectors.
- Validate logic-dependent data at the server write boundary. Public reads must
  fail safely; malformed optional data must not crash a public page or open a
  registration path.
- AITT never publishes revenue or gross receipts. Public `TOTAL PAID OUT TO
  ANGLERS` uses completed closeout `total_paid_cents`, with the six payout
  categories summed only as a fallback and never double-counted.

## Change discipline

- Inspect `git status` and the relevant diff before staging. Preserve unrelated
  work and create isolated commits.
- Unless explicitly requested, exclude `.env*`, `supabase/.temp/**`, logs,
  backup scripts, staging SQL, generated output, and unrelated assets.
- Before handoff, run focused tests, `npx tsc --noEmit`, changed-file lint,
  `npm run build`, and `git diff --check` in proportion to the change.
- Production deploys use `npm run deploy`; do not bypass the staging-project
  guard or deploy directly from unreviewed mixed changes.

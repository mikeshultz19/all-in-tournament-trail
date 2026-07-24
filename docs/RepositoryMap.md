# Repository Map

Updated: 2026-07-23

The approved public hierarchy is in [MasterSiteMap.md](MasterSiteMap.md).

## Routes

Public routes include `/`, `/schedule`, `/results`, `/results/[slug]`,
`/register`, `/how-it-works`, `/rules`, and `/liability-waiver`.

AITT Admin Center routes include `/admin`, `/admin/tournament`,
`/admin/announcements`, `/admin/conditions`, and `/admin/results`. An
`/admin/sponsors` placeholder may remain, but Sponsors are not a dashboard card
or Website Readiness item.

## Tournament data

- `supabase/migrations/202607230001_create_tournaments.sql` — implemented
  schema, constraints, triggers, RLS, and current policies
- `supabase/seed.sql` — idempotent Lake Fork Open seed
- `lib/supabase/server.ts` — server-only Supabase client
- `lib/tournaments.ts` — server-only tournament data access
- `types/tournament.ts` — shared tournament and form types
- `data/tournaments.ts` — legacy/public compatibility data while remaining
  public integrations are completed and verified

The Admin Center reads tournaments from Supabase. Homepage and schedule
integration remain tracked as in progress.

## Admin components

`components/admin/` contains the shared Admin header, user menu, Current
Tournament selector/card, Website Readiness, management cards, Last Updated
metadata, and Tournament Information form.

## Other data

- `data/tournamentResults.ts` — results placeholders
- `data/aoyStandings.ts` — AOY placeholders
- `data/sponsors.ts` — public sponsor data, separate from tournament readiness

## Documentation entry points

- `README.md`
- `docs/ProjectStatus.md`
- `docs/SUPABASE_SETUP.md`
- `docs/SECURITY_NOTES.md`
- `docs/ADMIN_CENTER_WORKFLOW.md`
- `docs/DataModel.md`
- `docs/DevelopmentRoadmap.md`
- `docs/CHANGELOG.md`

Historical audits are retained for context and labeled when they no longer
describe current state.

# Repository Map

Last updated: 2026-07-29

## Routes

Public: `/`, `/contact`, `/how-it-works`, `/liability-waiver`, `/register`,
`/register/confirmation`, `/registrations`, `/results`, `/results/[slug]`,
`/rules`, `/schedule`, `/standings`, and `/watch`.

Admin: `/admin`, `/admin/login`, announcement list/create/edit, member
list/create/detail/export, settings, conditions, sponsors, tournament
information/reset, legacy results, and Tournament Manager
import/insurance/photos/publish/success.

API: `/api/registrations/quote`.

## Main modules

- `proxy.ts`, `lib/admin-auth.ts`, `lib/supabase/auth-server.ts` — Admin
  session and authorization.
- `lib/supabase/server.ts` — server-only service-role data client.
- `lib/tournaments.ts`, `lib/tournament-registrations.ts`, `lib/results.ts`,
  `lib/news.ts`, `lib/aoy-standings.ts` — live public/server data.
- `lib/seasons.ts`, `lib/anglers.ts`, `lib/memberships.ts`, `lib/teams.ts`,
  `lib/admin-members.ts` — identity and membership foundation.
- `lib/weighfishParser.ts`, Tournament Manager routes — import and publication.
- `lib/result-payouts.ts` — authoritative payout normalization and totals.
- `lib/tournament-reset.ts` and migration `202607280012` — scoped reset.
- `types/database.ts` — manual partial database typing; not a complete generated
  representation of every table, RPC, relationship, or Storage bucket.

## Compatibility/static data

`data/tournaments.ts` remains a presentation/registration compatibility model
used by adapters and tests. `data/registration.ts`, `data/watch.ts`, and
`data/sponsors.ts` are active. `data/aoyStandings.ts` and
`data/tournamentResults.ts` are demo/test compatibility sources and do not
override live public Supabase queries.

The exact inventory and retained orphan candidates are in
[CURRENT_STATE_AUDIT_2026-07-29.md](CURRENT_STATE_AUDIT_2026-07-29.md).

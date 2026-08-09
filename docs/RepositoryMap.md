# Repository Map

Last updated: 2026-08-08

## Routes

Public: `/`, `/aoy-points`, `/bass-stack`, `/contact`, `/faq`,
`/how-it-works`, `/insurance-pot`, `/liability-waiver`,
`/no-forward-facing-sonar`, `/privacy`, `/register`,
`/register/confirmation`, `/registrations`, `/results`, `/results/[slug]`,
`/rules`, `/schedule`, `/sponsors`, `/standings`, `/terms`, and `/watch`.

Admin: `/admin`, `/admin/login`, announcements, analytics and registration
interest, members, Registration Review, settings, conditions, sponsors,
Rules/FAQ, Tournament Information/reset, Results, and Tournament Manager
prepare/import/reconciliation/insurance/closeout/photos/publish/success.

API: `/api/registrations/quote`, `/api/registration-interest`, and page-view
analytics.

## Main modules

- `middleware.ts`, `lib/admin-auth.ts`, `lib/supabase/auth-server.ts` — Admin
  session and authorization.
- `lib/supabase/server.ts` — server-only service-role data client.
- `lib/tournaments.ts`, `lib/tournament-registrations.ts`, `lib/results.ts`,
  `lib/news.ts`, `lib/aoy-standings.ts` — live public/server data.
- `lib/seasons.ts`, `lib/anglers.ts`, `lib/memberships.ts`, `lib/teams.ts`,
  `lib/admin-members.ts` — identity and membership foundation.
- `lib/weighfishParser.ts`, import evidence/reconciliation modules, and
  Tournament Manager routes — Working Results import and review.
- `lib/official-results.ts` and Official Results migrations — transactional
  publication, immutable snapshots, and authorized correction.
- `lib/on-site-closeout.ts`, Insurance modules, and Tournament Manager closeout
  — payout preparation, checks, and financial reconciliation.
- `lib/aoy-engine.ts` and `lib/championship-qualification.ts` — persisted,
  rebuildable season projections from Official Results.
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

The dated [2026-07-29 audit](history/CURRENT_STATE_AUDIT_2026-07-29.md) is historical
and must not override this map or the current implementation.

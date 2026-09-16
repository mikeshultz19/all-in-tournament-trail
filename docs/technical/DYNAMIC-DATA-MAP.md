# Dynamic Data Map

Last verified: 2026-09-15

This is a developer trace. [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md)
controls business and operating rules.

| Feature | Authoritative source/write path | Public or Admin read path | Key invariant |
| --- | --- | --- | --- |
| Active schedule | Active season plus its `tournaments` rows through `getActiveSeasonSchedule()` | Schedule, Tournament Information selector, registration choices, Admin tournament context | Chronological current-season records only; seasonless legacy/demo rows do not enter the editable schedule selector. |
| Current public tournament | Active schedule selected by `getNextUpcomingTournament()` / active operational selection | Homepage Featured Tournament, Early Registration Status, `/registrations` | Legacy `is_featured` alone does not override operational selection. |
| Tournament display data | Selected `public.tournaments` row, updated by Tournament Information | Featured Tournament and Schedule through `toPublicTournament()` and `getTournamentDisplay()` | Do not reconstruct stored display fields from constants. |
| Public entries | Confirmed `tournament_registrations` scoped to tournament UUID | `/registrations` and homepage count | Never mix tournament IDs or expose private fields. |
| Registration | Server quote, verified Square completion, durable registration RPC | `/register`; Admin Registration Review and preparation | Only verified `COMPLETED` payment activates an entry and assigns its sequential number. |
| Confirmation email | Persistent registration email outbox claimed after durable completion | Resend adapter, retry processing, authorized review | Delivery state is durable and idempotent; staging recipients must pass the allowlist. |
| Membership/identity | Canonical anglers/memberships plus immutable tournament snapshots | Members, Registration Review, result review | Historical eligibility uses tournament-time evidence, never today's membership alone. |
| Official field | Final WeighFish CSV imported into Working Results | Tournament Manager import/review | Working rows stay private; duplicate non-null registration ownership is blocked. |
| Payout/closeout | Verified results plus combined payout/Insurance calculation and closeout | Tournament Manager payout/closeout | Completed `total_paid_cents` contains all six payout categories exactly once. |
| Official Results | `publish_official_results` transaction and publication snapshot | `/results`, result detail, Winner's Circle | Only verified ready rows publish. |
| AOY | Published Official Results and historical eligibility into rebuildable season projection | Admin calculation and public standings | Best five of eight and idempotent recalculation. |
| Championship | Official participation snapshots into separate Competitive-Record projection | Admin projection/readers | Five eligible appearances; separate from AOY. Public registration gate remains pending. |

## Tournament Information field mapping

| Database field | Admin source | Public consumers | Display behavior |
| --- | --- | --- | --- |
| `tournaments.name` | Tournament Name | Featured Tournament title and event identity | Displayed separately from lake. |
| `tournaments.lake` | Lake | Featured Tournament lake and Schedule image overlay | Schedule overlay always uses lake, not marketing name. |
| `tournaments.ramp` | Ramp | Featured Tournament and Schedule | Missing values use the established public fallback. |
| `tournaments.hours` | Hours text input | Featured Tournament and Schedule | Displayed verbatim; blank becomes `TBA` where the shared display helper is used. |
| `tournaments.stop_fishing` | Stop Fishing text input | Featured Tournament and Schedule | Display-only text; never fabricate a time. |
| `tournaments.launch_type` | Launch Type text input | Featured Tournament, mobile details, Schedule, registration confirmation | Shared adapter/display mapping; no tournament-specific constants. |
| `tournaments.morning_registration` | Morning Registration input | Featured Tournament, mobile details, Schedule, registration operations and confirmation | Logic-dependent canonical `HH:mm`; strict save validation. Public formatting may suppress a leading zero. Invalid data fails closed and must not crash the homepage. |
| `tournaments.presented_by` | Presented By text input | Desktop and mobile Featured Tournament presenter line | `text NOT NULL DEFAULT 'AITT'`; application also falls back to `AITT` for blank/legacy data. |

The Admin selector and save action remain tournament-ID scoped. Selecting a new
tournament remounts the form, and a successful save returns to that tournament.

## Reset and publication protections

- Tournament Preparation can be undone only when protected downstream state is absent.
- Reset Payout Calculations removes only unpublished closeout/current Insurance state.
- Official Results corrections use authorized, audited paths and rebuild dependent projections.

## Environment boundaries and keepalive

- Staging: `vcjhufuklqwvnqmarpqi`, loaded by `.env.local` for local development.
- Production: `qrmnglzylrrdhcvashmx`, loaded by the ignored production environment.
- `scripts/deploy-production.mjs` rejects staging configuration during production deploys.
- `.github/workflows/staging-supabase-keepalive.yml` invokes
  `scripts/staging-keepalive.mjs` once daily or by manual dispatch. The script
  accepts only the staging origin, explicitly refuses production, performs a
  GET-only one-row tournament read, times out safely, and logs no secrets or rows.

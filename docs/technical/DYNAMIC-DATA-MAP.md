# Dynamic Data Map

Last verified: 2026-08-25

This is a developer trace. [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md)
controls business and operating rules.

| Feature | Authoritative source/write path | Public or Admin read path | Key invariant |
| --- | --- | --- | --- |
| Current public tournament | Eligible `tournaments` selected by `getNextUpcomingTournament()` | Homepage spotlight, Early Registration Status, `/registrations` | Legacy `is_featured` does not control these views; registration availability is independent. |
| Public entries | Confirmed `tournament_registrations` scoped to current tournament UUID | `/registrations` and homepage count | Never mix tournament IDs or expose private fields. |
| Registration | Server quote, verified Square completion, durable registration RPC | `/register`; Admin Registration Review and preparation | Only `COMPLETED` payment activates an entry and assigns its sequential boat/registration number. |
| Membership/identity | Canonical anglers/memberships plus immutable tournament snapshots | Members, Registration Review, result review | Historical eligibility uses tournament-time evidence, never today's membership alone. |
| Official field | Final WeighFish CSV imported into Working Results | Tournament Manager import/review | Working rows stay private; duplicate non-null registration ownership is blocked. |
| Payout/closeout | Verified results plus combined payout/Insurance calculation and closeout | Tournament Manager payout/closeout | Completed `total_paid_cents` contains all six payout categories exactly once. |
| Official Results | `publish_official_results` transaction and publication snapshot | `/results`, `/results/[slug]`, Winner's Circle | Only verified ready rows publish; active unresolved review blocks, cancelled/inactive review does not. |
| AOY | Published Official Results and historical eligibility into rebuildable season projection | Admin Calculate/Recalculate and public standings | Eligible rerank, 200 descending, zero weight 10, best five of eight, idempotent. |
| Championship | Official participation snapshots into separate Competitive-Record projection | Admin projection/readers | Five eligible physical participations; separate from AOY. Public registration gate remains pending. |

## Reset and publication protections

- Tournament Preparation can be undone only when current protected downstream
  state is absent.
- Reset Payout Calculations removes the unpublished closeout and current
  unpublished Insurance result; published Insurance history remains protected.
- Official Results are never edited through a display workaround. Authorized
  corrections rebuild dependent AOY and Championship projections.

## Environment boundaries

- Staging: `vcjhufuklqwvnqmarpqi`, loaded by `.env.local` for `npm run dev`.
- Production: `qrmnglzylrrdhcvashmx`, loaded by `.env.production.local`.
- The production wrapper rejects staging configuration. Never print secrets or
  mix data between environments.

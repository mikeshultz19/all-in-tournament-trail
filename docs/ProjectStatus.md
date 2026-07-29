# Project Status

Version: 1.1
Last verified: 2026-07-29

This is the current implementation summary. Historical reports are snapshots,
not current-state evidence.

## Implemented

- Supabase-backed homepage Featured Tournament, schedule, registrations,
  announcements, Results archive/detail, public standings, and Winner's Circle.
- Supabase Auth login/logout, persistent sessions, `/admin/:path*` route
  protection, active-Admin metadata checks, and independent Server Action
  authorization.
- Seasons, anglers, memberships, stable teams, team members, Members
  pagination/search/export/create/detail/deactivate/guarded-delete, and Admin
  Settings active-season selection.
- Tournament Operations dashboard; preparation, registration, WeighFish
  import, insurance review, photo upload, publication, and tournament-scoped
  reset interfaces.
- Shared payout rule: public `TOTAL PAID OUT TO ANGLERS` is Bronze + Silver +
  Gold + Insurance only.
- Public AOY queries include only rows belonging to tournaments whose status is
  `Results Published`.
- The active 2026–2027 schedule contains eight immutable numbered Regular
  Season tournaments from November 1, 2026 through May 16, 2027, followed by
  the separate, unnumbered two-day Championship on June 12–13, 2027 (lake TBD).

## Incomplete or unsafe

- Checked-in migrations retain anonymous write grants/policies on tournaments,
  news, registrations, results, and AOY rows.
- `/admin/results` is a second publication/editor workflow and can update
  already-published results.
- Tournament Manager publication writes results and tournament status in
  separate operations; rollback is not guaranteed.
- AOY points use name arrays and per-angler aggregation rather than stable team
  UUIDs, membership reconciliation, eligible-field reranking, full tie
  breakers, and stored calculation provenance.
- Championship qualification calculation/persistence is absent.
- WeighFish identity reconciliation to stable anglers/teams is absent.
- Sponsor content remains static and `/admin/sponsors` remains a placeholder.
- Production deployment, DNS, database policy state, Storage policies, and a
  full disposable-tournament workflow have not been verified end to end.

## Validation on 2026-07-29

- `npm run lint`: passed with 4 warnings.
- `npx tsc --noEmit`: passed after stale tests were reconciled.
- `npm test`: 44 files and 263 tests passed.
- `npm run build`: passed; all current App Router routes compiled.

See [CURRENT_STATE_AUDIT_2026-07-29.md](CURRENT_STATE_AUDIT_2026-07-29.md)
for the complete evidence and launch blockers.

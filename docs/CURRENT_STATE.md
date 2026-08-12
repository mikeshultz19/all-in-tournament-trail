# AITT Current State

Last verified: 2026-08-10

## Current Readiness

AITT's public site and authenticated Admin Center are deployed, and the
repository implements the tournament workflow from protected WeighFish import
through reviewed identity ownership, payout closeout, Official Results, AOY,
and Championship qualification. It is not yet cleared for unrestricted
production operation: the migration chain still leaves anonymous tournament
updates available, hosted database and Storage policy state needs direct
verification, and the complete workflow still requires a recorded disposable
tournament simulation. Square-backed public registration and online membership
creation are intentionally not live.

## Resolved Former Blockers

- **Admin authorization — resolved in the application.**
  [`middleware.ts`](../middleware.ts) fails closed for protected Admin routes,
  [`lib/admin-auth.ts`](../lib/admin-auth.ts) rechecks active Admin access in
  server actions, and [`lib/supabase/server.ts`](../lib/supabase/server.ts)
  keeps service-role access server-only.
- **Duplicate Results editing — resolved.** The legacy
  [`/admin/results`](../app/admin/results/page.tsx) screen points operators to
  Tournament Manager, and its [actions](../app/admin/results/actions.ts) reject
  save/reset mutations. Tournament Manager is the publishing authority.
- **Official Results publication — resolved in implementation.** Migration
  [`202607290006`](../supabase/migrations/202607290006_add_official_results_workflow.sql)
  publishes through one database function, creates Official entries, updates
  tournament status, records a publication snapshot/audit, and prevents direct
  mutation. Migration
  [`202607290007`](../supabase/migrations/202607290007_add_official_results_historical_snapshot.sql)
  adds historical ownership snapshots. Corrections use the protected,
  reason-required audited path in
  [`correction-actions.ts`](../app/admin/results/correction-actions.ts); they
  are not casual republishing.
- **Stable-team AOY — resolved in implementation.** Stable Competitive Records
  come from migration
  [`202607290001`](../supabase/migrations/202607290001_add_competitive_record_foundation.sql).
  The [AOY engine](../lib/aoy-engine-core.ts) and migration
  [`202607290008`](../supabase/migrations/202607290008_add_aoy_engine.sql) own
  points by Competitive Record, snapshot eligibility, preserve DQ/no-show
  behavior, cover regular-season tournaments 1–8, and count the best five.
- **Championship qualification — implemented.** The
  [qualification service](../lib/championship-qualification.ts), migration
  [`202607290009`](../supabase/migrations/202607290009_add_championship_qualification_engine.sql),
  and protected [Admin actions](../app/admin/results/championship-actions.ts)
  persist rebuildable stable-team projections. Qualification requires five
  eligible appearances; no-shows and DQs receive no appearance credit.
- **Transactional WeighFish replacement — resolved in implementation.** The
  Official Results database workflow replaces tournament-scoped Working
  Results transactionally; migration
  [`202608020004`](../supabase/migrations/202608020004_add_import_verification_and_reset.sql)
  adds verification and audited reset protection.

## Remaining Launch Work

- **Anonymous database writes — partially resolved.** Later migrations revoke
  anonymous writes to registrations, Results, AOY, and news, and protect their
  RPCs. However migration
  [`202607230001`](../supabase/migrations/202607230001_create_tournaments.sql)
  still grants anonymous `UPDATE` through the permissive `Temporary admin
  tournament updates` policy, with no checked-in later revocation. Revoke it,
  then prove logged-out writes fail against the effective hosted schema.
- Verify effective hosted grants, RLS, RPC permissions, service-role secret
  boundaries, and Storage read/write/delete policies. Repository inspection
  cannot establish hosted policy state.
- Complete and record the disposable end-to-end tournament simulations in the
  [Launch Test Plan](knowledge-base/AITT-LAUNCH-TEST-PLAN.md), including Admin
  denial paths, import retry/replacement, manual identity review, DQ persistence,
  closeout, publication, audited correction, AOY, and Championship rebuilds.
- Keep online registration disabled unless and until Square checkout,
  callbacks, idempotent payment finalization/recovery, confirmations, and
  payment email pass sandbox-to-production testing. Online membership creation
  depends on that same verified payment boundary.

## Operational Testing Still Required

- Browser, mobile/tablet/desktop responsive, accessibility, and production
  smoke coverage.
- Storage upload/read/delete policy tests and winner-photo workflow tests.
- Backup/restore and failure-recovery rehearsal.
- Realistic identity-review cases: import support and stable ownership exist,
  but ambiguous WeighFish identities correctly require Admin review; the
  system is not fully automatic by design.

## Intentionally Deferred / Post-Launch

- Live WeighFish synchronization; CSV import remains the supported boundary.
- Application-managed Admin invitations, MFA, password expiry, and recovery.
- Broader monitoring and accessibility refinements beyond launch acceptance.

## Historical Context

The [2026-07-29 Current-State Audit](history/CURRENT_STATE_AUDIT_2026-07-29.md)
accurately records an earlier repository state. Its blocker list is retained
as dated history and is superseded by this current repository-backed status.

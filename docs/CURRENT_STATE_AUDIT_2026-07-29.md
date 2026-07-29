# Current-State Audit — 2026-07-29

## Executive summary

AITT is a Next.js 16 App Router application using React 19, TypeScript,
Tailwind CSS 4, Vitest, and Supabase PostgreSQL/Auth/Storage. Public and Admin
routes compile. After stale tests were reconciled, all 44 test files and 263
tests pass.

It is not production-ready. Critical blockers are broad anonymous database
writes, two Results publishing/editing paths, non-atomic/mutable publication,
name-based AOY instead of stable-team AOY, no WeighFish identity
reconciliation, and no Championship qualification generator.

## Repository state

- Branch: `main`
- Baseline HEAD/origin: `5f4064b`
- Recent commits: `5f4064b`, `c1b136c`, `e5f9b12`, `bbda433`, `3b97e3c`
- Pre-existing uncommitted `lib/admin-last-updated.ts` was preserved.
- No commit or push was performed.

## Architecture and inventory

- `app/`: Server Components, Server Actions, route handlers, and dynamic
  Results detail routing.
- `proxy.ts` and `lib/admin-auth.ts`: persistent Supabase session plus active
  Admin checks.
- `lib/supabase/server.ts`: server-only service-role data client.
- `components/`: public and Admin presentation.
- `lib/`: data access, workflow, validation, payout, time, and normalization.
- `data/`: active configuration/presentation models plus isolated demo/
  compatibility data.
- `types/database.ts`: manual partial types, not complete generated schema.

Public routes: `/`, `/contact`, `/how-it-works`, `/liability-waiver`,
`/register`, `/register/confirmation`, `/registrations`, `/results`,
`/results/[slug]`, `/rules`, `/schedule`, `/standings`, `/watch`, and
`/api/registrations/quote`.

Admin routes: `/admin`, `/admin/login`, announcement list/new/edit, conditions,
member list/new/detail/export, legacy results, settings, sponsors, tournament
detail/reset, and Tournament Manager import/insurance/photos/publish/success.

Checked-in tables: `tournaments`, `news`, `tournament_results`,
`tournament_registrations`, `tournament_aoy_points`, `seasons`, `anglers`,
`memberships`, `teams`, `team_members`, `tournament_result_entries`, and
`tournament_reset_log`.

## Completed features

- Live Featured Tournament, schedule, registration list, announcements,
  Results archive/detail, standings, and Winner's Circle.
- Admin login/logout, persistent session, route protection, and action checks.
- Seasons, members, stable-team schema, member search/pagination/export/create/
  detail/deactivate/guarded delete, and active-season Settings.
- Tournament Operations, preparation, registration, WeighFish import,
  insurance, photos, publish UI, and scoped Tournament Reset.
- Shared public payout semantics: Bronze + Silver + Gold + Insurance only.
- Public AOY loaders restrict data to `Results Published` tournaments.

## Incomplete features and code risks

### Security

- Migrations retain anonymous writes on tournaments, news, registrations,
  results, and AOY rows. Protected UI paths do not prevent direct API writes.
- `proxy.ts` fails open if Supabase Auth environment variables are absent.
- Public/server loaders broadly use service-role access, bypassing RLS.
- Storage policy state was not verified against hosted Supabase.
- No client import of the service-role key was found.

### Results and tournament workflow

- `/admin/results` overlaps Tournament Manager and can mutate published data.
- `saveTournamentResults()` upserts, so Official Results are not immutable.
- publication saves Results and tournament status in separate operations.
- legacy Results saves tournament metadata/status before Results.
- import replacement is delete-then-insert, not one database transaction.
- the reset RPC is correctly tournament-scoped and transactional for database
  rows, but Storage cleanup occurs afterward and Championship data does not
  exist to recalculate.
- `displayResultsPayout()` contains a mojibake em dash (`â€”`).

### Membership, identity, AOY, Championship

- Add Member is atomic and First Eligible Tournament is stored independently
  from administrative Effective Date.
- stable team tables/canonical keys exist, but imported result names are not
  reconciled to them.
- `createTeam()` uses compensating deletion rather than one transaction.
- AOY aggregates each display name, not stable teams; ties fall back
  alphabetically.
- membership eligibility/reranking, zero-weight/no-show/DQ rules, solo
  continuity, wins/Top-10/weight/recent-finish tie breakers, calculation
  snapshots, and deterministic recalculation are missing.
- Championship qualification calculation/persistence is missing and remains
  conceptually separate from AOY.

### Data access and performance

- Results and AOY archive reads are batched; no obvious public N+1 was found.
- membership eligibility can issue a second tournament query per call and
  should not be used entry-by-entry in a future AOY engine.
- incomplete database types require unsafe casts and weaken drift detection.
- homepage `force-dynamic` makes its `revalidate` directive ineffective.
- direct anonymous registration-table reads can expose columns that the public
  UI deliberately omits.

## Customer-facing and homepage audit

The build compiled every route and static link tracing found valid internal
targets. Sponsors remains intentionally disabled in the public header because
no approved public route exists.

Current homepage order is Hero, Featured Tournament area, AOY Race, Winner's
Circle. Upcoming Schedule and the old AOY widget are gone. The live AOY Race
is one desktop row ordered 2nd, 3rd, 1st, 4th, 5th, with first place centered
and no top/bottom divider. Winner's Circle dimensions are fixed. Header spacing
starts the hero below fixed navigation so the NO FFS artwork top is visible.

Public loaders provide empty/error fallbacks. Automated browser testing across
mobile/tablet/laptop/wide widths, keyboard traversal, console capture, and live
hosted data was not completed; build/static review cannot certify those items.

## Suspected orphans

Removed with high confidence after repository-wide reference searches:

- `lib/admin-checklist.ts`: superseded static checklist, zero references.
- `components/TournamentStatusAnnouncement.tsx`: superseded, zero references.
- `components/admin/WebsiteReadiness.tsx`: superseded by Operations steps,
  zero references.

Retained:

- `public/images/lakes/cedar-creek.jfif`: no source reference, but database
  image URLs can reference it.
- `.agents.zip`, `lib.zip`, `types.zip`: tracked archives; purpose uncertain.
- `.next-dev.stdout.log`, `.next-dev.stderr.log`: tracked logs; owner approval
  is needed before removing tracked history.
- demo/seed scripts and compatibility data: referenced by tests or explicit
  developer commands.
- `components/PaymentAnnouncement.tsx`: no runtime import, but tests/brand
  documentation still reference the fallback.
- public assets generally: database-configured URLs prevent conclusive
  non-use from source imports alone.

## Documentation reconciliation

Updated current sources: `README.md`, `docs/ProjectStatus.md`,
`docs/RepositoryMap.md`, `docs/SECURITY_NOTES.md`,
`docs/DevelopmentRoadmap.md`, `docs/DATABASE_DESIGN.md`,
`docs/WeighFishIntegration.md`, `docs/DecisionLog.md`, and this audit.

Historical reports such as `docs/RepositoryAudit.md` remain dated snapshots.
Other owner/process documents may preserve future-state prose; Project Status
and this audit supersede them for implementation state.

## Validation and failing-test history

Baseline:

- `git status --short`: pre-existing `M lib/admin-last-updated.ts`.
- `git diff --check`: passed with a line-ending warning on that file.
- `npm run lint`: passed with 4 warnings (two unused announcement action
  parameters and two unused image URL variables).
- `npx tsc --noEmit`: failed only in stale tests for announcement scope,
  Tournament fixtures, and old WeighFish row types.
- `npm test -- --reporter=dot`: 6 files/10 tests failed; 253 passed.
- `npm run build`: passed; all App Router routes compiled.

After proving current behavior and reconciling tests:

- `npx tsc --noEmit`: passed.
- `npm test -- --reporter=dot`: 44 files and 263 tests passed.

Test stderr still records expected Supabase-not-configured fallback logs during
environment-free homepage rendering tests; they are not failures.

## Launch and tournament-operation blockers

1. Revoke anonymous writes and verify hosted grants/RLS/Storage.
2. Fail closed when Admin Auth configuration is missing.
3. Establish one atomic, immutable Official Results publishing path.
4. Reconcile WeighFish participants to stable angler/team IDs.
5. Implement the authoritative AOY engine.
6. Implement Championship qualification separately.
7. Run a disposable tournament through reset, setup, registration, close,
   import, reconciliation, photos, publish, AOY, qualification, retry, and
   reset.
8. Complete browser/responsive/accessibility and production smoke tests.

## Recommended testing order

1. Verify/apply migrations in a non-production Supabase project.
2. Prove logged-out direct writes fail table by table.
3. Test all three Admins plus inactive/non-Admin denial.
4. Create and reset a disposable tournament.
5. Exercise member/non-member, solo/team, and duplicate registrations.
6. Import a representative WeighFish export twice.
7. Reconcile identities/eligibility after that feature exists.
8. Publish once and verify Results/homepage/Winner's Circle/AOY/Championship.
9. Prove published data rejects mutation.
10. Reset and prove permanent member/team/season records remain.

## Launch Readiness Phase 1 addendum

Phase 1 created:

- `docs/DOCUMENTATION-INDEX.md`
- the eight operator files under `docs/knowledge-base/`
- `docs/technical/DYNAMIC-DATA-MAP.md`

The operator material explicitly distinguishes working screens from proven
end-to-end capability. Public membership finalization, Admin-created
registration, stable identity reconciliation, atomic immutable publication,
authoritative AOY, and Championship qualification are marked as blocked launch
tests rather than documented as working.

### Deleted AOY component confirmation

`components/AOYStandings.tsx` remains deleted. Repository-wide search found no
runtime, build, test, script, migration, dynamic-import, or current-document
dependency on it. Mentions in `docs/RepositoryAudit.md` are intentionally
retained historical statements. The active AOY reader is
`lib/aoy-standings.ts`; homepage and Standings import that module.

### Additional orphan review

No additional files were deleted in Phase 1. `PaymentAnnouncement.tsx`, static
AOY/Results compatibility data, demo scripts, tracked archives/logs, and
unreferenced public images remain because tests, scripts, documentation,
database-configured paths, or unknown archival purpose prevent conclusive
deletion.

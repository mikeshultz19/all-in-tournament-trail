# Production Release Checklist

> **WARNING:** A clean build does not prove production database compatibility. Application
> code must not be deployed before every required production schema change has been
> explicitly approved and applied.

Use this checklist for every production release. The release must use one exact reviewed
commit, never a dirty staging workspace.

## Risk-Based Validation Matrix

Release isolation is universal; validation depth is risk-based. Every tier still requires
a clean production-based release workspace, exact isolated commit and diff review,
unrelated-work exclusion, explicit deployment approval, and an affected-page/workflow
smoke test.

### Tier 1 — Low Risk

Examples: text or label changes; spacing, colors, and cosmetic styling; moving or removing
an existing UI component without changing its logic; static public content.

Required:

- [ ] Clean production-based release workspace and exact isolated commit/diff review.
- [ ] Confirm no schema or logic dependencies.
- [ ] Changed-file lint or TypeScript when relevant to the changed file.
- [ ] Successful production build/deployment.
- [ ] Quick smoke test of the affected page.
- [ ] Explicit deployment approval.

Not normally required: full regression suite, database checks, migration review, tournament
workflow rehearsal, or unrelated end-to-end tests.

### Tier 2 — Moderate Risk

Examples: new UI behavior; forms, filters, exports, or state transitions; workflow changes
without schema changes; noncritical calculations; multiple coupled components.

Required:

- [ ] All universal release-isolation checks.
- [ ] Focused automated tests.
- [ ] TypeScript validation and changed-file lint.
- [ ] Production build and `git diff --check`.
- [ ] Manual staging verification.
- [ ] Affected-workflow smoke test.
- [ ] Explicit deployment approval.

### Tier 3 — High/Critical Risk

Examples: database migrations/schema; authentication/authorization; registration or
attendance state; WeighFish CSV parsing/import; result reconciliation; payouts/check
writing; AOY points; Championship eligibility; production data manipulation.

Required:

- [ ] All universal release-isolation checks.
- [ ] Production schema compatibility review and production backup for database work.
- [ ] Migration-history review, safest available dry run, exact approved migration list,
      and verified execution order.
- [ ] Focused and regression tests, TypeScript, changed-file lint, production build,
      and `git diff --check`.
- [ ] Full staging rehearsal with representative data and manual outcome review.
- [ ] Production smoke tests plus confirmed rollback target and procedure.
- [ ] Separate explicit approval for migrations and deployment.

Important lessons:

- A clean build does not prove production database compatibility.
- A simple change can still be unsafe if released from a dirty workspace.
- Low-risk changes require fewer tests, but never bypass release isolation.
- High-risk validation should focus on the affected workflow rather than indiscriminately
  running unrelated checks.
- Commit/push approval and production-deployment approval are separate.
- Database-migration approval and application-deployment approval are separate.

AITT example:

> Removing Confirm Tournament Preparation from the Registration Review page is Tier 1
> when performed from a clean production baseline. It becomes unsafe if the release file
> or workspace also contains unrelated unfinished functionality.

## 1. Scope and authorization

- [ ] Record the exact user-approved change and current-conversation deployment approval.
- [ ] Confirm database migration approval separately, if applicable.
- [ ] Identify explicitly excluded staging, unfinished, and unrelated work.
- [ ] Record the current branch, worktree, base commit, target environment, and working-tree status.
- [ ] Identify every changed file as current-task work or unrelated existing work.
- [ ] Distinguish uncommitted, committed, pushed, deployed, and migrated states; list staging migrations not applied to production.
- [ ] Confirm approval applies to this exact branch/worktree, commit, scope, and current conversation.

## 2. Clean release branch/worktree

- [ ] Record the current production commit and create a clean branch/worktree from it.
- [ ] Confirm no unrelated modifications, untracked files, secrets, logs, or generated output.
- [ ] Apply only the approved change and keep coupled files together.

## 3. Exact diff inspection

- [ ] Run `git status`.
- [ ] Review staged and unstaged file lists.
- [ ] Review the exact proposed commit diff against the current production commit.
- [ ] Confirm only approved files, hunks, and migrations are included.

## 4. Application/database compatibility

- [ ] Search application code for every referenced production field, function, RPC, and schema object.
- [ ] Confirm each exists in production or has an explicitly approved, already-applied migration.
- [ ] Confirm staging-only schema and SQL are excluded.

## 5. Production backup and migration review

- [ ] Back up production using the established repository procedure.
- [ ] Run `supabase migration list` against the verified production target.
- [ ] Run `supabase db push --dry-run` or the safest equivalent inspection.
- [ ] Show the exact pending migrations and approval for each.
- [ ] Apply only approved migrations, in verified order, confirming each succeeds.

## 6. Validation

- [ ] Run focused automated tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run changed-file lint.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Validate the exact release commit, not a different dirty workspace.

## 7. Pre-deployment approval summary

- [ ] Report exact commit hash.
- [ ] Report exact files and migrations.
- [ ] Report all validation results and warnings.
- [ ] Report database compatibility and expected production impact.
- [ ] Report deployment command/workflow and rollback target/procedure.
- [ ] Stop and wait for explicit final production approval.

## 8. Exact commit deployment

- [ ] Deploy only the approved commit hash with the guarded production workflow:
  `npm run deploy`.
- [ ] Record the Cloudflare Worker deployment/version identifier.

## 9. Public and authenticated smoke tests

- [ ] Check homepage and all affected public routes.
- [ ] Check authenticated Admin login/navigation and affected Admin routes.
- [ ] Verify related workflows, not only the homepage.
- [ ] Check Cloudflare logs for new runtime errors without exposing secrets.

## 10. Rollback procedure

- [ ] Stop further changes if smoke tests fail.
- [ ] Preserve deployment output and error evidence.
- [ ] Roll back to the previous known-good Cloudflare Worker version when safe.
- [ ] Do not apply unapproved migrations or broaden scope as an emergency fix.
- [ ] Re-run public and authenticated smoke tests after rollback.

## 11. Post-release documentation

- [ ] Record commit, deployment/version ID, migration status, smoke-test results, and warnings.
- [ ] Record any incident root cause and rollback details.
- [ ] Update authoritative repository documentation when production state changes.
- [ ] At handoff, report commits, uncommitted files, migration state, completed validation, remaining test gaps, and the next authorized action.
- [ ] Verify the active production deployment/version directly; do not infer it from the production branch.
- [ ] Keep automated-test results separate from actual staging-rehearsal evidence.

## Required isolation example

> If staging contains unrelated unfinished functionality and production approval covers only
> a Registration Review layout change, create the layout commit from a clean
> production-based worktree. Never deploy the staging Registration Review file or staging
> working tree.

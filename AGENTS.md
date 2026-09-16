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

## Production Release Safety

Every production release must follow the mandatory [Production Release Checklist](docs/PRODUCTION_RELEASE_CHECKLIST.md).

### Authorization boundaries

- Never deploy to production without explicit user approval in the current conversation.
- Approval to edit, test, stage, commit, or push is not approval to deploy.
- Approval for one change never authorizes other completed, unfinished, or staging work.
- Production database migrations require separate explicit approval.
- Never apply staging migrations to production to repair an application deployment failure.

### Clean release isolation

- Never build or deploy production from a dirty workspace containing unrelated changes.
- Create a clean branch or worktree from the exact current production commit.
- Apply only the explicitly approved change in that clean release workspace.
- Stage selected hunks when only part of a file is approved; never deploy a mixed file blindly.
- Do not cherry-pick mixed commits. Deploy one exact, reviewed commit hash.
- Keep tightly coupled files together while excluding unrelated work.

### Required preflight inspection

Before requesting production approval, report `git status`, staged and unstaged file lists,
the exact proposed-commit diff against the current production commit, every included file
and migration, database fields/functions/RPCs/schema compatibility, and any unrelated
staging or development work in the source workspace. Explicitly exclude `.env` files and
secrets, `supabase/.temp`, logs, backups, generated artifacts, local test data,
staging-only SQL, unrelated assets/code, and unapproved migrations.

### Validation requirements

Validate the exact release commit, not a different dirty workspace: focused tests,
`npx tsc --noEmit`, changed-file lint, `npm run build`, and `git diff --check`.
Report every warning and failure; do not proceed if a required validation fails.

### Branch, Worktree, and Handoff Transparency

- At the beginning of substantial work, report the current branch, worktree, base
  commit, target environment, and working-tree status.
- Identify every changed file as current-task work or unrelated existing work.
- Clearly distinguish uncommitted, committed, pushed, deployed, and migrated states.
- Report migrations applied to staging but not production.
- Never assume context or approval transfers between conversations, branches, or
  worktrees. Production approval is specific to the exact branch, commit, scope,
  and current conversation.
- At handoff, report commits, uncommitted files, migration state, completed
  validation, remaining test gaps, and the next authorized action.
- Never describe automated tests as a completed staging rehearsal; report actual
  staging rehearsal evidence separately.
- Verify the active production deployment/version rather than assuming the
  production branch reflects production.

### Risk-Based Validation

Release isolation and validation depth are separate concepts. Every production release,
regardless of size, requires a clean production-based branch or worktree, one exact
isolated commit, inspection of the exact production diff, exclusion of unrelated work,
explicit production approval, and a smoke test of the affected production page or workflow.

Testing depth must be proportional to technical and operational risk. Do not run expensive,
unrelated validation merely for appearance; run the smallest meaningful check set. When
uncertain between tiers, use the higher-risk tier. Database, authentication, registration
state, CSV import, reconciliation, payout, AOY, and Championship changes are always
High/Critical. Use the detailed [risk matrix](docs/PRODUCTION_RELEASE_CHECKLIST.md#risk-based-validation-matrix).

Every Tier 3 tournament change must identify affected IDs in the
[Tournament Readiness Checklist](docs/TOURNAMENT_READINESS_CHECKLIST.md). Automated tests
do not replace an actual staging rehearsal. No tournament-critical production deployment
may be approved until affected critical checklist items contain dated evidence and `Pass`
status. Update the checklist as part of the same work.

### Database releases

For approved database changes, back up production using the established repository
procedure, list production migration history, perform a dry run or equivalent inspection,
show the exact pending migrations, and apply only the approved migrations in verified order.
Confirm each succeeds before deploying dependent application code. Application deployment
does not apply Supabase migrations automatically.

### Final approval gate

Before deployment, report the exact commit hash, files/migrations, validation results,
database compatibility, deployment workflow, expected impact, and rollback target/procedure;
then stop and wait for explicit final production approval.

### Deployment and verification

After approval, deploy only the approved commit hash, record the deployment/version ID,
and immediately smoke-test affected public and authenticated routes and related workflows.
If production regresses, restore the previous known-good deployment first. Do not expand
scope or apply unapproved migrations as an emergency workaround. Report root cause,
rollback result, and production health.

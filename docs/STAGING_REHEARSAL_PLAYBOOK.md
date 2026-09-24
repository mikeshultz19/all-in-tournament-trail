# AITT Hosted Staging Rehearsal Playbook

Status: current reusable procedure
Owner: Tournament Director / authorized AITT administrator
Scope: one tournament rehearsal at a time

This playbook defines how to test the implemented AITT lifecycle in hosted
staging. It does not replace governing rules, application contracts, or
tournament-day instructions.

## 1. Purpose and boundaries

Use this playbook for a complete, evidence-based rehearsal of:

`Registration → Payment → Confirmation → Roster → Review → Check-In →
WeighFish Import → Results → Payouts → AOY/Championship → Publication`

The following boundaries are mandatory:

- Use the hosted staging Worker and staging Supabase project only.
- Use Square Sandbox only. Never enter a production payment method or use a
  production Square route.
- Do not access production URLs, projects, credentials, custom domains, or
  databases.
- Do not insert customer-flow records directly into the database. Public
  registrations use the hosted form; hosted application walk-ups use Admin
  **Add Walk-Up**. The real tournament-day field procedure remains the
  WeighFish-owned process documented in [Tournament Operations and
  Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md).
- Mutating rehearsal tests require explicit approval before the test begins.
- Use test identities and an approved staging email allowlist. Never use a
  real participant's private information for a rehearsal fixture.
- Stop immediately when actual results differ from the expected result. Record
  the discrepancy before attempting any correction.
- Preserve historical rows and payment evidence. Do not “clean up” a failed
  test by deleting records.

Governing rules live in [Official Tournament Rules](TOURNAMENT_RULES.md).
Current implementation and human lifecycle ownership live in [AITT
Tournament Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md). Capability
boundaries are in [Capability Contracts](CAPABILITY_CONTRACTS.md).

## 2. What belongs where

| Document | Responsibility |
|---|---|
| [Tournament Readiness Checklist](TOURNAMENT_READINESS_CHECKLIST.md) | What must be ready, release gates, evidence layers, and final status. |
| This playbook | How to execute, measure, stop, preserve, and repeat a hosted staging rehearsal. |
| [AITT Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md) | Current application behavior and the human lifecycle from registration through closeout. |
| [Tournament Operations and Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md) | Tournament Director procedure, practice policy, payment ownership, cancellation, and payout-pot explanation. |
| [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md) | Online form, server validation, Square handoff, persistence, confirmation, and retry behavior. |
| [Payment Operations](PAYMENT_OPERATIONS.md) | Payment evidence, financial controls, exceptions, and manual cancellation/refund handling. |
| [Tournament Disaster Recovery](TOURNAMENT_DISASTER_RECOVERY.md) | Outage continuity, workbook/print fallback, and backup rehearsal boundaries. |
| [Official Results Workflow](technical/OFFICIAL_RESULTS_WORKFLOW.md) | WeighFish CSV import, identity review, official results, and publication. |
| [AOY Specification](AOY_SPECIFICATION.md) and [Championship Engine](technical/CHAMPIONSHIP_QUALIFICATION_ENGINE.md) | AOY points, best-five scoring, and five-of-eight Championship participation. |

Do not copy large sections from those documents into a test record. Link to
the source rule and record only the scenario, expected value, actual value,
evidence, and disposition here.

## 3. Environment verification gate

Complete this table before any mutating scenario. Values are recorded without
secrets, tokens, payment credentials, or private participant data.

| Check | Expected | Actual | Pass/Fail | Evidence/notes |
|---|---|---|---|---|
| Branch | Approved staging integration branch |  |  |  |
| Commit | Approved reviewed commit SHA |  |  |  |
| Worker/version | `all-in-tournament-trail-staging` and deployed version |  |  |  |
| Staging URL | Approved `workers.dev` URL |  |  |  |
| Supabase | `vcjhufuklqwvnqmarpqi` only |  |  |  |
| Square | Sandbox application/location/environment |  |  |  |
| Email | Staging environment and allowlist confirmed |  |  |  |
| Migration state | Expected staging migration history; no unapproved migration |  |  |  |
| Excluded worktree changes | Listed and excluded from the candidate |  |  |  |
| Backup/rollback | Timestamped snapshot exists when a correction or destructive-looking test is planned |  |  |  |

Verify both build-time and runtime bindings where applicable. A binding name
alone is insufficient: classify the target, then perform a safe read-only
health check. Do not print values. If any target is production, stop.

For registration checkout, verify these runtime bindings by name before any
mutating scenario: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, and
`SQUARE_ENVIRONMENT=sandbox`. Verify the protected runtime bindings
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `SQUARE_ACCESS_TOKEN` without displaying their
values. The `NEXT_PUBLIC_*` values used by server/runtime code must not exist
only in the local build environment. A safe quote/configuration smoke check
must return a configured Sandbox handoff, not `missing_configuration` or HTTP
503, and must create no payment attempt, registration, charge, or email.

The staging deployment preflight may satisfy an encrypted-secret requirement
from an authorized local value or from the exact binding name already present
on `all-in-tournament-trail-staging`. Hosted inspection is name-only: secret
values are never retrieved, printed, fingerprinted, replaced, or deleted.
Missing names, an unexpected Worker target, failed inspection, or any operation
that would remove existing secrets is a hard stop. Public runtime variables,
including the Supabase and Square identifiers, must remain explicit in
`wrangler.staging.jsonc`.

## 4. Baseline capture gate

Capture the complete tournament-scoped baseline before creating a test row.
Use the active roster and Financial Summary, then reconcile against the
authoritative staging records. “Actual baseline” must never be guessed.

| Metric | Expected baseline | Actual baseline | Pass/Fail | Evidence/notes |
|---|---:|---:|---|---|
| Active registrations | 15 | 15 | Pass | Read-only staging aggregate; 15 paid |
| Canceled registrations | 2 | 2 | Pass | Canceled history retained |
| Needs Review | 0 | 0 | Pass | No active review rows |
| Walk-ups | 5 | 5 | Pass | Admin walk-up records |
| Checked in / pending | 15 / 0 | 15 / 0 | Pass | Active roster |
| Current memberships | Capture participant-level active count | 18 | Pass | 18 active members among 20 active participants |
| New memberships / money collected | 6 / $240 | 6 / $240 | Pass | Collected membership lines |
| Base / Tournament Entry | 15 / $900 | 15 / $900 | Pass | Active paid rows |
| Bronze | 3 / $120 | 3 / $120 | Pass | |
| Silver | 5 / $500 | 5 / $500 | Pass | |
| Gold | 3 / $1,500 | 3 / $1,500 | Pass | |
| Big Bass | 14 / $280 | 14 / $280 | Pass | |
| Insurance | 7 / $140 | 7 / $140 | Pass | |
| Online | 10 / $2,260 | 10 / $2,260 | Pass | Paid online rows; service fees excluded |
| Cash | 4 / $740 | 4 / $740 | Pass | Walk-up funds |
| Card | 1 / $680 | 1 / $680 | Pass | Walk-up funds; fee treatment verified separately |
| Other | 0 / $0 | 0 / $0 | Pass | |
| Total collected | $3,680 | $3,680 | Pass | Active collected funds |
| Payout funds | $3,440 | $3,440 | Pass | Membership revenue excluded |
| Reconciliation warnings | None | None | Pass | No actionable warnings |
| Highest boat number | Capture current value | 17 | Pass | Active roster |

Save the evidence reference, not a private data export. If a planned data
correction is needed, create a minimum-field rollback snapshot outside Git
before changing data and record its path, size, and checksum.

### Mandatory baseline gate

Do not begin a batch until the baseline is frozen and signed by the rehearsal
operator. Record active, canceled, Needs Review, Membership Dues, and Pending
Check-In counts; every Financial Summary component and total; the public Early
Registrations count; and unexplained-warning count. The public active-entry
count must equal the active registration count, and unexplained warnings must
be zero. A visual screen check alone is incomplete.

## 5. Scenario record format

Every scenario gets one record with all fields below. A scenario is not Pass
until the actual values and evidence are recorded.

| Field | Record |
|---|---|
| Scenario ID | Stable ID, for example `REG-01` or `CANCEL-02` |
| Purpose | Capability or failure path being tested |
| Registration type | Solo, team, online, or walk-up |
| Participant/member setup | Test identities, current/new state, and duplicate/review setup |
| Entry and options | $60 entry, one pot at most, Big Bass, Insurance |
| Payment method | Square Sandbox, Cash, Card, or Other |
| Expected charge excluding processing fee | Exact face-value amount |
| Expected Square charge | Face value plus configured Sandbox service fee, when applicable |
| Expected membership result | New Member, Current Member, or Needs Review |
| Expected roster result | Boat/status/filter/review outcome |
| Expected Financial Summary delta | Each affected count and dollar total |
| Expected email/confirmation | Content, recipient class, delivery/retry expectation |
| Expected review state | No review, possible duplicate, or Needs Review |
| Expected cancellation behavior | Preserve/exclude/revoke behavior, if applicable |
| Actual result | Recorded immediately after the scenario |
| Pass/Fail | No blanks after review |
| Evidence | Screenshot, sanitized log, registration number, or test result reference |
| Cleanup or preservation decision | Preserve approved test data, cancel through Admin, or document an approved rollback |

For a Square scenario, calculate the face-value subtotal before processing and
record the exact displayed fee and final Sandbox amount. Do not call a real
Square refund. For a walk-up, record the selected Cash/Card/Other method and
the expected zero or configured card fee behavior.

### Scenario validation gate

Before each scenario, record the expected count and dollar deltas. After it,
validate every applicable layer before starting another scenario:

- registration status and assigned number;
- participant identity and submitted membership classification;
- current-season active membership, or the actual $40 registration charge or
  supported manual-collection evidence;
- review status and append-only review history;
- Membership Dues queue membership and count;
- check-in eligibility and the reason for any block;
- Tournament Entries roster and All Registrations display;
- every Financial Summary component and total;
- public Early Registrations projection/count;
- confirmation page and email delivery/content, when applicable; and
- cancellation state, payment history, and membership-revocation behavior,
  when applicable.

The visible result is not a pass by itself. Authoritative rows, review
history, financial calculations, and the public projection must agree.

## 6. Strict phased execution

Proceed only when the preceding phase is Pass or the discrepancy is explicitly
documented and approved. A phase gate includes its UI result, authoritative
staging result, and financial/review result where applicable.

1. **Baseline.** Complete Sections 3 and 4; freeze the baseline evidence.
2. **Basic mandatory-membership registrations.** Test new solo, returning
   solo, current/current team, current/new team, and new/new team pricing.
3. **Bronze/Silver/Gold threshold construction.** Add only approved scenarios
   and verify one-pot exclusivity and 1-in-5/1-in-7 threshold calculations.
4. **Membership reconciliation.** Verify participant-level Current Member,
   New Member, and fail-closed Needs Review behavior.
5. **Contact-information update/matching.** Verify a legitimate returning
   member with changed contact details resolves to the same person through the
   supported matching/review flow.
6. **Duplicate/new-angler review.** Trigger possible-duplicate review and
   approve a genuinely new angler through Admin; verify no duplicate identity.
7. **Walk-up Cash/Card/Other.** Use Admin Add Walk-Up and verify each payment
   method, confirmation, fee, roster, and Financial Summary result.
8. **Cancellation of a new member.** Use the roster-level control; verify
   full recorded amount, note, manual refund status, membership revocation,
   and active-operation exclusion.
9. **Cancellation of an existing member.** Verify the pre-existing membership
   remains active and only purchased membership lines would be revoked.
10. **Final roster and financial reconciliation.** Reconcile every active row,
    counts, pots, payment methods, memberships, and warnings.
11. **Exports and printable roster.** Compare CSV, XLSX, print, and DR
    spreadsheet outputs to the locked active roster and historical Canceled view.
12. **WeighFish CSV generation/import.** Generate only after the active roster
    is locked; import through the protected workflow and resolve identity or
    duplicate findings.
13. **Results and payout calculation.** Validate official finishes, zero-weight
    handling, pot eligibility, Insurance, and payout totals.
14. **AOY and Championship verification.** Verify official-position points,
    best five of eight, and five of eight qualifying participation.
15. **Publish/unpublish verification.** Confirm readiness gates, publication,
    public display, and safe unpublish/review behavior.
16. **Final staging acceptance.** Complete signoff in Section 12 and preserve
    the evidence index.

### Batch audit gate

After every 3–5 scenarios, pause and run the complete read-only reconciliation
for the tournament. Reconcile every active and canceled registration
individually, including membership, payment, review, check-in, public
projection, and financial fields. Stop the batch for any unexplained
difference; do not continue while a warning is being informally explained
away.

## 7. Ray Hubbard strategic rehearsal matrix

### Current policy and starting point

| Item | Current rule |
|---|---:|
| Tournament Entry | $60 per registration |
| New seasonal membership | $40 per new angler |
| Returning active member | $0 |
| Bronze / Silver / Gold | $40 / $100 / $500; choose at most one |
| Big Bass | Optional $20; team or solo; two places |
| Insurance | Optional $20; independent of Big Bass and selected pot |

For the first regular-season tournament, use `regular_season_number = 1` as
the authoritative order field. Online scenarios must show Current Member as
disabled, require each angler to explicitly select Purchase Membership, and
expect $40 per angler in the server quote. Verify the safe validation response
for stale Current Member requests before any payment attempt is created.
Tournament two and later retain normal Current Member behavior; Admin walk-ups
are not changed by this online-only rule.

Verified starting baseline: 15 active registrations, 2 canceled, 0 Needs
Review, Bronze 3, Silver 5, Gold 3, payout funds $3,440, 6 new memberships /
$240 collected, total registration funds $3,680, and no reconciliation warnings.

The matrix reaches Bronze 5, Silver 8 (at least 6), and Gold 7. The two
cancellation candidates are separate from active threshold additions and are
not counted toward the final pot totals.

Square examples use 3% of the applicable subtotal plus $0.30. Verify the
actual quote before each submission.

| ID | Setup and path | Entry/options | Method | Face value | Square charge | Expected result |
|---|---|---|---|---:|---:|---|
| STRAT-B1 | New solo; approved fresh identity | $60 + Bronze $40 + Big Bass $20 + membership $40 | Online Sandbox | $160.00 | $165.10 | New Member $40; Bronze +1; BB +1 |
| STRAT-B2 | New/new team; one new identity triggers possible-duplicate review, then approve the new identity | $60 + Bronze $40 + Insurance $20 + memberships $80 | Online Sandbox | $200.00 | $206.30 | New Member x2; Bronze +1; Insurance +1; review resolved |
| STRAT-S1 | Returning solo with changed contact information | $60 + Silver $100 + BB $20 + Insurance $20 | Walk-up Cash | $200.00 | N/A | Current Member $0; Silver +1; BB/Insurance +1 |
| STRAT-S2 | Returning team | $60 + Silver $100 | Walk-up Card | $160.00 | Reader fee verified separately | Current Member x2; Silver +1 |
| STRAT-S3 | Mixed current/new team; unmatched current claim first fails closed | $60 + Silver $100 + BB $20 + new membership $40 | Online Sandbox | $220.00 | $226.90 | Temporary Needs Review; resolve before final gate; Silver +1 |
| STRAT-G1 | Returning solo | $60 + Gold $500 + BB $20 + Insurance $20 | Online Sandbox | $600.00 | $618.30 | Current Member $0; Gold +1 |
| STRAT-G2 | New/new team | $60 + Gold $500 + memberships $80 | Online Sandbox | $640.00 | $659.50 | New Member x2; Gold +1 |
| STRAT-G3 | Returning team | $60 + Gold $500 + BB $20 | Walk-up Other | $580.00 | N/A | Current Member x2; Gold +1; BB +1 |
| STRAT-G4 | New solo | $60 + Gold $500 + Insurance $20 + membership $40 | Online Sandbox | $620.00 | $638.90 | New Member $40; Gold +1; Insurance +1 |
| CANCEL-N | New solo; do not count toward thresholds | $60 + Gold $500 + membership $40 | Online Sandbox | $600.00 | $618.30 | Cancel; revoke only purchased membership; preserve payment evidence |
| CANCEL-C | Returning solo; do not count toward thresholds | $60 + Bronze $40 | Walk-up Cash | $100.00 | N/A | Cancel; preserve pre-existing membership |

Before each scenario, record the exact calculated total from the hosted form or
Admin quote. After each, verify the expected delta before starting the next
scenario. If a temporary Needs Review test is not resolved through the
supported review action, stop before final reconciliation.

Expected active result after the non-canceled matrix: Bronze 5, Silver 8,
Gold 7. The matrix covers new solo, new team, returning solo, returning team,
mixed team, Big Bass selected/omitted, Insurance selected/omitted, Online
Sandbox, Cash, Card, Other, changed-contact matching, duplicate review,
unmatched current-member fail-closed review, and both cancellation variants.

## 8. Membership assertions

- **New Member** means membership money was collected by the current
  registration: $40 per new angler.
- **Current Member** means an active seasonal membership exists and the current
  registration collected $0 membership fees.
- **Needs Review** means the required active membership could not be confidently
  verified. It is not an active Non-Member option.
- For an unmatched Current Member claim, **APPROVE NEW ANGLER** creates the
  canonical identity only; the membership review remains unresolved and
  check-in remains blocked.
- The roster-level **MEMBERSHIP DUES** control lists the $40 obligation and
  shows **Collect at check-in**. The Tournament Director collects and tracks
  the money manually, then staff selects **MARK COLLECTED**. This reuses the
  existing membership-confirmation operation, records the confirming Admin and
  timestamp, activates the membership, clears the review, and enables check-in.
- This manual collection creates no Square request, payment transaction, or
  registration price-snapshot change. Its explicit $40 is included in
  Memberships Collected and Total Registration Funds, but not Online Funds or
  Tournament Payout Funds; no collection email is sent.
- No active registration may finish with a Non-Member classification.
- New-member cancellation revokes only memberships purchased through that
  registration's actual membership purchase lines.
- Existing-member cancellation preserves memberships that predated the
  canceled registration.
- Historical membership and payment snapshots are immutable evidence.
- Membership count multiplied by $40 must equal collected membership charges.
- No hypothetical receivable, shortfall, or fake membership revenue may be
  created during a rehearsal.

### Backend invariants

The read-only reconciliation must prove all of the following before a phase or
batch can pass:

- Every active participant is either a verified current-season member or is
  present in an unresolved actionable review/Membership Dues queue.
- A financially counted New Member has a recorded $40 charge or exactly one
  qualifying manual **MARK COLLECTED** marker.
- Manual evidence is deduplicated by `review_id`.
- A resolved identity review cannot leave an untracked membership problem.
- Membership Dues count equals unresolved dues records.
- An unresolved review blocks check-in and states why.
- Financial totals equal registration-level components, with processing fees
  excluded from payout funds.
- Canceled registrations are excluded from every active operational and public
  projection while their history remains available.
- Public active-entry count equals active-registration count.
- No registration disappears from every actionable queue.

Run the reusable read-only command when credentials are safely available:

```powershell
$env:SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
npx tsx scripts/reconcile-staging.ts --project-ref vcjhufuklqwvnqmarpqi --tournament-id <staging-tournament-id>
```

It requires the explicit staging project reference, refuses the production
project, prints no credentials or private participant fields, reports
per-registration consistency and aggregate totals, and exits nonzero when an
invariant fails. It does not load an environment file; provide already
authorized process-scoped `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
values without writing them to the repository.

### Boat #21 regression gate

Keep a synthetic unmatched-Current-Member case in the permanent regression
matrix. Identity approval may create or resolve the canonical Angler while the
membership remains unverified. In that state the registration must remain in
an actionable Membership Dues/review queue, CHECK IN must remain disabled, and
the record must not disappear from every actionable queue. Only valid
membership confirmation or **MARK COLLECTED** with qualifying evidence may
clear the condition. A resolved identity review alone is not proof of a
current-season membership.

After Confirm Match, an eligible active current-season membership must resolve
automatically to Current Member / eligible with $0 membership fees. It must
not become Membership Dues. If the membership is missing, inactive, or
ineligible, the membership issue must remain visible in an actionable
review/dues queue and continue to block check-in.

## 9. Financial assertions

- Active registrations alone contribute to active tournament totals.
- Canceled registrations remain visible with payment history but are excluded
  from active funds, payout calculations, roster counts, exports, results,
  AOY, and Championship operations.
- Recorded payment snapshots reconcile to face-value selections. A warning
  identifies the affected boat/registration and remains actionable.
- Processing fees are excluded from tournament payout funds.
- Online, Cash, Card, and Other totals reconcile to individual paid rows.
- Membership revenue is collected money only.
- Square service fees remain in payment evidence and manual cancellation review,
  but not in payout funds.
- Check-In, search, filters, pagination, and print do not alter money totals.

## 10. CSV, results, and payout rehearsal

Complete this section only after the final active roster is locked.

1. Generate CSV/XLSX/print outputs and reconcile every boat and registration
   number exactly. Canceled boats are absent from operational exports but remain
   in All Registrations/Canceled history.
2. Prepare a WeighFish CSV with normal weighted finishes, one checked-in
   zero-weight entry, canceled boats excluded, and an intentional Big Bass
   result. Test penalties only when explicitly intended.
3. Calculate expected Base, Bronze, Silver, Gold, Big Bass, and Insurance
   winners before import, including places, amounts, and eligible entries.
4. Import through the protected WeighFish workflow. Validate file shape,
   boat/registration matching, duplicates, identity review, zero weight,
   penalties, and official-result approval.
5. Compare imported results with payout calculations. Do not publish while a
   required review remains unresolved.
6. Rebuild AOY from official finishing position: first place 200 points, each
   following place one point fewer, with the best 5 of 8 regular-season scores.
7. Verify Championship participation requires five of eight regular-season
   participations and is separate from AOY rank. Membership is not a second
   current-policy filter.
8. Publish only after readiness gates pass; verify public results and rehearse
   unpublish/review if the supported workflow permits it.

See [Official Results Workflow](technical/OFFICIAL_RESULTS_WORKFLOW.md),
[AOY Engine](technical/AOY_ENGINE.md), and [Championship Qualification
Engine](technical/CHAMPIONSHIP_QUALIFICATION_ENGINE.md).

## 11. Evidence and defect handling

For every failure or unexpected result, record:

| Field | Required content |
|---|---|
| Expected | Exact rule, amount, status, count, or screen result |
| Actual | Sanitized observed result |
| Severity | Blocker, high, medium, low, or observation |
| Impact | Customer, tournament, financial, privacy, or operational effect |
| Reproduction | Scenario ID and ordered steps |
| Evidence | Screenshot, sanitized log, test output, registration number, or checksum |
| Decision | Fix now, human workaround, or defer; include approver |
| Retest | Date, commit/version, result, and remaining issue |
| Correction identity | Commit and deployment containing the correction, if any |

Do not suppress a warning, alter a historical snapshot, or perform an
improvised rollback. A data correction requires explicit approval, a targeted
rollback snapshot, a supported write path, and post-change verification.

### Defect rule

Fixing a defect does not make the failed rehearsal pass. Reestablish a clean
baseline, then repeat the affected scenario from the beginning. The repeated
scenario and complete backend reconciliation must pass without a data repair
or manual backend intervention. Record the failed attempt, correction
identity, new baseline, and retest evidence separately.

## 12. Final staging acceptance

The Tournament Director and partner reviewer sign off each applicable item;
“code exists” is not a signoff.

| Acceptance item | Reviewer | Date | Pass/Fail | Evidence |
|---|---|---|---|---|
| Online registration |  |  |  |  |
| Mandatory membership |  |  |  |  |
| Square Sandbox payment |  |  |  |  |
| Confirmation page/email |  |  |  |  |
| Roster and Check-In |  |  |  |  |
| Membership reconciliation |  |  |  |  |
| Walk-ups |  |  |  |  |
| Cancellation |  |  |  |  |
| Financial Summary |  |  |  |  |
| CSV/XLSX/print exports |  |  |  |  |
| WeighFish import |  |  |  |  |
| Payouts |  |  |  |  |
| AOY |  |  |  |  |
| Championship |  |  |  |  |
| Public results |  |  |  |  |
| Mobile and desktop |  |  |  |  |
| Backup status |  |  |  |  |
| Mike acceptance |  |  |  |  |
| Partner acceptance |  |  |  |  |

The rehearsal is accepted only when all critical applicable rows pass, no
unresolved blocker remains, backup status is recorded, and Mike's acceptance
is explicit. A failed or unavailable authenticated browser, provider, email,
import, or backup layer remains **Needs Rehearsal** under the [Readiness
Checklist](TOURNAMENT_READINESS_CHECKLIST.md).

### Final clean rehearsal gate

Repeat the complete approved scenario matrix without code changes, data repair,
or manual backend intervention. Run the complete reconciliation afterward.
Production recommendation requires zero unexplained warnings, mismatches,
unresolved Membership Dues, or unresolved reviews.

# Official Results Workflow

## Constitutional ownership

Official Results are the permanent historical source for AOY, Championship
qualification, Competitive Record statistics, and tournament history. The AOY
and Championship engines consume this workflow's published snapshots through
separate rebuildable projections.

Tournament sequence uses `season_id` and immutable
`regular_season_number`. Calendar dates are display and scheduling data only.

## Result states

Each tournament has one result status:

- `pending` — no Working Results have been imported;
- `imported` — a WeighFish import created editable Working Results;
- `under_review` — a documented working correction or identity resolution was
  made;
- `ready_to_publish` — reserved for an explicit completed review state;
- `official` — the immutable Official Results snapshot was published.

## Working Results lifecycle

The WeighFish import action calls the service-role-only
`import_working_results` transaction. It replaces only the selected
tournament's Working Results, preserves every original imported row as JSON,
and records the previous and new import in `working_result_audit`.

Working Results may be corrected through `correct_working_result`. Allowed
corrections include placement, team display, fish count, weights, penalties,
canonical Competitive Record, and imported identity mapping. Every correction
requires a reason and Admin UUID. Original imported JSON is never changed.

Working Results remain temporary and cannot appear on public Results pages.

## Publication requirements

`publish_official_results` refuses publication unless:

- the tournament belongs to a season;
- a regular-season event has immutable number 1–8;
- a Championship is unnumbered;
- active/current tournament registrations have no unresolved identity review;
  cancelled/inactive `review_required` history does not block publication;
- at least one Working Result exists;
- placements and weights pass validation;
- every entry has a canonical Competitive Record;
- no non-null registration UUID is assigned to more than one Working Result;
- each Competitive Record belongs to the tournament season;
- any linked imported identity is confirmed against that same record.

Failures return stable `AITT_OFFICIAL_RESULTS_*` domain codes. Registration and
payment remain unaffected.

Historical-review save detects duplicate registration ownership before write,
identifies both affected result rows for manual review, and leaves the database
unique constraint as final protection. Publication readiness repeats this check
before invoking the RPC.

## Official publication

The protected Tournament Manager publish action calls one transactional RPC.
That transaction:

1. locks and validates the tournament;
2. copies every Working Result into `official_result_entries`;
3. freezes placement, weight, penalty, identity, and Competitive Record links;
4. records the Admin and publication timestamp;
5. records a complete publication snapshot;
6. rebuilds the existing `tournament_results` public compatibility record;
7. marks the tournament `official` and `Results Published`.

Public Results pages now require `result_status = official`. Archive ordering
uses season and immutable regular-season number rather than tournament date.

## Immutability

Normal updates and deletes to Official Result rows and public result snapshots
raise `AITT_OFFICIAL_RESULTS_IMMUTABLE`. Working rows also become immutable once
their tournament is Official.

The older direct `/admin/results` save/reset actions no longer publish or
delete results. Tournament Manager is the only authoritative publication
workflow.

## Administrative corrections

Constitutional corrections use the protected `correct_official_result` RPC.
Only specified fields may change, and every correction requires:

- previous complete entry value;
- new complete entry value;
- correction reason;
- Admin UUID;
- timestamp.

The correction and rebuilt public snapshot occur in one transaction. The
original publication snapshot remains unchanged, providing the original
historical record alongside the correction history.

## Security

Import, publication, and correction RPCs are executable only by the service
role. Their server actions independently require an active Admin session.
Anonymous result writes are revoked.

## Remaining limitations

- Imported entries must be linked to canonical Competitive Records before
  publication. The protected import/reconciliation workspace and Registration
  Review supply the controlled resolution mechanisms.
- `ready_to_publish` is available as a workflow state but is not automatically
  assigned; publication performs the authoritative readiness validation.
- Administrative correction/reset must use the protected audited workflow and
  rebuild affected public, AOY, and Championship projections.
- Official publication currently preserves the established public
  `tournament_results` JSON for compatibility while the normalized
  `official_result_entries` table is authoritative.
- Pending migrations must be applied in sequence before this workflow is used.

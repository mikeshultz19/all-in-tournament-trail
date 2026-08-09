# Official Results Historical Snapshot

## Purpose

At this milestone, Official Results preserved the immutable historical facts
required by future competition engines. AOY and Championship calculations were
intentionally outside this foundation and were implemented in later milestones.

## Historical model

Each Working Result is reviewed before publication. The review binds it to the
durable tournament registration and therefore freezes:

- registration UUID
- Competitive Record UUID
- Competitive Record type (`team` or `solo`)
- official numeric placement, when one exists
- original source placement text
- participation status
- reviewed AOY eligibility decision
- the registration's membership snapshot used as evidence
- reviewing administrator and timestamp

Publication rejects a tournament if any Working Result lacks these facts.
Official Results copy them rather than reconstructing them later.

## Participation states

The supported constitutional states are:

- `participated`
- `withdrew_after_start`
- `no_show`
- `disqualified`

Placement and participation are separate. A normal placed result retains its
numeric place. DQ, no-show, and withdrawal source text is retained in
`source_placement`, even when no numeric placement exists. Unsupported
nonnumeric source values stop import for review rather than being guessed.

## Historical eligibility

An authorized administrator records the eligibility decision and reason during
Working Results review. The snapshot embeds the durable registration's
membership snapshot, registration ownership, decision, reason, reviewer, and
review time. Future calculations must read this historical snapshot rather
than current membership rows.

## Import preservation

`original_import_data` remains the unmodified imported row. Corrected official
fields and `source_placement` are stored separately. Neither Working nor
Official correction functions rewrite the raw imported object.

## Corrections and immutability

Ordinary updates and deletes remain blocked after publication. The protected
historical-correction RPC is the only path for changing ownership,
participation, or eligibility facts. It requires a reason and administrator
identity and writes previous and new complete row values to
`official_result_corrections`.

## Limitations

- The current milestone exposes protected server actions and RPCs but does not
  redesign Tournament Manager review screens.
- Existing legacy published JSON snapshots cannot be assigned missing
  historical facts automatically; they require reviewed reconciliation.
- This foundation records AOY eligibility but does not calculate points,
  standings, or Championship qualification.

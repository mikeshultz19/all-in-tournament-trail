# AITT Tournament Lifecycle and Operations

Last reconciled: 2026-08-26

Status: **Primary human-readable authority for implemented AITT business and
operational behavior.**

This document explains the complete tournament lifecycle from public
registration through Official Results, AOY, and Championship qualification.
The [Official Tournament Rules](TOURNAMENT_RULES.md) remain authoritative for
competition rules. Technical documents describe implementation details and
must defer to this document when describing operational behavior.

## 1. Status vocabulary

- **Implemented:** present in application/database behavior and verified in
  staging.
- **Operational procedure:** the Tournament Director's required human steps.
- **Pending:** intentionally not enforced or not ready for production use.
- **Historical:** retained for audit context and not current authority.

## 2. Environments and release safety

| Environment | Supabase project | Local configuration |
| --- | --- | --- |
| Staging | `vcjhufuklqwvnqmarpqi` | `.env.local` |
| Production | `qrmnglzylrrdhcvashmx` | `.env.production.local` |

- `npm run dev` uses staging.
- Never mix staging and production records or credentials.
- Never print, commit, or expose secret keys.
- The production deployment wrapper must reject staging Supabase
  configuration.
- No staging verification authorizes a production deployment or database
  change.

Before an approved production migration:

1. Back up the production database.
2. Run `supabase migration list` against the intended production project.
3. Run `supabase db push --dry-run`.
4. Inspect every pending migration and confirm its environment and ordering.
5. Apply only the explicitly approved production migrations.

Production rollout is incremental. Review cross-cutting files carefully rather
than blindly deploying whole commits containing unrelated work.

## 3. Public schedule, current tournament, and registration

### Registration philosophy

**Registration is permissive. Review is corrective. Payment failure is
blocking.** Membership or identity uncertainty should not unnecessarily block
a valid paid registration. A registration becomes active only after verified
successful payment.

### Independent tournament availability

Each tournament has its own registration lifecycle. Featured/current status
does not determine whether that tournament or another future tournament may
accept registration.

When AITT opens season registration:

- each eligible future tournament may independently be set to `Registration
  Open`;
- multiple future tournaments may be open simultaneously;
- anglers may register for multiple tournaments in advance; and
- every registration remains permanently scoped to its `tournament_id`.

A tournament is publicly registerable only when:

- its lifecycle status is `Registration Open`;
- it is not `Results Published`;
- it is not Cancelled or Postponed; and
- configured capacity remains available.

The final public flow has no automatic close timestamp. Legacy
`registration_opens` and `registration_closes` values may remain stored for
reference, but lifecycle status is authoritative.

Completed tournaments display **REGISTRATION CLOSED**, reject new public
registrations, and cannot be reopened through normal public or Admin
registration controls.

### Current public tournament selector

`getNextUpcomingTournament()` is currently authoritative for:

- the homepage tournament spotlight;
- homepage Early Registration Status; and
- public View Tournament Entries.

Legacy `is_featured` is not authoritative for those public views. Current
tournament selection remains separate from registration availability.

### Public View Tournament Entries

The public page displays registrations only for the current upcoming
tournament returned by `getNextUpcomingTournament()`. It does not provide a
tournament selector or expose every future tournament's entry list. Future
registrations remain stored and Admin-visible until their tournament becomes
the current upcoming event. Registrations from different tournament IDs must
never be mixed.

## 4. Public registration, payment, and numbering

### Authoritative payment sequence

1. Build an authoritative quote.
2. Create a durable registration/payment attempt.
3. Tokenize and submit payment through Square.
4. Verify a `COMPLETED` Square payment.
5. Create the durable active tournament registration.
6. Assign the next Boat/Registration Number.
7. Queue and deliver the confirmation email.

Card/online quotes use the centralized Square Service Fee: 3% of the
chargeable subtotal, rounded to cents, plus a fixed $0.30 per transaction.
Customer-facing itemization uses `SQUARE SERVICE FEE (3%)` and shows only the
calculated dollar amount; the fixed component is an internal calculation and
is not separately displayed. Cash walk-ups have no Square Service Fee.

Payment failure does not create an active registration or consume a boat
number. Attempt and provider history remain available for recovery. Email
failure does not invalidate a successful registration; delivery can be retried.

### Boat and registration numbering

Boat Number = Registration Number = launch order.

- Assign the number only after verified successful completion.
- Failed attempts consume no number.
- Cancelled numbers are preserved and never reused.
- Walkups continue sequentially after online registrations.
- Historical cancelled registrations remain preserved.
- A separate customer confirmation/reference number is not the launch number
  and remains a distinct concern if implemented later.

### Capacity and lifecycle rechecks

Capacity is enforced at payment-attempt creation and again when an attempt is
claimed. Payment processing also rechecks that the tournament is still
`Registration Open`, preventing a stale browser from paying after suspension
or completion.

## 5. Membership and identity

The submitted tournament identity snapshot is authoritative for that
tournament. Canonical Angler, membership, and Competitive Record data support
membership, AOY, Championship qualification, and historical identity.

- Never replace a submitted identity silently from a weak match.
- Strong or uncertain matches may enter review.
- Paid registration remains durable while corrective identity review is open.
- Do not silently remove paid/selected options because identity is uncertain;
  retain and review the evidence according to implemented rules.

Current registration identity-review actions are:

- **SAME PERSON — UPDATE INFO**
- **SAME PERSON — KEEP EXISTING INFO**
- **DIFFERENT PERSON — APPROVE NEW MEMBER**

Historical tournament-time membership and `aoy_eligible` snapshots are
authoritative for historical calculations. Today's membership state must not
retroactively rewrite an old tournament's eligibility.

For member-only Bronze, Silver, Gold, and Insurance selections:

- a Team must satisfy the implemented membership requirements for its
  associated anglers; and
- a Solo entry uses that angler's tournament-time membership status.

## 6. Tournament morning and check-in

The final operational sequence is:

1. Review online registrations, identities, and memberships before tournament
   morning.
2. Print or open the Registration & Check-In roster.
3. Check in online teams and confirm their boat numbers.
4. Register walkups on-site.
5. Assign walkups sequential boat numbers after online registrations.
6. Announce missing preregistered teams before launch.
7. Finalize the field and launch.
8. Reconcile walkups and paper records in AITT.
9. Perform the separate Membership Reconciliation.
10. Ensure the AITT tournament field and WeighFish field match.
11. Reconcile Insurance participation through AITT; WeighFish is not the
    authoritative AITT Insurance workflow.

Registration & Check-In is an operational roster, not the financial/accounting
ledger.

## 7. Tournament Preparation

Tournament Preparation requires confirmation that:

1. registration review is complete and entries needing attention are resolved;
2. tournament-morning paper memberships have been added to the AITT Members
   list.

The confirmations persist in
`prepare_registration_review_complete` and
`paper_membership_reminder_checked`.

Preparation may be re-confirmed after downstream work exists when the
underlying review/roster state remains valid. It cannot be silently unchecked
while protected downstream work exists. Undo warnings appear only after an
attempted protected change, and guards must reflect actual current downstream
state rather than stale history.

## 8. WeighFish import and ownership review

WeighFish is authoritative for scoring and finish data entered during weigh-in.
AITT imports the CSV, validates results, maps rows to tournament registrations
and Competitive Records, calculates AITT-specific payouts, handles Insurance,
publishes Official Results, and calculates AOY/Championship projections.

Reconciliation normalizes case, whitespace, punctuation, and separators before
comparison. Exact normalized matches and a uniquely strong, high-confidence
fuzzy match may auto-match. Plausible but ambiguous, partial, or materially
different identities require Tournament Director review; no weak match is
silently assigned. Every active AITT registration must have a corresponding
imported result, and every imported row must have a viable roster owner.
Missing roster results, unmatched imports, unresolved review rows, and duplicate
registration ownership block Verify Results. The reconciliation summary is
shown in the existing Import/Verify workflow.

A non-null `registration_id` may belong to only one working result in the same
tournament:

- duplicate assignments are blocked before historical-review save;
- conflicts identify the affected place, result, registration, and boat;
- pre-existing conflicts return all affected rows to manual review before the
  publish RPC; and
- the database unique constraint remains final protection.

There is no implemented **Exclude Invalid Result** workflow unless current code
later adds and verifies it. Competitive disqualification must not be used as a
substitute for correcting invalid synthetic/import data.

## 9. Payout and closeout workflow

The implemented flow is:

1. Verify imported results.
2. Review and calculate payouts.
3. Calculate Insurance automatically inside the combined payout/closeout
   workflow.
4. Review every payout/check obligation.
5. Select **APPROVE PAYOUTS**.
6. Complete financial closeout.
7. Publish Official Results.

Insurance is not a separate Tournament Manager operational calculation step.

**Reset Payout Calculations** removes the current unpublished closeout and its
current unpublished Insurance result. Published Insurance history remains
protected. The reset does not remove registrations, memberships, check-ins,
verified results, or published history.

### Implemented payout rules

- Main Tournament payout assignments come from the verified payout source.
- Bronze payout depth is 1-in-5.
- Silver payout depth is 1-in-5.
- Gold payout depth is 1-in-7.
- Big Bass uses the verified stored Big Bass awards.
- Insurance is a true 1-in-5 payout over eligible Insurance entries, with at
  least one paid place whenever entries exist.
- Insurance begins with the first eligible finisher outside the Main
  Tournament payout, skips ineligible/nonmember/uninsured finishers, and
  continues down the standings until all required places are filled.
- Implemented Insurance awards are equal amounts.

Do not invent payout values or infer awards when persisted payout/closeout data
exists.

### Total Paid Out to Anglers

The only public tournament-wide monetary total is **TOTAL PAID OUT TO
ANGLERS**. It includes every actual AITT payout exactly once:

- Main Tournament;
- Bronze;
- Silver;
- Gold;
- Big Bass; and
- Insurance Pot.

The primary authority is the completed closeout's `total_paid_cents`, which is
the sum of the individual payout/check obligations. A six-category sum is a
fallback only. Never add category totals on top of an already aggregated
closeout total. Revenue, fees, gross receipts, sponsor income, administrative
compensation, and retained amounts are not published.

## 10. Official Results and completion

Publication uses verified working results and preserves database protections.
It blocks unresolved `identity_review_status = review_required` only for active
registrations. Cancelled/inactive historical registrations do not block
publication. All working-result historical ownership and eligibility reviews
must otherwise be complete.

After publication:

- status becomes `Results Published` / `official`;
- registration remains permanently closed;
- Schedule displays **REGISTRATION CLOSED**;
- homepage/current public selection advances to the next upcoming tournament;
- registrations, Official Results, payout history, and publication audit remain
  preserved; and
- AOY and Championship recalculation becomes available.

### Public Results presentation

- Contained black/gold trophy-style completion header.
- Maximum 25 standings rows per page while preserving overall places.
- Mobile uses single-column result cards without horizontal scrolling.
- Tablet/desktop retain the approved standings table.
- Mobile shows only applicable Tournament, Bronze, Silver, Gold, and Big Bass
  breakdown rows.
- `Total Won` includes all money for that entry, including Insurance.
- Insurance winners retain the compact **INSURANCE** badge.
- The Insurance amount remains available through `Total Won` and the bottom
  Insurance summary; the duplicate standalone winner-detail list is removed.

## 11. Corrections and disqualification

Supported correction/review actions preserve Official Results history and
rebuild affected AOY and Championship projections. Synthetic staging recovery
is not a normal Tournament Director workflow and must not be documented as
one.

An explicit one-click **Reopen Results** lifecycle action is not currently
implemented. Published corrections are available only through the protected,
reason-required audited correction workflow; working-result corrections and
import reset/replacement remain available before publication.

Competitive disqualification is an explicit audited action. It:

- sets participation status to `disqualified`;
- prevents the entry from receiving Official Result publication credit as an
  eligible competitor under the implemented workflow;
- zeros/restores payout fields through protected audited actions;
- awards no AOY points;
- gives no Championship participation credit; and
- preserves action/history evidence.

Disqualification is not the same as an invalid import correction. The next
clean staging tournament must include an explicit end-to-end DQ test.

## 12. AOY

Official Results and their historical eligibility snapshots are authoritative.
Eligible entries are reranked for AOY without modifying Official Results.

- AOY position 1 earns 200 points.
- Each subsequent eligible AOY position decreases by one point.
- Eligible participating zero-weight entries earn 10 points.
- Ineligible, no-show, and disqualified entries earn 0.
- Only the best five of eight regular-season scores count.
- Additional performances remain retained and visible as Dropped.
- Team and Solo Competitive Records remain separate.
- Recalculation is deterministic and idempotent.
- Protected Official Result corrections rebuild AOY as implemented.

The public AOY page uses compact default rows, expandable Tournament/Lake and
Points detail, Dropped indicators, 25-row pagination, a contained trophy-style
header, and a compact mobile presentation. It does not expose internal
fingerprints, membership reasoning, or audit metadata.

## 13. Championship qualification

Championship qualification is separate from AOY scoring. A Competitive Record
qualifies with five eligible physical participations among the eight numbered
regular-season tournaments.

- Solo qualification belongs to the exact Solo Competitive Record.
- Team qualification belongs to the exact established Team Competitive Record.
- Team and Solo histories cannot be combined.
- A different partner creates a different Team Competitive Record.
- Both anglers do not independently need five personal appearances; the Team
  record needs five eligible physical participations.
- Associated anglers must satisfy applicable membership requirements for the
  historically credited Team participations.
- One established partner may fish alone while the entry remains registered
  under that Team identity, as allowed by the Official Rules.

Current projection sources are:

- `current_championship_qualifications`;
- `current_championship_participations`;
- the supporting run/record/current-projection tables; and
- `replace_championship_qualification_projection`.

**Implemented:** qualification calculation, persistence, recalculation, and
public/Admin status display.

**Pending:** public Championship registration enforcement. Before Championship
registration opens, the public gate must resolve the exact season Competitive
Record, require a current qualified projection, validate record type/canonical
members, and fail closed for missing or unresolved qualification data. There is
no routine qualification override; correct authoritative history and rebuild
the projection instead.

## 14. Admin tournament controls

Granular tournament control is intentional. The Tournament Director may open,
suspend/resume, postpone, or cancel each tournament independently as currently
implemented. There is no requirement for a bulk **Open All Registrations**
control.

Completed and Cancelled tournaments cannot be reopened through the normal
registration-availability action.

### Public sponsor presentation

The public sponsor presentation is separate from tournament operations. Current
public partners are Mad Dawg Graphics & Design, Texas Boat Works, and Tri-Lakes
Tackle Town, each presented as a Premier Sponsor on the Sponsors page. Phoenix
Parts/Fenix Parts is no longer a public sponsor. Sponsor content does not add a
Tournament Manager readiness step.

## 15. Fish length and tournament contact

Tournament-wide fish length rules:

- Largemouth Bass: 14-inch minimum
- Smallmouth Bass: 14-inch minimum
- Spotted Bass: no minimum

Registration-complete emails prominently include:

> AITT TOURNAMENT CONTACT: 817-841-9120 - PLEASE SAVE THIS NUMBER IN YOUR PHONE

## 16. Pre-production release order

1. Database prerequisites
2. Registration core and public registration
3. Registration & Check-In and tournament-morning operations
4. Admin Members and All Registrations
5. Closeout, payouts, and Insurance
6. Results publication and historical review
7. AOY and Championship projections
8. Public cosmetic/UI improvements

Every phase requires focused verification before the next. Do not deploy or
migrate production merely because staging passed.

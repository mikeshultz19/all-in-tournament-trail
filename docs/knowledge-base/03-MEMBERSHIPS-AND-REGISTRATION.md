# Memberships and Registration

The complete rule authority is [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md).

## Operating principle

Registration is permissive. Review is corrective. Payment failure is blocking.
Identity or membership uncertainty may create review work, but it must not erase
a valid completed payment or silently attach a person to a weak match.

Square's verified `COMPLETED` payment is the activation boundary. A failed
attempt creates no active registration and consumes no boat number. Email
failure does not invalidate a completed registration.

## Tournament availability and public entries

Each tournament has its own registration state. Multiple eligible future events
may be open at the same time, regardless of which event is current. Registration
is accepted only when that tournament is open, not published/completed, not
cancelled/postponed, and below capacity. Published events display
**REGISTRATION CLOSED** and cannot be reopened through normal controls.

`getNextUpcomingTournament()` is the authoritative public current-tournament
selector for the homepage spotlight, Early Registration Status, and public View
Tournament Entries. Legacy `is_featured` is not authoritative for those views.
The public entry list shows only that current event; Admin retains every
tournament's registrations.

## Numbers and identity

Online registration assigns a registration number only after verified
successful completion. Boat number, launch time, and stop-fishing time are
provided during check-in. Cancelled registration numbers are not reused, and
walkups continue the sequence. The online confirmation page and email use the
`REGISTRATION NUMBER` contract; the walk-up email intentionally has a separate
introduction.

The submitted tournament identity snapshot remains the historical evidence for
that event. Canonical members and Competitive Records support membership, AOY,
Championship, and history. Review decisions are:

- **SAME PERSON — UPDATE INFO**
- **SAME PERSON — KEEP EXISTING INFO**
- **APPROVE NEW ANGLER** for an unmatched Current Member claim.

This creates the Angler only and leaves the membership review unresolved, so
check-in remains blocked. A roster-level **MEMBERSHIP DUES** control lists the
$40 obligation. The Tournament Director collects and tracks it manually, then
staff selects **MARK COLLECTED** to reuse the existing membership-confirmation
operation. That action records who confirmed collection and when, activates the
membership, and clears the review. It does not process Square payment, change
the price snapshot, increase Financial Summary totals, or send email.
Existing-member, contact, duplicate, and historical membership reviews are
unchanged.

Tournament-time membership and `aoy_eligible` snapshots control historical
calculations; a later membership change cannot rewrite an old event.

Every current angler selects Current Member or Purchase Membership. Returning
active members pay $0; new solo anglers pay $40; current/current teams pay $0,
current/new teams pay $40, and new/new teams pay $80. Bronze, Silver, Gold, and
Insurance are available to every current registered angler; only one of
Bronze/Silver/Gold may be selected, while Big Bass and Insurance are independent
add-ons. An unverified current claim becomes Needs Review. Do not create a
membership shortfall or hypothetical receivable, and do not silently remove a
paid/selected option because identity is uncertain; flag it for review.

Historical non-member records remain readable and their stored historical
eligibility snapshots are not rewritten by current policy.

## Tournament morning

Use the Registration & Check-In roster, provide boat numbers during check-in,
add walkups sequentially, reconcile paper memberships, perform Membership
Reconciliation, and make the AITT field agree with WeighFish. Insurance
participation is reconciled in AITT because WeighFish is not its authoritative
workflow.

## Related documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Official Tournament Rules](../TOURNAMENT_RULES.md)
- [Registration identity review](../technical/REGISTRATION_IDENTITY_REVIEW_QUEUE.md)

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

- **CONFIRM EXISTING PERSON** and keep the All Members record unchanged;
- **APPROVE NEW ANGLER** for a different person; or
- **CANCEL REGISTRATION** when the entry should not remain active.

This creates the Angler only and leaves the membership review unresolved, so
check-in remains blocked. Staff contacts the participant about the $40 seasonal
membership and uses the single **CONFIRM MEMBERSHIP** action. That action
activates the membership, records the Admin confirmation, and clears the review;
check-in then becomes available. If the participant declines, use the existing
Cancel Registration workflow. There is no separate Mark Collected action and no
membership receivable or payment reconciliation workflow inside AITT.
Existing-member and historical membership reviews are unchanged. A contact
mismatch review confirms the identity without editing canonical contact
information; staff can correct the All Members record later if the change
matters.
Repeated or previously canceled registrations are allowed through the normal
membership and payment flow; any rare duplicate is handled administratively
afterward.

Tournament-time membership and `aoy_eligible` snapshots control historical
calculations; a later membership change cannot rewrite an old event.

Every current angler selects Current Member or Purchase Membership. Returning
active members pay $0; new solo anglers pay $40; current/current teams pay $0,
current/new teams pay $40, and new/new teams pay $80. Bronze, Silver, Gold, and
Insurance are available to every current registered angler; only one of
Bronze/Silver/Gold may be selected, while Big Bass and Insurance are independent
add-ons. An unverified current claim becomes Needs Review. Do not block the paid
registration; keep check-in gated and resolve the review with Confirm Membership
or Cancel Registration. Payment Summary reports membership selections and their
$40 equivalent. Payment Recovery is a non-interactive reminder/history only.

Historical non-member records remain readable and their stored historical
eligibility snapshots are not rewritten by current policy.

For online registration, the first regular-season tournament is identified by
`tournaments.regular_season_number = 1`. Every angler must explicitly choose
Purchase Membership; Current Member is shown but disabled with the explanation
“All anglers must purchase their season membership for the first tournament.”
The quote and submission guards enforce the same rule and charge $40 per
angler. Tournament two and later allow the normal Current Member selection, and
Admin walk-ups are unchanged.

## Tournament morning

Use the Registration & Check-In roster, provide boat numbers during check-in,
add walkups sequentially, reconcile paper memberships, perform Membership
Reconciliation, and make the AITT field agree with WeighFish. A walk-up may
save with an informational Needs Review status. The walk-up may still be
checked in because the person is physically present; staff may resolve the
informational membership or identity review before or after check-in. For Solo walk-ups, Angler 2 is disabled
until the entry type is changed back to Team. Insurance
participation is reconciled in AITT because WeighFish is not its authoritative
workflow.

## Related documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Official Tournament Rules](../TOURNAMENT_RULES.md)
- [Registration identity review](../technical/REGISTRATION_IDENTITY_REVIEW_QUEUE.md)

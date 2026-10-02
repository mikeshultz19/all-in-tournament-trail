# Registration Identity Review Queue

## Purpose

Identity uncertainty never prevents a paid registration from being stored.
Registration and payment complete first. Canonical identity review happens
afterward and before the registration is trusted for future official
competition records.

This describes the server-side durable completion boundary used after verified
Square payment. A browser quote cannot invoke or substitute for trusted payment
verification, and only `COMPLETED` payment activates the registration.

This milestone does not publish Official Results or calculate AOY or
Championship qualification.

## Automatic classification

The server evaluates submitted participants against active, unmerged canonical
Anglers. Browser-submitted identity classifications are not trusted.

A normalized email and phone match to the same canonical Angler is a
high-confidence automatic match. A single email-only or phone-only match is
reviewed when the other strong identifier materially conflicts. A completely
new joining member with no plausible canonical match also
continues through the existing transaction.

Email is contact information, not a unique member key. Multiple active Angler
records may intentionally share one email address, such as spouses or family
members. An ambiguous shared-email match is saved and routed to Needs Review;
it is never a registration blocker. Staff may confirm the intended existing
Angler and preserve the shared email, or approve a new Angler. Member-record
cleanup remains a later All Members task.

Review is required when the server finds:

- an exact phone or name that conflicts with the submitted email;
- a possible spelling difference or other uncertain contact match;
- a possible nickname or abbreviated first name;
- an unlinked current-membership claim;
- more than one plausible canonical Angler.

A person who is already in the tournament is not sent to this queue solely for
that reason. If an unusual repeated or duplicate entry is submitted, preserve
the registration and payment and let the Tournament Director resolve it in
Needs Review; do not create a special duplicate-entry workflow.

Name-only, nickname, reversed-name, address-only, and partial matches never
cause automatic merging. Conflicting email and phone identifiers always require
manual review.

## Persistence-first behavior

Clear registrations use `complete_durable_registration`. Review-required paid
registrations use `complete_registration_for_identity_review`.

Both paths are transactional and payment-reference idempotent. The review path
stores:

- the completed registration and payment reference;
- original participant names, email, and phone;
- pricing and policy acceptance snapshots;
- candidate Angler UUIDs and review reasons;
- `identity_review_status = review_required`.

Pending registrations remain visible in the public registration roster. Their
canonical Angler and Competitive Record ownership may remain null until review.
This pending state does not invalidate the registration or payment.

## Admin workflow

`/admin/registration-review` is protected by the existing active-Admin session.
The page can be filtered by tournament and shows only operational identity
information, not payment details.

An Admin's current decisions are:

- **CONFIRM EXISTING PERSON** and retain the canonical All Members record;
- **APPROVE NEW ANGLER** for an unmatched Current Member claim; or
- **CANCEL REGISTRATION** when the entry should not remain active.

The same binary identity decision applies to Solo and Team participants. The
roster does not edit member contact data; corrections belong in All Members.

Unmatched Current Member approval uses the existing transaction-safe identity
resolution, creates the Angler only, and leaves the membership review pending.
The roster-level Membership Dues control exposes the $40 obligation. Staff uses
CONFIRM MEMBERSHIP to record the Admin confirmation, activate the membership,
and clear the review; if the participant declines, Cancel Registration is used.
No Mark Collected or payment-reconciliation action exists. Payment Summary
counts the Joining/Purchasing selection and its $40 equivalent, while Payment
Recovery remains informational. The existing-member, contact, and historical
membership workflows remain separate.
Repeated tournament registrations are rare administrative cases. The
Tournament Director handles them after payment through the same confirm,
approve-new, or cancel decisions.

For a flagged contact mismatch, the Tournament Director confirms the specific
existing angler and keeps the canonical member information as-is. The original
registration contact snapshot remains the submitted historical evidence. If a
canonical phone, address, or other contact correction is actually needed, staff
handles it later from All Members. The review workflow does not add fuzzy
matching, roster-side editing, member merging, or a new audit subsystem;
ambiguous information remains in Needs Review until staff verifies it.

When an Admin confirms an existing Angler for a Current Member claim, the
system must immediately re-evaluate that Angler's current-season membership.
An eligible active membership resolves the membership condition automatically,
refreshes the registration snapshot to Current Member / eligible, leaves
Membership Fees at $0, removes Membership Dues, and enables check-in. Missing,
inactive, or ineligible memberships remain visible in an actionable membership
review and keep check-in blocked. The backend reconciliation must verify this;
the visible Confirm Match result alone is not sufficient.

This is a queue invariant, not merely a display rule: every active participant
must be either a verified current-season member or present in an actionable
review/Membership Dues queue. A resolved identity review with an unresolved
membership condition must remain visible, keep CHECK IN disabled, and identify
the required next action. Valid membership confirmation clears the condition;
no active participant may disappear
from all actionable queues.

After all participants are resolved, the existing validated
`create_competitive_record` function creates or reuses the correct Team or Solo
record. Team and Solo ownership remain separate.

## Audit history

Original registration values are immutable. Each administrative decision
records:

- previous and new review state;
- previous and selected Angler;
- previous and resulting Competitive Record;
- resolution method;
- resolving Admin UUID;
- timestamp;
- optional note.

Reopening adds another history entry rather than deleting the prior decision.

## Tournament completion summary

The Admin dashboard displays:

- completed registrations;
- automatically verified registrations;
- pending reviews;
- resolved reviews.

`areAllRegistrationIdentitiesVerified(tournamentId)` returns whether the active
pending count is zero. Tournament preparation and Official Results readiness use
this evidence; publication refuses unresolved active Registration Review records
but not cancelled/inactive historical review rows.
The queue does not itself open or close registration.

## Email notifications

Email notifications are intentionally excluded. The four-person operating team
uses the Admin dashboard pending count and Registration Review queue.

## Remaining limitations

- Exact phone and exact name conflicts are deliberately reviewed rather than
  silently changing the canonical identity selected by the existing
  email-based Durable Registration workflow.
- Nickname and spelling suggestions are deliberately conservative.
- Admin approval of a new Angler does not automatically create a membership.
- Reopening after Official Results requires the authorized correction/reset
  workflow so historical identity and derived projections remain auditable.
- The migration must be applied before the queue is used.

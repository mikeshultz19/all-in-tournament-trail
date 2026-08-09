# Registration Identity Review Queue

## Purpose

Identity uncertainty never prevents a paid registration from being stored.
Registration and payment complete first. Canonical identity review happens
afterward and before the registration is trusted for future official
competition records.

This describes the server-side durable completion boundary. Live Square
checkout and verified public payment completion are not operational yet; a
browser quote cannot invoke or substitute for trusted payment verification.

This milestone does not publish Official Results or calculate AOY or
Championship qualification.

## Automatic classification

The server evaluates submitted participants against active, unmerged canonical
Anglers. Browser-submitted identity classifications are not trusted.

A single exact normalized email match with no conflicting phone evidence is
clear enough for the existing Durable Registration transaction. A completely
new non-member or joining member with no plausible canonical match also
continues through the existing transaction.

Review is required when the server finds:

- duplicate exact identities;
- an exact phone or name that conflicts with the submitted email;
- a possible spelling difference;
- a possible nickname or abbreviated first name;
- an unlinked current-membership claim;
- more than one plausible canonical Angler.

Similar names, nicknames, reversed names, addresses, and partial matches never
cause automatic merging.

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

An Admin may:

- confirm a suggested existing Angler;
- select a different existing Angler;
- approve the submitted person as a new Angler;
- resolve both members of a Team;
- resolve a Solo participant;
- reopen a previously resolved review.

New-Angler approval uses a transaction lock and rejects an email already owned
by a canonical Angler. The Admin must select that existing Angler instead.

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

`areAllRegistrationIdentitiesVerified(tournamentId)` returns whether the pending
count is zero. Tournament preparation and Official Results readiness use this
evidence; publication refuses unresolved pending Registration Review records.
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

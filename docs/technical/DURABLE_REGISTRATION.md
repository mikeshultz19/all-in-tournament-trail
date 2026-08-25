# Durable Registration

## Architecture decision

AITT retains `public.tournament_registrations` as the single authoritative
registration table. Durable Registration does not introduce a parallel draft,
payment, or registration model.

The public form and authoritative quote remain unchanged. Registration
completion is a separate server-only boundary that may be called only after a
payment integration has independently verified an authorized payment reference
and amount.

The Square checkout and verified completion path now use this boundary. Only a
verified `COMPLETED` payment can invoke durable activation. Production payment
enablement remains a separate controlled release concern; an unverified browser
request never represents payment.

## Transaction

`public.complete_durable_registration` performs the following work in one
PostgreSQL transaction:

1. Locks and validates the tournament and season.
2. Uses normalized email as the deterministic strong identity match.
3. Creates an angler only when no stable email match exists.
4. Validates an existing membership or creates a paid joining membership.
5. Validates First Eligible Tournament against the selected tournament.
6. Creates or resolves the Team or Solo Competitive Record.
7. Captures membership and authoritative price snapshots.
8. Captures the accepted Rules and waiver versions with a server timestamp.
9. Inserts the durable registration with stable angler and Competitive Record
   UUIDs.

Any exception rolls back every write, including new anglers, memberships, and
Competitive Records.

## Idempotency

The verified payment reference is unique. An advisory transaction lock
serializes concurrent retries, and a repeated reference returns the existing
registration.

A separate unique index prevents the same Competitive Record from registering
twice for one tournament.

## Membership trust boundary

Browser-submitted `current`, `joining`, and `non-member` selections are pricing
intent, not proof of eligibility.

Before returning a quote and again before durable completion, the server checks
current and joining claims against the selected tournament's season and the
stored First Eligible Tournament. The transaction repeats the checks before it
writes the snapshot.

First Eligible Tournament ordering uses the immutable
`regular_season_number`, never the tournament calendar date. A postponed event
therefore retains its original eligibility position.

Once payment is verified, completion does not reapply the registration-window
gate. This prevents a payment authorized at the deadline from becoming stranded
if the window closes before the provider callback completes. All structural,
policy, pricing, membership, identity, season, and ownership checks still run.

If more than one active stable angler has the same normalized email, completion
stops with an identity-review error. It does not select or merge either record.

## Security boundary

The completion RPC is executable only by `service_role`. Anonymous insert,
update, and delete access to registrations is removed. Public registration
reads remain available for the existing Early Entries display.

## Deferred payment integration

A future verified Square callback should construct
`VerifiedRegistrationPayment` from Square's server-verified response and call
`completeDurableRegistration`. It must not accept payment status or payment
references asserted only by the browser.

This work does not implement Identity Reconciliation, Official Results, AOY,
Championship qualification, standings, or reporting.

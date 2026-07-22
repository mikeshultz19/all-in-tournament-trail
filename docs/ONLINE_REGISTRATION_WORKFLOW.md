# Online Registration Workflow

**Document Version:** 1.1

**Status:** Approved Phase 1 Workflow; Production Payment Pending

**Owner:** Product Owner

**Audience:**

- Product Owner
- Tournament Director
- Administrators
- Operations
- Developers
- AI assistants

**Purpose:** Define the authoritative Early Online Registration experience,
business boundaries, lifecycle, records, payment handoff, recovery behavior,
and production-readiness requirements for All-In Tournament Trail (AITT).

**Scope:** Early Online Registration created through the AITT website, from
tournament selection through verified Square payment, AITT confirmation,
administrative review, reconciliation metadata, and the night-before handoff
to WeighFish.

**Out of Scope:** Tournament-morning registration, walk-up payment-method
tracking, check-in, boat-flight assignments, weigh-ins, official results, and
live synchronization with WeighFish. Self-service registration changes,
production refunds, authenticated member profiles, and live Square payment are
not part of the current Phase 1 implementation.

**Related Documents:**

- [Official Tournament Rules](TOURNAMENT_RULES.md)
- [Participant Liability Waiver](LIABILITY_WAIVER.md)
- [Payment Operations Manual](PAYMENT_OPERATIONS.md)
- [Tournament Operations and Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)
- [Database Design](DATABASE_DESIGN.md)
- [Project Deployment Checklist](PROJECT_DEPLOYMENT_CHECKLIST.md)
- [Decision Log](DecisionLog.md)
- [Project Status](ProjectStatus.md)
- [How the Website Works](HOW_THE_WEBSITE_WORKS.md)
- [AI Relearn](AI_RELEARN.md)

**Last Updated:** 2026-07-22

> **Authority:** This document is the source of truth for Early Online
> Registration. Financial controls remain authoritative in the Payment
> Operations Manual, and tournament-day rules remain authoritative in the
> Tournament Operations and Registration Process. Unapproved policy language
> is not made final by this workflow.

## 1. Operating Principles

1. Online registration requires immediate successful Square payment.
2. A draft, quote, redirect, or browser message is not a confirmed registration.
3. AITT calculates every authoritative charge on the server from current approved configuration.
4. Square handles payment credentials, authorization, capture, receipts, refunds, and deposits.
5. WeighFish remains the tournament-day operational and official-results system.
6. AITT never offers online cash, Venmo, Stripe, payment at the ramp, an IOU, or an unpaid reservation.
7. A successful Square payment remains recoverable even when the browser closes or confirmation display fails.
8. Price, policy, membership-classification, and payment-reference snapshots preserve what applied at registration time.
9. Names alone never establish membership identity or active status.
10. AITT never stores raw card numbers, CVV values, magnetic-stripe data, or unencrypted payment credentials.

## 2. Responsibility Boundaries

### AITT Owns

- Tournament selection.
- Registration availability and deadlines.
- Team and angler information.
- Membership validation and registration-time classification.
- Registration options and optional pots.
- Server-authoritative pricing calculations.
- Card Processing Fee calculation and disclosure.
- Waiver and policy acknowledgment records.
- Registration status and history.
- Confirmation page and confirmation email.
- Administrative review.
- Refund-status metadata.
- Minimum Square payment and order references required for reconciliation.

### Square Owns

- Card data.
- Apple Pay on supported devices and browsers.
- Other supported payment methods intentionally enabled by AITT.
- Payment authorization and capture.
- Payment receipts and transaction status.
- Refund transaction processing.
- Deposit and settlement reporting.

### WeighFish Owns

- Tournament-Morning Registration.
- The tournament-day roster.
- Check-in.
- Cash or Card payment-method tracking for walk-ups.
- Boat-flight or tournament-day operational assignments where applicable.
- Weigh-ins and scoring.
- Official results and official CSV export.

AITT confirmed online registrations are entered or imported into WeighFish
through the supported night-before process. They do not replace required
tournament-morning check-in.

## 3. Current Implementation Boundary

Phase 1 provides the domain model, configured options, registration form,
client validation, server validation, server-authoritative quote, fee
calculation, review experience, payment-gateway interface, confirmation-page
structure, lifecycle helpers, capacity-hold rules, and focused tests.

The public `/rules` and `/liability-waiver` routes load their content directly
from the corresponding Markdown documents in `docs/`. Registration receives
the current document versions from the same server-side loader, so the public
policy content is not manually duplicated in page components.

Production payment is disabled. The repository currently has no durable
registration database, Supabase client, authenticated Admin Portal, membership
lookup service, Square SDK payment creation, verified Square webhook handler,
or registration confirmation email service. The application must not imply
that a disabled checkout created a registration or attempted payment.

## 4. Registration Entry Points and CTA States

Supported entry points are:

- Tournament schedule: a tournament-specific **Register Online** link.
- Homepage featured tournament: a tournament-specific registration link when open.
- Main site navigation: the Registration page.

There is no approved tournament-detail route or authenticated member dashboard
in the current sitemap, so Phase 1 does not invent either surface.

The CTA is derived from server-side tournament availability:

| State | CTA | Registration allowed |
| --- | --- | --- |
| Open | Register Online | Yes |
| Before configured opening | Registration Opens Soon | No |
| Deadline passed or explicitly closed | Registration Closed | No |
| Configured capacity reached | Sold Out | No |
| Results lifecycle reached | Tournament Completed | No |
| Disabled, postponed, or otherwise unavailable | Registration Unavailable | No |
| Cancelled | Registration Closed | No |

The destination includes the tournament slug. The registration page preselects
that tournament and never silently substitutes another valid tournament.
Tournament locking may be introduced only as an approved product behavior.

## 5. Registration Flow

The responsive Phase 1 page uses a structured single-page flow with a visible
four-step progress sequence:

1. Team Info.
2. Options.
3. Review.
4. Payment.

The page uses one condensed header with the page heading, selected
tournament's Early Registration Deadline, and Estimated Safe Light. On mobile,
those items stack in that order. Tournament-morning instructions and the
verbose Tournament Status announcement are not shown on the registration form;
status remains authoritative for eligibility. The summary continuously shows
tournament, date, registration type, entered angler names, itemized charges,
subtotal, Card Processing Fee, and final total. Payment remains a distinct
action after server review.

### Step 1: Tournament

Display the selected tournament name, lake, venue, effective date, Tournament
Entry price, available options, and eligibility guidance. The deadline and
Safe Light appear once in the condensed page header.
The current approved cancellation/refund policy must be linked when finalized.

Registration is rejected for a missing tournament, a cancelled or completed
tournament, a tournament before its configured opening, after its deadline, at
capacity, or with online registration disabled. The server repeats these
checks immediately before payment creation.

### Step 2: Registration Type and Anglers

Current tournaments support:

- Solo registration with exactly one angler.
- Team registration with exactly two anglers.

Each required angler supplies:

- First name.
- Last name.
- Email address.
- Mobile phone.
- Street address.
- City.
- Two-letter state code.
- ZIP Code or ZIP+4.
- Membership classification: current, purchasing membership, or non-member.

Addresses remain required under the approved tournament operations document
for tax and payout records. They are private. Emergency-contact fields,
membership numbers, boat details, youth designation, team name, and Director
notes are not added because the current approved data model and operating rules
do not establish them as required registration data.

Registration does not require an account. There is no current member login or
profile service, so Phase 1 does not prefill personal information. A claimed
current membership is a registration-time classification pending stable-ID
verification or authorized administrative review. Name matching alone is
never sufficient.

### Step 3: Options

The centralized configuration currently supplies:

| Option | Requirement | Price basis |
| --- | --- | --- |
| Tournament Entry | Required | Per registration |
| Big Bass | Optional | Per registration |
| Insurance Pot | Optional; members only | Per registration |
| Bronze Pot | Optional; members only; mutually exclusive | Per registration |
| Silver Pot | Optional; members only; mutually exclusive | Per registration |
| Gold Pot | Optional; members only; mutually exclusive | Per registration |
| Annual Membership | Added for each angler purchasing membership | Per angler |

Only configured option identifiers are accepted. Tournament Entry cannot be
removed. Optional selections cannot be duplicated. Bronze, Silver, and Gold
are mutually exclusive. Both team members must be current members or purchase
membership for the team to receive member-only benefits under the currently
approved rule.

### Combined Acknowledgment

One required acknowledgment is shown and is never preselected. It links the
official rules and liability waiver and covers tournament policies and
applicable payment terms. Normal form submission confirms the user's intent to
submit the entered information, so there is no separate accurate-information
or Card Processing Fee checkbox.

The persisted design records one acceptance event containing the registration
or draft ID, trusted acceptance timestamp, and all applicable policy versions.
The checkbox copy states the participant's intent to provide an electronic
signature where permitted by law. The liability waiver remains a draft pending
qualified legal review, and final waiver and refund-policy language requires
business and legal approval before production payment.

Waiver Version 1.0 expressly addresses participant responsibility for vessel
operation and on-water decisions, including accidents, weather, navigation,
equipment failure, participant negligence, and third-party conduct. No
tournament schedule or deadline requires unsafe vessel operation, and AITT
cannot continuously supervise every participant. These provisions remain
subject to qualified Texas legal review and applicable-law limitations.

The current submission contract carries `rulesVersion`, `waiverVersion`,
`acknowledgedAt`, and `acknowledgmentAccepted`. The quote boundary validates
the accepted versions, but it does not claim durable storage. Phase 4 must
replace the browser-reported acknowledgment time with a trusted server time
and persist the acceptance before Square payment is enabled.

### Step 5: Review and Authoritative Quote

The review includes tournament, date, venue, registration type, anglers,
membership classifications, selected items, subtotal, Card Processing Fee,
total, and acknowledgment completion.

The browser total is informative. The AITT quote endpoint reloads the selected
tournament and approved configuration, verifies availability and input, and
calculates a new authoritative quote. Client-submitted totals, fee amounts,
and option prices are not accepted as inputs to the calculation.

### Step 6: Payment

After persistence is available, AITT will create a durable pending
registration and payment attempt with a unique idempotency key. AITT then
passes only the server-calculated amount and safe transaction references to
the Square payment adapter. Square's secure UI collects card data and offers
Apple Pay only on supported devices and browsers. Other Square methods appear
only when AITT intentionally enables them.

The server—not a browser redirect—retrieves or receives verified Square status
and transitions the registration. Secrets and access tokens remain server
only. Production and sandbox credentials remain separate.

### Step 7: Confirmation

After verified payment, the confirmation page displays:

- **You're registered.**
- Human-readable confirmation number.
- Tournament, date, and venue.
- Registered anglers.
- Selected options.
- Registration Subtotal, Card Processing Fee, and Amount Paid.
- Paid status.
- Tournament-morning instructions.
- Tournament details, rules, support, and correction paths.

No full card data is displayed. A masked description may appear later only
when supplied safely by Square and approved for the view model. If confirmation
cannot be recovered yet, the page tells a payer who sees a successful Square
transaction not to pay again and to contact AITT for reconciliation.

## 6. Pricing and Rounding

All money uses integer cents. Current prices come from centralized approved
configuration. The server recalculates before both quote and payment creation.

```text
Card Processing Fee = round(subtotal cents × 300 / 10,000)
Total Charged = subtotal cents + Card Processing Fee
```

JavaScript `Math.round` is used on the non-negative integer-cent calculation,
so a half-cent rounds upward. For example, a $60.00 subtotal produces a $1.80
Card Processing Fee and a $61.80 Total Charged. The label is always **Card
Processing Fee**.

Immediately before Square payment creation, the server must revalidate:

- Tournament existence and online-registration enablement.
- Opening time and deadline.
- Cancellation, completion, postponement, and registration status.
- Capacity or active hold.
- Registration format and participant count.
- Required participant fields.
- Membership eligibility.
- Configured options.
- Required acknowledgments.
- Current prices and fee rate.

## 7. Registration and Payment State Model

| State | Meaning |
| --- | --- |
| `draft` | Incomplete or unsubmitted registration work; never confirmed and does not consume capacity. |
| `payment_pending` | Durable validated registration awaiting Square payment; may hold capacity until a trusted expiration. |
| `payment_processing` | Square result is pending or being verified. |
| `paid` | Square payment is verified; confirmation finalization remains in progress. |
| `confirmed` | Payment is verified and the AITT registration is finalized. |
| `payment_failed` | Square reports failure; the registration is not confirmed. |
| `cancelled` | Registration was cancelled under approved authority. |
| `refunded` | Approved Square refund completed for the full applicable amount. |
| `partially_refunded` | Approved Square refund completed for part of the amount. |
| `manual_review` | Conflicting, delayed, duplicate, or uncertain evidence requires authorized review. |

State changes are server controlled and auditable. Payment and registration
states remain distinct in persistent storage even when the application exposes
a combined operational view.

## 8. Registration Record and Price Snapshot

A durable final record includes or references:

- Internal registration ID and human-readable confirmation number.
- Tournament ID and Early Online Registration source.
- Registration type and ordered participant records.
- Registration-time contact snapshot.
- Membership classification for each participant at registration time.
- Selected configured options.
- Currency and itemized integer-cent price snapshot.
- Card Processing Fee rate and integer-cent fee snapshot.
- Total paid.
- Registration and payment statuses.
- Minimum Square payment ID and order or checkout reference when applicable.
- Unique idempotency key.
- Accepted policy identifiers, versions, and timestamps.
- Trusted creation, payment, and confirmation timestamps.
- Confirmation-email status.
- Refund-status metadata and provider reference when applicable.
- Administrative review flags and append-only correction history.

Historical records never reconstruct charges exclusively from current prices.
The snapshot records what was presented and paid.

## 9. Critical Failure and Recovery Behavior

| Failure | Required behavior |
| --- | --- |
| Draft created; payment fails | Mark payment failed; do not confirm; release any hold under its expiration rule. |
| Payment succeeds; browser closes | Verified Square callback or later retrieval finalizes the same durable registration. |
| Confirmation display fails | Confirmation is recoverable by stable registration/payment reference; never request a second payment. |
| Square callback is delayed | Remain processing; retrieve authoritative status or route to manual review. |
| Pay is double-clicked | Disable repeat UI action and reuse the server idempotency key. |
| Browser refreshes during processing | Reload durable state; do not create another payment attempt automatically. |
| Square notification repeats | Record/process the provider event once; never create a duplicate registration. |
| Capacity fills during checkout | Honor a valid active hold or reject before capture; never over-confirm capacity. |
| Price changes during a draft | Expire the quote and require review of the newly calculated total. |
| Payment succeeds; email fails | Keep the registration confirmed; record email failure and permit an authorized resend. |
| Payment and registration disagree | Preserve both records and enter Manual Review; do not silently overwrite history. |

## 10. Capacity and Temporary Holds

Current tournaments do not configure capacity limits. The domain model supports
an optional capacity and confirmed-count check without inventing a current
limit.

When capacity is enabled, production checkout should create a short-lived,
durable hold only after server validation. Active unexpired `payment_pending`
or `payment_processing` holds, plus paid, confirmed, and Manual Review entries,
consume capacity. Drafts, failed payments, cancellations, refunds, and expired
holds do not. Hold creation and final confirmation must use database-level
atomicity or equivalent concurrency protection.

## 11. Confirmation Email

After verified payment, send a confirmation email containing the confirmation
number, tournament, date, venue, anglers, selected options, Total Paid, Card
Processing Fee, registration status, tournament-morning instructions, current
policy link, and correction contact.

The existing Resend usage is limited to the feedback route and is not a shared
registration email service. Phase 2 must add a server-only email adapter,
approved sender configuration, delivery-status metadata, retry behavior, and
an authorized resend action. Email failure never reverses payment or
confirmation.

## 12. Administrative Experience

The repository has no Admin Portal or authentication implementation. Phase 2
must add a protected, server-authorized registration view containing:

- Confirmation number, tournament, type, anglers, and date registered.
- Selected options and price snapshot.
- Payment and registration states.
- Minimum Square payment reference.
- Membership classifications and verification state.
- Confirmation-email status.
- Notes and review flags.

Filters should cover tournament, registration state, payment state,
registration date, angler name, and confirmation number. Admin access requires
authentication, server authorization, and database row-level controls. It must
not include tournament-day check-in; that remains in WeighFish.

## 13. Security and Privacy

- Validate all untrusted input on the server.
- Keep Square secrets, access tokens, signatures, and service credentials out of browser bundles and logs.
- Never persist or log payment tokens, raw card numbers, CVV values, or magnetic-stripe data.
- Use unique idempotency keys for registration/payment creation.
- Verify Square notifications using the exact raw request body and approved signature method.
- Rate-limit payment-sensitive endpoints before production launch.
- Use framework-established origin and request protections for mutations.
- Keep private contact, address, payment, membership, and admin data out of public projections.
- Require server authorization for every administrative read and mutation.
- Sanitize or safely render notes and other user-entered text.
- Separate sandbox and production configuration.
- Preserve a private audit history for material state changes and corrections.

## 14. Accessibility and Responsive Behavior

- Every input has a visible label and associated field-level error.
- Required fields and errors are communicated with text, not color alone.
- Validation moves focus to the first invalid field.
- Progress and status messages use meaningful labels and live semantics.
- Keyboard-only users can select options, acknowledge policies, review, and pay.
- Loading controls announce registration review and prevent duplicate actions.
- Mobile controls have large touch targets and readable text.
- Forms avoid dense mobile columns and horizontal scrolling.
- The desktop sticky summary is non-sticky on smaller viewports and cannot cover controls.
- Payment and confirmation states use specific, actionable public messages.
- The pre-payment summary contains no decorative card or wallet logo row and no
  simulated payment controls. Approved payment-method branding and controls
  are rendered only by the actual Square integration when available.

## 15. Phase 2 Production Prerequisites

Before Square sandbox or production checkout is enabled:

1. Create and review the Supabase project, migrations, constraints, and row-level security.
2. Persist drafts, price snapshots, policy acceptances, payment attempts, idempotency keys, and state history atomically.
3. Approve the registration-number format, editing rules, duplicate-entry rules, final waiver, and refund/cancellation language.
4. Implement stable membership identification and authorized pending-verification behavior.
5. Implement atomic capacity holds if any tournament receives a configured limit.
6. Add the Square SDK/API adapter using sandbox credentials.
7. Create payment only from a newly revalidated server quote and durable pending record.
8. Verify Square callbacks or webhooks and make event processing idempotent.
9. Implement payment-status retrieval for browser-interruption recovery.
10. Implement confirmation lookup without exposing private records.
11. Add the registration confirmation email adapter, delivery state, retry, and authorized resend.
12. Build Admin authentication, authorization, registration review, and reconciliation views.
13. Add rate limiting, operational monitoring, alerting, and recovery runbooks.
14. Complete Square sandbox, Apple Pay domain, failure, refresh, concurrency, accessibility, and end-to-end testing.
15. Complete the applicable launch gates in the Project Deployment Checklist.

No production payment may be enabled merely because environment variables are
present. Durable persistence and verified server-side payment finalization are
mandatory.

## 16. Open Policy and Operational Decisions

- Final waiver and acknowledgment text following qualified legal review.
- Final refund, credit, transfer, postponement, and cancellation policy.
- Registration-number format.
- Whether and how anglers may edit a paid registration.
- Duplicate-entry policy for one angler in the same tournament.
- Stable membership identifier and pending-verification review process.
- Exact authority for verification, overrides, refunds, and reconciliation.
- Whether current tournaments will use capacity limits and the approved hold duration.
- Confirmation-email sender, support address, retry schedule, and retention.
- Tournament-morning check-in instructions to include in confirmations.
- Retention periods for private registration, policy-acceptance, payment, and audit records.

## 17. Phase 1 Acceptance Status

- Completed: source-of-truth workflow documentation.
- Completed: registration lifecycle and price-snapshot TypeScript design.
- Completed: tournament eligibility and CTA state rules.
- Completed: responsive form enhancements and visible progress.
- Completed: client field validation and required acknowledgments.
- Completed: server-side validation and authoritative quote endpoint.
- Completed: centralized integer-cent pricing and 3% Card Processing Fee.
- Completed: review summary and disabled payment boundary.
- Completed: provider-neutral payment interface.
- Completed: confirmation and interruption-recovery page structure.
- Completed: focused eligibility, pricing, acknowledgment, idempotency, capacity, security-shape, and confirmation tests.
- Completed: document-backed Official Rules and Participant Liability Waiver routes.
- Completed: combined acknowledgment contract with rules and waiver version capture.
- Pending: durable registration persistence and all Phase 2 items.

# AITT Capability Contracts

This is a compact boundary map for the implemented application. The linked
source files, migrations, and tests are authoritative for details. `Not
Rehearsed` means that automated checks do not substitute for an authenticated
staging rehearsal.

The current backup gate is the external-drive file backup documented in the
Project Deployment Checklist. A future Google Drive copy will be a separate
off-site archive process.

## Shared rules

- Admin mutations require authenticated server authorization and Supabase RLS.
- Registration and payment snapshots are server-authoritative and immutable
  historical evidence; financial summaries use recorded collected funds only.
- Idempotency keys, unique database constraints, and retryable outbox state are
  preferred over client-only duplicate prevention.
- No Show is not an application status. Attendance uses ordinary Check-In and
  Pending Check-In. A paid no-show is handled as a Tournament Director
  one-off outside the application; no replacement absence or zero-result
  workflow exists.
- Every current registration participant must be an active $40 seasonal member
  or purchase that season's membership during registration. Returning active
  members pay $0; new anglers pay $40 once per person per season. Historical
  non-member snapshots remain readable but are not a current registration path.
- Bronze, Silver, Gold, and Insurance are available to every current registered
  angler; Bronze/Silver/Gold are mutually exclusive, while Big Bass and
  Insurance may be selected independently alongside one selected member pot.

## Capability boundaries

| Capability | Entry point and primary implementation | Authoritative data / transition | Financial and safety contract | Tests / staging state |
|---|---|---|---|---|
| Online registration | Public registration routes; `app/register`, `lib/registration.ts` | `tournament_registrations`, payment attempts, snapshots; payment pending → verified → active | Completed Square evidence is required; server quote and idempotency key prevent duplicate charges | `tests/online-registration.test.tsx`, `tests/registration.test.tsx`; sandbox rehearsal still required |
| Walk-up registration | Admin Registration Review walk-up form; `app/admin/registration-review/actions.ts`, `lib/walk-up-registration-form.ts` | `admin_create_sequential_walkup_registration`; durable save assigns the registration number | Cash/Other fee 0; Card uses configured fee; every contact field, including email, is required for every angler before save/payment | `tests/admin-walk-up-registration.test.ts`; authenticated staging rehearsal still required |
| Confirmation emails | `lib/registration-confirmation-email.ts`, `lib/registration-confirmation-email-template.ts` | `registration_confirmation_email_deliveries`; provider retry state | Online rows require completed payment-attempt ID. Walk-up rows use nullable `payment_attempt_id`, `registration_source='walk_up'`, stored snapshot, normalized recipient, and unique `(registration_id, normalized_recipient_email)` | `tests/registration-confirmation-email.test.ts`; live allowlisted delivery not rehearsed |
| Identity and membership review | `lib/registration-identity-review.ts`, Registration Review actions | `registration_identity_reviews` and candidate/history tables; per-person pending → resolved | Review never fabricates money; resolution is audited and does not duplicate identity records | `tests/registration-identity-review.test.ts`; #16 currently differs from the requested unresolved rehearsal state |
| Membership creation and eligibility | Admin Members routes and review actions; `lib/memberships.ts` | `members`, `memberships`, individual snapshots | Returning active member adds $0; Purchase Membership records exactly the collected $40; no shortfall/receivable; historical non-member rows remain readable | membership-review tests; live decision rehearsal remains required |
| Registration roster | `lib/tournament-registration-roster.ts`, Registration Review UI | Active registration rows, participant snapshots, check-in fields | Filters and pagination do not change collected totals; per-person status is independent | roster/export/attendance tests; authenticated UI not tested |
| All Registrations history | `lib/admin-registration-history.ts`, `/admin/registrations` | registration and append-only review/history records | Read-only history; authorized corrections preserve audit evidence | `tests/admin-all-registrations.test.ts`; staging UI not tested |
| Check-In | `app/admin/tournament-manager/prepare/check-in-actions.ts`, `components/admin/RegistrationCheckInControl.tsx` | `checked_in_at`, `checked_in_by_admin_id`; Pending Check-In → checked in | Check-In and clear/reopen do not alter financial totals or enqueue confirmation | `tests/registration-attendance.test.ts`, `tests/admin-registration-checkin-workflow.test.ts`; UI not tested |
| Financial Summary | `lib/tournament-collection-calculator.ts`, `lib/tournament-collection-summary.ts`, `app/admin/financial-summary` | Complete active roster plus stored price/payment snapshots | `TOTAL REGISTRATION FUNDS COLLECTED`; Square fees excluded from payout/membership funds; malformed historical snapshots warn | financial-summary and collection tests; authenticated UI not tested |
| Tournament preparation/readiness | `lib/tournament-publish-readiness.ts`, prepare routes | Review state, paper-membership acknowledgement, import gate | Any unresolved review blocks preparation/import; no No Show branch | `tests/tournament-publish-readiness.test.ts`; staging UI not tested |
| CSV import/reconciliation | `lib/weighfishParser.ts`, `lib/weighfish-reconciliation.ts`, import actions | Imported result and reconciliation records | Normal zero-fish/zero-weight rows remain ordinary; unmatched/duplicate rows require review | parser/reconciliation tests; representative staging import rehearsal required |
| Results validation/publication | `lib/official-results.ts`, publish actions | Official result entries and publication state | Validation and approval precede publication; no absence/No Show exception | official-results and publish-readiness tests; staging rehearsal required |
| Payout calculation | Tournament Manager payout/closeout modules | Closeout totals and payout records | Completed closeout `total_paid_cents` is authoritative; category fallback never double-counts | payout/closeout tests; operational rehearsal required |
| AOY standings | `lib/aoy-engine-core.ts`, AOY routes | Competitive records and approved results | Current registrations are membership-qualified; points use official finishing position, 200 then one fewer, best 5 of 8; historical eligibility snapshots remain supported | `tests/aoy-engine.test.ts`; staging result rehearsal required |
| Championship eligibility | `lib/championship-qualification-core.ts` | Season results and qualification records | Current entries qualify through five physical participations in eight regular-season events; historical eligibility snapshots remain supported; no No Show application branch | `tests/championship-qualification.test.ts`; staging rehearsal required |
| Admin authentication/authorization | `lib/auth/admin.ts`, protected route/actions | Supabase Auth plus server-side admin checks | Unauthorized requests fail closed; credentials remain server-only | auth/route tests; authenticated UI rehearsal required |

## Confirmation-email contract

### Online

Successful verified Square payment is the trigger. The delivery row references
the completed payment attempt, normalizes and deduplicates participant
recipients, and uses the database uniqueness constraint plus provider
idempotency key. The renderer uses `REGISTRATION NUMBER`, the approved online
check-in paragraph, selected item names, and final amount paid. It is not a
Square receipt. Failure preserves the registration and leaves retryable state.

### Walk-up

The trigger is the successful durable walk-up RPC transaction. The outbox row
uses `payment_attempt_id = NULL`, authoritative stored registration and price
snapshots, the same recipient normalization/deduplication, and the same
database/provider duplicate protections. Cash and Other store no card fee;
Card stores the configured calculated fee. The renderer uses the stored
registration number and the approved tournament-day paragraph, reports the
recorded payment method and total, and never invents an online Square fee. A
Every walk-up contact field, including email, must be present before the
registration can be saved or paid. If a valid collected email cannot be
delivered, the registration remains valid and the delivery enters the bounded
retry/failed state for Admin follow-up.

## Registration governance decisions

These decisions are authoritative where older historical wording differs:

- Every walk-up contact field, including email, is required for every angler.
  Member Search does not waive contact collection.
- Duplicate or previously canceled entrants are not blocked from registration.
  Duplicate handling is an administrative review/reconciliation task after
  payment; required fields and valid payment remain enforced.
- Shared email addresses and contact differences go to Needs Review instead of
  blocking registration. Contact-only review does not block check-in after
  identity and membership are resolved.
- The website records its calculated amount. Staff do not edit payment
  summaries; partial-payment and deposit issues are handled outside AITT.
- Mark Collected is the Tournament Director's manual evidence for a membership
  payment. The site does not verify cash or require a separate receipt.
- A paid no-show is a Tournament Director one-off. A cancellation before
  WayFish import removes the entry from active/public results, revokes
  registration-purchased memberships, removes AOY and Championship effects,
  and prevents WayFish export.
- WayFish results and AITT Insurance Pot results are intentionally separate.
  Insurance is reconciled after import, and checks are generated once after all
  payout categories are validated.

## Recovery and release evidence

- AITT has no separate active No Show status; attendance is handled through the
  ordinary Check-In workflow. Historical migration records remain preserved.
- Migration `202609230001` was manually executed once in the staging SQL Editor;
  its CLI migration-ledger presence is unverified and must be reconciled before
  any future CLI migration. This does not imply a production migration.
- The staging project is `vcjhufuklqwvnqmarpqi`; production is out of scope.
- Automated tests are evidence of code behavior, not a live authenticated UI,
  Square Sandbox, CSV-import, or email-delivery rehearsal.

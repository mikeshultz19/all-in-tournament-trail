# Payment Operations Manual

**Document Version:** 1.3

**Status:** Approved

**Owner:** Product Owner
**Audience:**

- Operations
- Administrators
- Developers
- AI Assistants

**Last Updated:** 2026-07-22

**Related Documents:**

- [Project Status](ProjectStatus.md)
- [Tournament Operations and Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)
- [Database Design](DATABASE_DESIGN.md)
- [How the Website Works](HOW_THE_WEBSITE_WORKS.md)
- [AI Relearn](AI_RELEARN.md)
- [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md)

> **Authority:** This manual defines AITT financial operations. Approved software must conform to these rules. Sections marked **Open Business Decision** describe unresolved policy and must not be treated as approval.

## 1. Executive Summary

This manual defines how All-In Tournament Trail (AITT) handles tournament money from registration through payment verification, event closeout, payouts, reconciliation, and archival. It establishes consistent responsibilities, evidence requirements, controls, exception handling, and records for every tournament.

This is an operational business document, not an implementation design. Software, administrator tools, and future payment integrations must support this operating model without weakening its controls.

## 2. Purpose

AITT payment operations are designed to provide:

- Consistent handling of registration and membership payments.
- Auditable records from the amount expected through final disposition.
- Clear administrator ownership and accountability.
- Independent financial reconciliation for every tournament.
- A stable operating process that can scale to new payment providers.
- Separation between approved business rules and their eventual software implementation.

## 3. Financial Philosophy

1. **Every dollar is traceable.** Expected charges, received funds, adjustments, refunds, and payouts must have an identifiable business purpose and tournament.
2. **Payments are never assumed.** A submitted registration or payment claim is not proof that funds were received.
3. **Confirmation is required.** An Early Online Registration is not confirmed until Square reports a successful card payment.
4. **Corrections preserve history.** Errors are corrected with documented changes; original financial events are not silently erased.
5. **Financial actions are auditable.** The responsible person, time, reason, and before-and-after state must be recoverable.
6. **Every tournament reconciles independently.** Funds and exceptions from one tournament must not conceal discrepancies in another.
7. **Business policy drives software.** Technology must implement approved policy rather than create it.
8. **System ownership stays clear.** AITT owns early-online registration, Square owns card transactions, and WeighFish owns tournament-day registration and payment-method records.

## 4. Money Flow Model

```text
Tournament Created
        |
        v
Registration Opens
        |
        v
Angler Registers
        |
        v
Square Card Payment Submitted
        |
        v
Square Payment Result
        |
        v
Registration Confirmed
        |
        v
Tournament Conducted
        |
        v
Tournament Closed
        |
        v
Payout Approved
        |
        v
Financial Reconciliation
        |
        v
Tournament Archived
```

| Stage | Operational meaning |
| --- | --- |
| Tournament Created | The event exists as a distinct financial unit with approved registration offerings and prices. |
| Registration Opens | Eligible anglers may register during the documented registration periods. |
| Angler Registers | A solo or team registration records participants, membership choices, Tournament Entry, optional pots, and itemized charges. |
| Square Card Payment Submitted | AITT sends a server-validated amount and idempotent payment request through Square. |
| Square Payment Result | Square reports success or failure. A client-side redirect alone never confirms payment. |
| Registration Confirmed | AITT confirms the registration only after Square reports a successful payment. |
| Tournament Conducted | The Tournament Director handles walk-up registration in WeighFish and uses cash or a Square reader for payment. |
| Tournament Closed | Registration and competition are complete; unresolved financial exceptions are identified. |
| Payout Approved | Results, eligibility, payout calculations, and recipients receive required operational approval. |
| Financial Reconciliation | Expected receipts, verified receipts, adjustments, refunds, and payouts are compared and explained. |
| Tournament Archived | The completed financial record is locked against routine editing and retained for history and audit. |

## 5. Payment Provider Strategy

Version 1 uses **Square** for credit-card, debit-card, and supported digital-wallet payments. Apple Pay is supported through Square on compatible devices and browsers. A flat **3% Card Processing Fee** applies equally to the applicable card or digital-wallet subtotal for Early Online Registration and tournament-morning Square-reader payments. Cash is accepted only during Tournament-Morning Registration and has no card-processing fee.

Square is authoritative for card transactions, receipts, transaction history, processing reports, deposits, and supported refunds. The AITT website must remain provider neutral at its business-policy boundary so a future provider could be introduced without changing registration rules.

### Public Payment and Brand Presentation

- The homepage advertises card and Apple Pay availability as a compact update
  inside the existing Latest News & Announcements section. Tournament Status
  remains first and retains operational priority.
- Public copy must state that Apple Pay availability depends on supported
  devices and browsers. It must not imply universal availability.
- Tournament-morning copy may describe Apple Pay and other supported
  contactless wallets only as payments taken through the Square reader.
- Apple Pay branding must follow Apple's current official marketing guidelines.
  Only official, Apple-provided artwork may be used; it must not be redrawn,
  modified, recolored, distorted, animated, or sourced from a third-party logo
  website.
- Until approved official artwork is added, the homepage uses a clear text
  fallback. Asset placement and integration requirements are recorded in
  `public/brands/README.md`.

```text
cardProcessingFee = roundCurrency(cardSubtotal × 0.03)
totalCharged = cardSubtotal + cardProcessingFee
```

Application calculations use integer cents and round the calculated fee to the nearest cent, with half-cent results rounded upward. The fee must be displayed before payment submission.

## 6. Registration Payment Workflow

1. **Registration begins.** The angler selects the tournament, solo or team registration, membership choices, and eligible entry options. Tournament Entry is required. Big Bass is optional; Bronze, Silver, Gold, and Insurance Pot follow the eligibility rules in [Tournament Operations](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md).
2. **Charges are established.** The registration shows itemized charges and an expected total. Prices and eligibility come from approved business rules.
3. **Registration is created.** The record retains the tournament, registration period, trusted submission time, participants, selections, expected total, and a Pending payment state.
4. **Amounts are disclosed.** The website shows Registration Subtotal, Card Processing Fee (3%), and Total Charged before payment.
5. **Payment is submitted.** The angler enters card details only through Square's approved browser controls. AITT never collects raw card data.
6. **The server validates payment.** AITT recalculates the amount in integer cents and creates the Square payment with an idempotency key. Browser-supplied totals are not trusted.
7. **Square reports the result.** Declined, cancelled, interrupted, duplicate, and malformed submissions remain unconfirmed.
8. **Registration is confirmed.** AITT records only the minimum Square reference and confirms the registration after a successful Square response and durable storage.

No production online payment may be accepted until secure registration persistence and server-side payment confirmation exist.

## 7. Square and WeighFish Process

### Early Online Registration

- AITT collects the registration and calculates the card subtotal and fee.
- Square securely collects card details and processes the immediate payment.
- Apple Pay is available when supported by the angler's device and browser.
- Square is authoritative for the card transaction.
- AITT confirms only successful payments and stores the website-originated registration.

### Tournament-Morning Registration

1. The Tournament Director opens WeighFish at the registration table.
2. The Tournament Director enters the team or individual in WeighFish.
3. WeighFish records Cash or Card as the payment method.
4. Cash receives no processing fee.
5. Card, Apple Pay, and other supported contactless-wallet payments are processed separately through the Square reader with the 3% Card Processing Fee.
6. The Tournament Director completes the registration in WeighFish.

The AITT website does not run the live morning registration table, duplicate cash-versus-card tracking, or maintain a live morning Square ledger. The paper form is emergency backup only.

## 8. Payment Status Definitions

| Status | Meaning | Normal transitions |
| --- | --- | --- |
| Pending | An online card payment has been initiated but Square has not reported success. | Verified, Rejected, Cancelled, or Manual Review |
| Verified | Square reported a successful online card payment and AITT durably associated its minimum reference with the registration. | Refunded, Manual Review, or an auditable administrative correction |
| Rejected | Evidence is invalid, payment was not received, or the submitted payment cannot be accepted. | Pending after corrected submission, Manual Review, or Cancelled |
| Cancelled | The payment obligation or related registration was cancelled under an approved rule; this does not by itself mean money was returned. | Refunded if funds had been received, or an auditable correction |
| Refunded | Previously received funds were returned under an approved refund decision. | Manual Review or an auditable correction |
| Manual Review | A discrepancy, dispute, fraud concern, or unusual case prevents routine resolution. | Pending, Verified, Rejected, Cancelled, or Refunded after documented review |

> **Status discipline:** Registration status and payment status are related but distinct. “Cancelled” does not prove a refund, and “Verified” does not override other eligibility requirements.

If partial payments or partial refunds are later approved, they require explicit states and amount tracking. They must not be represented as fully Verified or fully Refunded.

## 9. Payment Verification

For Early Online Registration, verification comes from a successful server-side Square payment response, never from a browser redirect, screenshot, or angler statement. AITT must recalculate the charge, use idempotency protection, associate the minimum Square reference with one registration, and reject duplicate use.

Authorized administrators use Square's records to investigate incorrect amounts, reversals, disputes, or fraud concerns. Manual corrections require a reason, evidence, administrator identity, and timestamp and must not change a failed payment into a successful one without authoritative transaction evidence.

Tournament-morning card verification and cash-versus-card tracking remain in the Square and WeighFish operating process; AITT does not duplicate them in real time.

## 10. Exception Handling

| Scenario | Required response |
| --- | --- |
| Duplicate payment | Idempotency must prevent duplicate online charges. If separate charges exist, preserve both Square references and place the excess payment in Manual Review pending an approved disposition. |
| Wrong amount | Record the actual amount, keep the payment unverified or in Manual Review, notify the responsible party, and resolve the difference without rewriting the original expected total. |
| Late payment | Preserve the provider and submission times. Apply the approved deadline policy; if none exists, mark Manual Review and escalate to the Product Owner. |
| No payment received | Keep the payment Pending until the verification window ends, then reject or cancel only under an approved policy. Do not confirm the registration as paid. |
| Incorrect tournament | Do not silently transfer funds. Record the mistake and obtain an approved transfer, refund, or correction decision in the owning system. |
| Refund request | Record the request and reason. Do not promise or issue a refund without an approved policy and authorized decision. |
| Payment dispute or fraud concern | Move the payment to Manual Review, preserve evidence, limit further action, and escalate to the Product Owner and provider process as appropriate. |
| Administrative correction | Record the prior value, corrected value, reason, administrator, timestamp, and evidence. Never delete the original history. |

## 11. Refunds

> **Open Business Decision:** AITT's refund-versus-credit policy is not finalized. The policy for cancellations, postponements, withdrawals, duplicate payments, incorrect amounts, processing costs, deadlines, approval authority, and partial refunds requires Product Owner approval.

Until approved, administrators must not infer a general refund entitlement. Each request remains in Manual Review, retains its evidence and decision history, and follows a documented Product Owner decision. A refund record must identify the original payment, amount returned, reason, approval, method, provider reference when applicable, and completion date.

## 12. Financial Controls

- Restrict financial access to authorized administrators using least privilege.
- Where staffing permits, separate payment verification, payout approval, and final reconciliation. If one administrator performs multiple duties, the audit record must make that visible.
- Record who performed every verification, override, refund, payout approval, and reconciliation action and when.
- Preserve original expected amounts, actual amounts, provider references, and correction history.
- Prohibit silent deletion or destructive replacement of financial records.
- Require explanations and evidence for exceptions and manual corrections.
- Keep public registration data separate from private payment and administrative data.
- Reconcile website-originated registrations independently for every tournament before archival; do not duplicate the morning ledger owned by WeighFish and Square.

## 13. Reconciliation

AITT reconciles its Early Online Registrations independently for each tournament. The administrator compares:

- Expected charges from registrations and membership purchases.
- Amounts actually received and Verified.
- Online Square payment totals.
- Rejected, cancelled, refunded, disputed, partial, duplicate, or manually reviewed items.
- Website-originated registration and optional-pot participation totals.
- Approved payout obligations and completed payouts.
- Any difference between expected, received, returned, and distributed funds.

The Tournament Director separately uses WeighFish as the official tournament-day roster and payment-method record and Square as the card-transaction record. AITT must not recreate a live morning ledger. After the event, the protected AITT import workflow will ingest the official WeighFish CSV for tournament history; it does not yet exist.

## 14. Tournament Closeout

Financial closeout requires:

1. Registration has ended and all payment records have a reviewed status.
2. Pending and Manual Review items are resolved or formally listed as outstanding.
3. Expected and Verified receipts are reconciled.
4. Official results and payout eligibility are confirmed.
5. Payouts are approved, distributed, and recorded, or listed as outstanding.
6. Refunds and disputes are recorded according to approved decisions.
7. The final reconciliation is reviewed and approved.
8. The tournament financial record is locked against routine editing and archived.

After archival, changes require an authorized correction entry. Reopening must preserve the prior closeout and identify who reopened it, when, and why.

## 15. Payout Process

1. **Verify results.** Use the official tournament record and confirm winner identity, placement, Big Bass results, pot participation, membership eligibility, and any Insurance Pot entitlement.
2. **Calculate obligations.** Prepare the Main, Bronze, Silver, Gold, and two Big Bass payouts required by current tournament operations. Document any supported Insurance Pot payout. Do not infer an amount or rule absent from approved documentation.
3. **Review recipients.** Match each proposed recipient to the official results and registration record, including required payout and tax information.
4. **Approve payouts.** An authorized approver reviews recipients, calculations, exceptions, and the total payout before funds are distributed.
5. **Generate checks.** When payment is made by check, create the check from the approved payout record and retain the check number or equivalent evidence. Electronic payouts are a future enhancement unless separately approved.
6. **Distribute and acknowledge.** Record the distribution date, method, recipient, and acknowledgement or other evidence when available.
7. **Account for payouts.** Include issued, delivered, outstanding, voided, and corrected payouts in tournament reconciliation. Voids and reissues preserve the original history.

## 16. AITT Admin Center Requirements

The future authenticated payment area within AITT Admin Center must support the
operating process with:

- A tournament-specific payment queue.
- Payment-status, registration-period, provider, date, and exception filters.
- Expected-versus-received amount comparison.
- Minimum online Square payment reference and duplicate detection.
- Verification, rejection, cancellation, refund, and Manual Review workflows subject to approved authority.
- Search by tournament, registration, angler, payer, or reference.
- Immutable audit history and visible manual-correction reasons.
- Outstanding balance and unresolved-exception views.
- Payout approval, check tracking, and distribution records.
- Tournament reconciliation and closeout reports.
- Export suitable for authorized operational and accounting review.

The portal must not allow convenience features to bypass evidence, authorization, or history-preservation requirements.

## 17. Database Considerations

The future data design should keep registration records separate from payment records so one registration can retain payment attempts, corrections, refunds, or provider changes without losing history. Payment records should retain provider identity, amounts, status changes, references, evidence metadata, responsible administrators, and timestamps at an operationally appropriate level.

Provider-specific details should remain behind a provider-independent business model. Registration, payment, payout, refund, and reconciliation states should remain distinct. Historical financial events should be append-only or otherwise preserved through a complete audit trail. This section defines concepts only; the authoritative technical blueprint remains [Database Design](DATABASE_DESIGN.md).

## 18. Reporting

Authorized users need the following reports:

| Report | Purpose |
| --- | --- |
| Tournament Payments | Show expected and received amounts for every registration in one tournament. |
| Outstanding Payments | Identify Pending, rejected, short, disputed, or Manual Review items requiring action. |
| Verified Payments | List verified amounts, provider references, verification dates, and responsible administrators. |
| Revenue Summary | Summarize receipts by tournament, registration category, membership, pot, and provider. |
| Audit Report | Show financial status changes, overrides, corrections, refunds, and responsible administrators. |
| Reconciliation Report | Compare expected receipts, verified funds, adjustments, refunds, payouts, and unresolved variances. |

Reports containing payment or personal information are private and access controlled.

## 19. Security

- Grant the minimum financial permissions required for each role.
- Require authenticated, server-authorized access to private financial actions and records.
- Never expose provider references, payment evidence, administrative notes, or personal payment information publicly.
- Do not store payment card data in AITT systems; card data belongs with an approved payment processor.
- Record administrator identity and time for every material financial action.
- Preserve historical records, including reversals, voids, corrections, and disputes.
- Review suspicious or duplicate activity before confirmation or payout.
- Keep provider credentials and financial exports out of public or client-accessible systems.

## 20. Future Enhancements

The following are planned possibilities, not approved current operations:

- Additional approved card or bank-payment methods.
- Additional approved registration-payment methods beyond morning cash.
- Provider-assisted or automatic payment verification with exception review.
- Accounting-system exports.
- Formal self-service and administrator refund workflows.
- A finance dashboard with tournament and season summaries.
- Treasurer-specific reports and approval controls.
- Electronic payout methods.

Each enhancement must preserve verification, audit, provider independence, privacy, and tournament-level reconciliation.

## 21. Open Business Decisions

The Product Owner must approve the following before software or routine operations assume an answer:

- Refund, credit, and transfer policy, including postponed and cancelled tournaments.
- Late payment acceptance and escalation policy.
- Whether and under what controls checks are accepted for registration payments.
- Online payment-submission and verification timing at the published deadline.
- Handling of partial payments, overpayments, fees, reversals, and partial refunds.
- Authority levels for verification, overrides, refunds, payout approval, and reconciliation approval.
- Payout timing, check controls, unclaimed payouts, and tax-reporting procedures.
- Timing and approval criteria for additional payment providers.
- Whether one administrator may complete all financial duties when role separation is impractical.

> These items are unresolved. Label related recommendations **proposed** or **requires confirmation** until an approved decision is recorded.

## 22. Related Documentation

- [ProjectStatus.md](ProjectStatus.md) — current project phase and planned work.
- [TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md) — authoritative registration, eligibility, tournament, and payout-pot rules.
- [DATABASE_DESIGN.md](DATABASE_DESIGN.md) — technical persistence blueprint and current implementation decision boundaries.
- [HOW_THE_WEBSITE_WORKS.md](HOW_THE_WEBSITE_WORKS.md) — plain-language platform and future registration workflow.
- [AI_RELEARN.md](AI_RELEARN.md) — AI collaboration, decision boundaries, and validation standards.
- [DecisionLog.md](DecisionLog.md) — approved business and architecture decisions.
- [WeighFishIntegration.md](WeighFishIntegration.md) — planned official-results import boundary.

## 23. Change Log

| Version | Date | Status | Change |
| --- | --- | --- | --- |
| 1.3 | 2026-07-22 | Approved | Linked the authoritative Early Online Registration workflow and clarified its Phase 1 payment boundary. |
| 1.2 | 2026-07-22 | Approved | Added Apple Pay and supported contactless-wallet operations, fee parity, and official-branding requirements. |
| 1.1 | 2026-07-22 | Approved | Adopted Square for card payments, the 3% Card Processing Fee, and WeighFish-owned Tournament-Morning Registration. |
| 1.0 | 2026-07-22 | Superseded | Initial draft. |

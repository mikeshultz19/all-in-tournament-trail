# AITT Employee Online Registration and Roster Review List

**Purpose:** A plain-language walkthrough for the Tournament Director team,
including the AITT owners and tournament-day staff. Use this document to teach
how online registrations are accepted, how realistic mistakes are handled, and
how the roster is verified afterward.

**Operating goal:** Collect every valid registration and payment successfully.
Correctable identity, contact, and membership issues should be resolved in the
Admin Center after payment rather than unnecessarily blocking a customer.

## Realistic registration failure points

| # | Human or system situation | Expected behavior | Who handles it | What to verify |
|---|---|---|---|---|
| 1 | A required field is blank or the waiver acknowledgment is missing. | Payment is blocked until the required information or acknowledgment is provided. | Customer or Tournament Director assisting the customer. | The form identifies the missing field and no payment attempt is created. |
| 2 | A Team is missing Angler 2, or the same person is entered twice in one Team. | The Team cannot proceed until two distinct anglers are entered. | Customer or Tournament Director. | The correction happens before payment and no incomplete Team reaches the roster. |
| 3 | Someone selects Current Member but has no active membership for the season. | The registration and payment may proceed, then the entry goes to membership Needs Review. The Tournament Director collects the $40 manually when appropriate and uses Mark Collected. | Tournament Director. | The registration remains on the roster, check-in stays gated until resolved, and the Payment Recovery manual-collection history records the item as Pending and later Collected. |
| 4 | A name, address, phone number, email, ZIP code, or other contact detail is misspelled, outdated, or slightly different from the member record. | Structurally valid information does not unnecessarily block payment. The entry may go to identity or contact review for correction. | Tournament Director or Admin staff. | Payment, registration, roster membership, and review evidence remain connected. |
| 5 | The same person is entered in two separate registrations. | Registration is allowed. A duplicate is an administrative issue, not an online payment blocker. | Tournament Director after payment; cancel one entry only if needed. | Both records and payments remain visible until the Director resolves the situation. |
| 6 | Square declines the card, the browser closes, the customer refreshes, the payment button is double-clicked, or the network interrupts checkout. | A declined payment does not create a confirmed registration. A successful Square payment must not require a second charge. Durable payment recovery and idempotency handle interruptions. | System first; Admin staff uses Payment Recovery if a paid attempt does not finish registration. | Check Square status, payment attempts, registration state, and the Admin Payment Recovery page before asking anyone to pay again. |
| 7 | The confirmation email is delayed, rejected, or never delivered. | The registration remains valid. Email delivery is retryable or can be followed up manually; email failure does not reverse payment or registration. | System records delivery state; Admin staff follows up when needed. | The roster and payment records show the entry even if email delivery is not complete. |

## Walkthrough sequence

Use a separate staging test entry for each scenario. After every successful
payment, confirm the same entry in all relevant places:

1. Customer-facing confirmation and registration number.
2. Admin Registration Review roster.
3. All Registrations history and payment state.
4. Tournament Funds Summary and related counts.
5. Payment Recovery, including the manual-collection history when applicable.
6. Membership or Needs Review records when the test involved membership or identity.
7. Check-In availability after any required review is resolved.

## Recommended teaching scenarios

- Solo Current Member with complete information.
- Solo new angler purchasing membership.
- Team with two Current Members.
- Mixed Team with one Current Member and one new angler.
- Current Member selection with no active seasonal membership.
- A realistic misspelling or outdated phone/address.
- Missing required field and missing waiver acknowledgment.
- Team missing Angler 2.
- Same person entered twice within one Team.
- Same person entered in two separate registrations.
- Card decline or interrupted checkout in Square Sandbox.
- Browser refresh or close after payment handoff.
- Confirmation-email delivery failure or delayed delivery.

## Rules for staff

- Do not ask a customer to pay again until Square and Payment Recovery have
  been checked.
- Do not edit calculated payment amounts in the Admin Center.
- Do not treat a contact mismatch as proof that payment or registration failed.
- Resolve a $40 manual membership collection through the existing Registration
  Review workflow. Payment Recovery is informational only.
- Keep paper forms available for a true website, device, payment, or internet
  outage.
- Record unusual corrections and cancellations so the roster and financial
  evidence remain understandable afterward.

## Boundary of this walkthrough

This is an employee training and acceptance guide. It does not replace the
Official Rules, the payment processor's records, the paper registration form,
or the authoritative technical documentation. Its purpose is to make the
registration and roster-review behavior understandable before live use.

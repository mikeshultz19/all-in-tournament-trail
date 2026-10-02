# AITT Partner Staging Demo and Rehearsal

**Purpose:** Let a first-time tournament staff member drive the staging site
through the common online and walk-up workflows while the Tournament Director
observes the results.

**Scope for this session:** Online registration, Square Sandbox payment, roster
review, cancellation, membership review, walk-ups, check-in, membership pages,
Early Entries, and financial summaries.

**Out of scope today:** Tournament Manager, CSV imports, WeighFish imports,
results, payouts, AOY, Championship, and production deployment.

## Before starting

1. Confirm the staging URL and log in to the Admin Center.
2. Choose the current staging tournament.
3. Use a separate registration for every scenario.
4. Use only staging-allowlisted email addresses when an actual confirmation
   email is needed. Do not reuse one email for multiple new-member identities.
5. Do not use real payment-card information. Use the Square Sandbox test card.
6. Record each registration number as it is created.

The website assigns a registration number. Boat numbers are handled separately
by tournament staff during tournament check-in and are not part of this online
workflow.

## The check after every successful registration

The person driving should stop and verify:

1. The confirmation page shows the correct registration number and instructions.
2. The confirmation email is received when that scenario uses an allowlisted
   address.
3. The entry appears in Registration Review and All Registrations.
4. Participants, registration type, membership status, membership fees, pots,
   insurance, and Big Bass are correct.
5. Financial Summary reflects the correct collected amount and membership count.
6. Early Entries shows the correct participant names and registration number.
7. All Members reflects any newly purchased membership.

## Email delivery verification

Use the two staging-approved addresses supplied at the start of the rehearsal:

- Email A: `[provided at rehearsal]`
- Email B: `[provided at rehearsal]`

Run and review at least these four email cases. Record the registration number
for each one and verify the message in the mailbox before continuing:

1. **Online registration — Email A:** complete a normal paid online registration
   and confirm the registration email arrives with the correct registration
   number, participant names, totals, and Early Entries instructions.
2. **Online registration — Email B:** complete an online registration that
   enters Needs Review, then resolve the review and confirm the email arrives
   and the final message matches the resolved roster state.
3. **Walk-up — Email A:** save a normal paid walk-up using the supplied email
   address and confirm the walk-up confirmation email arrives with the correct
   registration number and participant details.
4. **Walk-up — Email B:** save a walk-up that enters Needs Review, resolve the
   review, and confirm the email arrives without asking the customer to pay
   again or exposing internal reconciliation language.

For every case, review both the page state and the email contents. Confirm the
email identifies the correct registration and does not contain another test
participant's name, amount, or registration number. If delivery is pending or
fails, record the registration number and inspect Payment Recovery before
retrying anything.

Do not compare the Square processing fee to tournament payout totals. It is a
payment-processing amount, not tournament money.

## Part 1 — Online registrations

### Online 1 — Current Member, Solo, no add-ons

Enter one existing member selected from Member Search. Choose:

- Registration type: Solo
- Membership: Current Member
- Pots: None
- Payment: Square Sandbox

Expected result:

- Tournament entry is charged.
- Membership fee is $0.
- The entry is confirmed and appears on Early Entries.
- The member count does not increase.

### Online 2 — Current Member, Team, Big Bass

Enter two existing members who are not already in this staging tournament.
Choose:

- Registration type: Team
- Membership: Current Member for both anglers
- Big Bass: selected
- Insurance: not selected
- Member pot: None
- Payment: Square Sandbox

Expected result:

- Two participants appear on one registration.
- Membership fees are $0.
- Big Bass appears in the roster and financial summary.
- Both names appear together on Early Entries.

### Online 3 — New Angler, Solo, membership plus Insurance

Use a new synthetic person with a unique staging email. Choose:

- Registration type: Solo
- Membership: Joining / Purchasing
- Big Bass: not selected
- Insurance: selected
- Member pot: None
- Payment: Square Sandbox

Expected result:

- Tournament entry, $40 membership, and Insurance are all reflected.
- The new member appears in All Members.
- Membership count increases by one.
- Early Entries and Financial Summary agree with the roster.

### Online 4 — New/New Team, Big Bass and member pot

Use two new synthetic people with separate emails. Choose:

- Registration type: Team
- Membership: Joining / Purchasing for both anglers
- Big Bass: selected
- Insurance: not selected
- Member pot: Bronze
- Payment: Square Sandbox

Expected result:

- Two $40 memberships are counted.
- Both new members appear in All Members.
- Big Bass and Bronze appear on the registration.
- The team total equals the entry, both memberships, and selected options.

## Part 2 — Online review and cancellation

### Online 5 — Current Member selected, membership needs review

Use a current-member test person who is not already in the staging tournament.
Choose Current Member and complete payment. Leave the review unresolved first.

Expected result:

- Payment succeeds and the registration remains visible.
- The entry appears in Needs Review.
- It is not treated as a new membership yet.
- The participant remains visible in the roster and All Registrations.

Then resolve it one of two ways:

- **Confirm membership:** membership becomes confirmed, the $40 membership is
  added, and the member count/financial summary update.
- **Cancel registration:** the active roster entry disappears, the record moves
  to Canceled, and no new membership is counted.

### Online 6 — Identity/contact review

Use a person whose submitted identity differs from the suggested member enough
to require confirmation. Do not assume the match is correct.

Expected result:

- Payment and registration are preserved.
- Needs Review clearly identifies the reason.
- Confirm Match keeps the existing canonical member information.
- Approve New Angler creates a genuinely different member only when that is the
  correct decision.

### Online 7 — Online cancellation

Create a normal paid test registration that does not need review. Cancel it
from the main roster controls.

Expected result:

- It disappears from the active registration list.
- It appears in Canceled.
- It is not counted in active roster or Early Entries totals.
- The payment/registration history remains auditable.

## Part 3 — Walk-ups

### Walk-up 1 — New member, Solo, cash

Open Add Walk-Up and enter one new synthetic person.

- Entry type: Solo
- Payment method: Cash
- Membership: Joining / Purchasing
- Pots: None
- Confirm the paper waiver was signed before saving.

Expected result:

- The walk-up saves with an automatic registration number.
- The $40 membership is included in the collected total.
- The new member is synchronized to All Members.
- Check the active roster, then use Check In.

### Walk-up 2 — Existing member selected from search

Search for an existing member who is not already in the tournament and select
the matching record. Keep the canonical member information unchanged.

- Entry type: Solo
- Payment method: Cash or Card
- Membership: Current Member
- Pots: None

Expected result:

- The walk-up saves without creating a duplicate member.
- Membership fee is $0.
- The entry appears in Walk-Ups/All Registrations and can be checked in.

### Walk-up 3 — Team with options

Enter two people as a team and select at least one existing member plus one new
member.

- Entry type: Team
- Payment method: Card or Other
- Big Bass: selected
- Insurance: selected
- Member pot: Silver

Expected result:

- Both anglers are saved on one registration.
- Only the new angler receives the $40 membership charge.
- All selected options and the total collected are correct.
- The team appears in the roster and financial summary.

### Walk-up 4 — Identity review, then check-in

Use a deliberately mismatched name or a duplicate-email test identity only for
this controlled staging scenario.

Expected result:

- The paid walk-up is saved rather than lost.
- Needs Review identifies the identity issue.
- Resolve the review, then use Check In.
- The walk-up is not charged again and remains visible in the roster.

## Final group review

Have the partner explain what each area is for:

- **All Registrations:** complete active and canceled registration history.
- **Needs Review:** registrations requiring an identity or membership decision.
- **Walk-Ups:** tournament-day registrations entered by staff.
- **Check-Ins:** entries cleared for tournament participation.
- **Canceled:** registrations removed from the active roster but retained for
  history.
- **All Members:** canonical member records, separate from registration
  snapshots.
- **Financial Summary:** collected tournament money, membership counts, pots,
  and reconciliation indicators.
- **Early Entries:** the public-facing list anglers use to verify registration.

## Notes for the facilitator

- Let the partner click and type. Explain only the next action.
- After each save or payment, pause for the seven-item check above.
- If something looks wrong, record the registration number and stop before
  changing data.
- A membership or identity review is not automatically a failed payment.
- Never ask someone to pay again until Square and Payment Recovery have been
  checked.
- Capture feedback separately from defects so intentional workflow decisions are
  not reopened during the walkthrough.

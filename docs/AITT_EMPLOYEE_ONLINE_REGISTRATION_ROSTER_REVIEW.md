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
| 2 | A Team is missing Angler 2. | The Team cannot proceed until Angler 2 is entered. | Customer or Tournament Director. | The correction happens before payment and no incomplete Team reaches the roster. |
| 2a | An unusual duplicate or same person appears twice. | Save the entry and place it in Needs Review; do not create a special customer-facing duplicate workflow. Staff may confirm, approve a new angler, or cancel it. | Tournament Director. | The registration and payment remain visible while the Director decides. |
| 3 | Someone selects Current Member but has no active membership for the season. | The registration and payment may proceed, then the entry goes to membership Needs Review. Staff contacts the angler, confirms the $40 membership with **Confirm Membership**, or cancels the registration if they decline. | Tournament Director. | The registration remains on the roster, check-in stays gated until Confirm Membership resolves the review, and Payment Recovery retains an informational follow-up record. |
| 4 | A name, address, phone number, email, ZIP code, or other contact detail is misspelled, outdated, or slightly different from the member record. | The entry is saved and may go to Needs Review. Staff confirms the person or approves a new angler; the roster does not edit member information. | Tournament Director. | The existing All Members record remains unchanged unless staff later edits it in All Members. |
| 5 | Two people share an email address, such as spouses or family members. | Registration is allowed. Each person may retain a separate All Members record with the shared email. | Tournament Director if review is shown. | Confirm the person; do not block the entry solely because the email is shared. |
| 6 | Square declines the card, the browser closes, the customer refreshes, the payment button is double-clicked, or the network interrupts checkout. | A declined payment does not create a confirmed registration. A successful Square payment must not require a second charge. Durable payment recovery and idempotency handle interruptions. | System first; Admin staff uses Payment Recovery if a paid attempt does not finish registration. | Check Square status, payment attempts, registration state, and the Admin Payment Recovery page before asking anyone to pay again. |
| 7 | The confirmation email is delayed, rejected, or never delivered. | The registration remains valid. Email delivery is retryable or can be followed up manually; email failure does not reverse payment or registration. | System records delivery state; Admin staff follows up when needed. | The roster and payment records show the entry even if email delivery is not complete. |

## Walkthrough sequence

Use a separate staging test entry for each scenario. After every successful
payment, confirm the same entry in all relevant places:

1. Customer-facing confirmation and registration number.
2. Admin Registration Review roster.
3. All Registrations history and payment state.
4. Tournament Funds Summary and related counts.
5. Payment Recovery, including the informational manual-membership follow-up history.
6. Membership or Needs Review records when the test involved membership or identity.
7. Check-In availability after any required review is resolved.

## Staff rehearsal structure

Run the walkthrough in stages. Each participant should perform the clicks in
staging rather than only watch a demonstration.

### Stage 1 — Public online registration

- Select the tournament and registration type.
- Enter a Solo registration and a Team registration.
- Search for an existing member and enter a new angler.
- Review membership choices, side pots, payout pot selection, waiver
  acknowledgment, totals, Square handoff, and confirmation.
- Explain the difference between registration number, payment status, and
  tournament-morning check-in.

### Stage 2 — Tournament Director roster review

- Open the selected tournament in Registration Review.
- Read the roster columns: participants, member status, membership fees, pots,
  insurance, Big Bass, registered time, and Check-In / Review status.
- Open All Registrations and explain active versus canceled history.
- Review Payment Recovery and the non-interactive manual membership follow-up
  history.
- Open the Financial Summary and connect the displayed totals to recorded
  registrations and payments.

### Stage 3 — Tournament-morning walk-up process

- Open Add Walk-Up and confirm the default Team workflow.
- Use Member Search when appropriate, while still completing every required
  contact field.
- For a Solo walk-up, Angler 2 is disabled. Switch the entry type back to Team
  before entering a second angler.
- Confirm both team anglers, membership choices, payment method, member pot,
  side pots, total collected, waiver reminder, Save Walk-Up, and Cancel Walk-Up.
- Explain that the next registration number is assigned automatically and that
  the boat number is handled during tournament check-in.
- Check the saved entry in the active roster and confirm it can be checked in
  when all review requirements are resolved.

### Stage 4 — Failure and recovery rehearsal

For each failure scenario, staff should answer three questions:

1. What does the customer or staff member see?
2. Does the registration or payment still exist?
3. What is the next manual step, if any?

Practice missing fields, membership Needs Review, contact differences, a
missing Angler 2, shared-email identity review, payment interruption, payment
decline, email failure, walk-up cancellation, and a manual $40 membership
collection.

### Stage 5 — Escalation and debrief

- Staff should pause and contact the Tournament Director when the payment
  result is uncertain, rather than charging again.
- The Tournament Director checks Square, the roster, All Registrations, Payment
  Recovery, and the Financial Summary before deciding what to do.
- If a correction is beyond the documented workflow, preserve the evidence and
  escalate it to the owner before changing records.
- Record the scenario, observed result, expected result, and any follow-up
  change required after each rehearsal.

## Additional Admin Center walkthrough

The staff review should also cover the surrounding tools that support a
tournament from preparation through results. Staff should understand what each
area does even when only the owner is authorized to make the final change.

### Public information and tournament setup

- **Rules:** locate the Official Tournament Rules and explain which rules are
  controlled documents rather than casual announcement text.
- **Paper waiver:** open the standalone Participant Liability Waiver Form from
  Admin Center > Forms, print it when needed, and retain both participant
  signatures with the tournament registration records.
- **Paper-form synchronization:** whenever the Official Rules or Participant
  Liability Waiver changes, review the paper Tournament-Morning Registration
  Form before release. Confirm its acknowledgment wording, participant fields,
  fee options, and identifiers still match the current website and documents.
  Do not use older printed forms after a rules or waiver update.
- **FAQ:** use the FAQ to answer common angler questions and verify that answers
  agree with the Official Rules.
- **Announcements:** create, edit, publish, and remove an announcement in
  staging; review the title, dates, practice information, registration timing,
  and public wording before saving.
- **Tournament Info:** review tournament name, date, lake, ramp, hours, stop
  fishing, launch details, registration status, practice information, and
  presented-by text. Confirm the selected tournament before saving.

### Money and roster operations

- Review online payment status, walk-up payment method, membership dues,
  Payment Recovery, Financial Summary, canceled registrations, and manual
  collection history.
- Confirm that staff do not edit calculated totals or ask a customer to pay
  again while a Square result is uncertain.
- Practice checking a saved entry from Registration Review through Check-In.

### CSV import and tournament completion

- Download and identify the correct registration roster before tournament day.
- Review the WeighFish CSV import screen and confirm the selected tournament
  before importing.
- Understand normal zero-fish and zero-weight rows versus identity or duplicate
  rows that require review.
- Reconcile unmatched names and misspellings without silently overwriting
  registration evidence.
- Review payout, Insurance Pot, closeout, and public-results readiness at a
  high level.
- The staff walkthrough should explain the path through closeout and results,
  even if the owner performs the final approval and publication.

## Responsibility boundaries

| Area | Staff should learn | Current primary responsibility |
|---|---|---|
| Online registration and walk-ups | Complete entries, collect payment, resolve ordinary prompts, and escalate uncertainty. | Tournament Director staff, with owner support. |
| Membership validation and review | Verify information, explain the $40 membership when required, and use Confirm Membership or Cancel Registration. | Tournament Director staff. |
| Roster, Check-In, and cancellation | Review entries, check anglers in, and preserve cancellation evidence. | Tournament Director staff. |
| Financial Summary and Payment Recovery | Read totals, identify unusual payment states, and never recharge uncertain customers. | Tournament Director staff; owner handles unusual corrections. |
| Rules, FAQ, announcements, and Tournament Info | Locate information and prepare or review changes carefully. | Staff may assist; owner approves sensitive public changes. |
| CSV import and identity reconciliation | Import the correct file, review mismatches, and escalate ambiguous names. | Tournament Director staff with owner support. |
| Closeout, results, AOY, and Championship publication | Understand the sequence and required evidence. | Owner performs final approval and publication for now. |

## Final pre-launch audit scope

The final Codex audit and the independent Claude audit should use the same
priority order. Compare findings after both audits and classify each item as a
launch blocker, a Tournament Director manual step, or post-launch hardening.

### Online-registration launch boundary

The launch date for opening online registration ends at successful registration,
payment collection, walk-up support, check-in, and reliable roster/financial
evidence. CSV import and every workflow after CSV import are not required to
open registration. They will be completed, tested, and audited during the
month before the tournament, with WeighFish available as the operational
fallback.

### Launch-critical

- Successful online registration persistence after verified payment.
- Square payment success, decline, interruption, retry, and recovery behavior.
- No lost registration when the browser closes, refreshes, or the network
  briefly fails.
- Required-field and waiver behavior.
- Team/Angler rules and membership review behavior.
- Roster visibility in Registration Review and All Registrations.
- Walk-up save, cancel, payment recording, membership validation, and check-in.
- Financial Summary and payment-related counts being understandable and tied to
  recorded registrations.

### Important but not a launch blocker

- Payment Summary refinements, Generate Checks refinements, and reconciliation
  conveniences when the same evidence is available in WeighFish.
- CSV export/import and roster identity reconciliation. These are valuable to
  verify during the month before the tournament, but WeighFish remains the
  operational fallback and they are not part of the online-registration launch
  gate.
- Operational reporting improvements that do not prevent registration,
  payment collection, check-in, or roster recovery.

### Post-launch hardening

- Public results presentation and publishing polish.
- Winner Circle display and public tournament result accuracy review.
- AOY point standings and Championship projections on the public website.
- CSV import, final closeout, payout refinements, results, AOY, Championship,
  and Winner Circle work that can be verified independently in WeighFish before
  publication.

Public publishing remains deliberately owner-controlled. A registration or
payment must not be delayed because results, AOY, Championship, or Winner
Circle data needs additional review later.

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
- Confirm the person in Needs Review when the match is clear. Keep the existing
  canonical member information during that review; make any later contact
  cleanup only from All Members.
- If the person cannot be confirmed, approve a new angler or cancel the
  registration. Do not edit member data from the roster.
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

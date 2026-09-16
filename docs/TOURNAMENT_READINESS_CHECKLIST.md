# AITT Tournament Readiness Checklist

Use this checklist as the authoritative, auditable record for:
Registration → Payment → Public Entries → Admin Roster → Tournament Morning → WeighFish → Results → Payouts → AOY/Championship → Publishing and Closeout.

Every item defaults to `Not Tested`. Automated results and actual staging-rehearsal evidence must be recorded separately. A critical `Fail`, `Blocked`, or `Not Tested` item prevents production approval.

Allowed statuses: `Not Tested`, `Pass`, `Fail`, `Blocked`, `Not Applicable`.

## Readiness summary

| Area | Critical Items | Passed | Failed | Blocked | Not Tested | Ready? |
|---|---:|---:|---:|---:|---:|---|
| Registration and Rules | 15 | 0 | 0 | 0 | 15 | No |
| Payments and Financial Reconciliation | 17 | 0 | 0 | 0 | 17 | No |
| Confirmation Emails | 10 | 0 | 0 | 0 | 10 | No |
| Public Early Entries and Roster Consistency | 10 | 0 | 0 | 0 | 10 | No |
| Admin Roster and Registration Review | 16 | 0 | 0 | 0 | 16 | No |
| Tournament Morning | 12 | 0 | 0 | 0 | 12 | No |
| WeighFish CSV Import and Reconciliation | 14 | 0 | 0 | 0 | 14 | No |
| Results and Displayed Data | 11 | 0 | 0 | 0 | 11 | No |
| Payouts and Check Writing | 15 | 0 | 0 | 0 | 15 | No |
| AOY and Championship | 11 | 0 | 0 | 0 | 11 | No |
| Publishing and Closeout | 12 | 0 | 0 | 0 | 12 | No |

## Release gates

- [ ] No critical item is `Fail`.
- [ ] No critical item is `Blocked`.
- [ ] No critical item is `Not Tested`.
- [ ] Actual staging rehearsal is complete.
- [ ] Expected and actual financial calculations reconcile.
- [ ] Production schema compatibility is confirmed.
- [ ] Rollback procedure and target are confirmed.
- [ ] Explicit production approval is received.

## 1. Registration and Rules

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| REG-01 | Tournament, date, lake, status, and pricing | Match approved Tournament Information | — | Not Tested | — |
| REG-02 | Team registration path | Valid team registration completes | — | Not Tested | — |
| REG-03 | Individual registration path | Valid solo registration completes | — | Not Tested | — |
| REG-04 | Required fields and validation | Missing/invalid fields are rejected | — | Not Tested | — |
| REG-05 | Base Entry pricing | Correct price is shown and calculated | — | Not Tested | — |
| REG-06 | Membership selection and $40-per-person handling | Membership fees apply per eligible person | — | Not Tested | — |
| REG-07 | Bronze, Silver, Gold, Insurance pricing | Prices match approved rules | — | Not Tested | — |
| REG-08 | Membership-required options | Ineligible options cannot be selected | — | Not Tested | — |
| REG-09 | Ineligible combinations | Invalid combinations are blocked | — | Not Tested | — |
| REG-10 | Duplicate submission prevention | Duplicate registration is prevented or safely identified | — | Not Tested | — |
| REG-11 | Registration totals and amount | Displayed total equals selected components | — | Not Tested | — |
| REG-12 | Desktop registration | Layout and validation work | — | Not Tested | — |
| REG-13 | Mobile registration | Layout and validation work | — | Not Tested | — |
| REG-14 | Rules and disclosures | Correct approved text is displayed | — | Not Tested | — |
| REG-15 | Registration state | Open/closed state follows tournament settings | — | Not Tested | — |

## 2. Payments and Financial Reconciliation

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| PAY-01 | Processor amount | Amount sent equals AITT registration amount | — | Not Tested | — |
| PAY-02 | Successful payment | Payment completes and is recorded | — | Not Tested | — |
| PAY-03 | Failed payment | Failure is visible and no false completion occurs | — | Not Tested | — |
| PAY-04 | Cancelled/abandoned payment | Abandoned attempt remains non-completed | — | Not Tested | — |
| PAY-05 | Duplicate payment prevention | Duplicate charge/registration is prevented | — | Not Tested | — |
| PAY-06 | Payment status callback | Processor state returns correctly to AITT | — | Not Tested | — |
| PAY-07 | Registration creation condition | Registration is created only under approved payment conditions | — | Not Tested | — |
| PAY-08 | Processor/ AITT amount reconciliation | Individual amounts match exactly | — | Not Tested | — |
| PAY-09 | Refund/credit behavior | Final business rule is documented and tested | — | Not Tested | — |
| PAY-10 | Tournament total collected | Tournament-level total exists or is recorded as a known requirement | — | Not Tested | — |
| PAY-11 | Complete-roster total | Total includes all qualifying registrations, not one page | — | Not Tested | — |
| PAY-12 | Displayed total reconciliation | Displayed total equals paid-registration sum | — | Not Tested | — |
| PAY-13 | Exported financial total | Export matches displayed total | — | Not Tested | — |
| PAY-14 | Processor reconciliation | Processor total reconciles to AITT | — | Not Tested | — |
| PAY-15 | Bank settlement reconciliation | Deposits reconcile after documented fees/timing | — | Not Tested | — |
| PAY-16 | Walk-up financial separation | Cash/check/other are separated from online collections | — | Not Tested | — |
| PAY-17 | Financial discrepancy audit | Any discrepancy is visible and auditable | — | Not Tested | — |

## 3. Confirmation Emails

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| EML-01 | Successful online confirmation | Exactly one confirmation is generated | — | Not Tested | — |
| EML-02 | Recipient | Intended recipient receives it | — | Not Tested | — |
| EML-03 | Duplicate-send prevention | No duplicate email is sent | — | Not Tested | — |
| EML-04 | Failed/incomplete registration | No successful-registration email is sent | — | Not Tested | — |
| EML-05 | Email data | Name, date, lake, anglers, selections, amount, instructions are correct | — | Not Tested | — |
| EML-06 | Wording approval | Required confirmation wording is reviewed and approved | — | Not Tested | — |
| EML-07 | Walk-up confirmation | Intended walk-up confirmation is generated | — | Not Tested | — |
| EML-08 | Walk-up content | Email accurately identifies walk-up registration | — | Not Tested | — |
| EML-09 | Delivery recovery | Delivery failure is visible or recoverable | — | Not Tested | — |
| EML-10 | Staging safety | Staging tests cannot contact real participants | — | Not Tested | — |

## 4. Public Early Entries and Roster Consistency

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| PUB-01 | Eligible registrations | Correct registrations appear | — | Not Tested | — |
| PUB-02 | Privacy-safe fields | Only approved public fields appear | — | Not Tested | — |
| PUB-03 | Names | Names match authoritative roster | — | Not Tested | — |
| PUB-04 | Boat numbers | Boat numbers match | — | Not Tested | — |
| PUB-05 | Membership/side pots | Public display follows approved rules | — | Not Tested | — |
| PUB-06 | Counts | Counts match authoritative roster | — | Not Tested | — |
| PUB-07 | Sorting | Ordering is correct | — | Not Tested | — |
| PUB-08 | Pagination | All pages match the complete roster | — | Not Tested | — |
| PUB-09 | Updates and exports | Changes propagate to PDF, CSV, print, mobile, and admin views | — | Not Tested | — |
| PUB-10 | Invalid entries excluded | Cancelled, failed, duplicate, and invalid records are absent | — | Not Tested | — |

## 5. Admin Roster and Registration Review

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| ADM-01 | Registrations count | Complete roster count is correct | — | Not Tested | — |
| ADM-02 | Needs Review count/filter | Count and filter cover complete roster | — | Not Tested | — |
| ADM-03 | Walk-Ups count/filter | Count and filter cover complete roster | — | Not Tested | — |
| ADM-04 | Check-Ins count/filter | Count and filter work correctly | — | Not Tested | — |
| ADM-05 | Pending Attendance count/filter | Count and filter work correctly | — | Not Tested | — |
| ADM-06 | All Registrations view | Complete roster is available | — | Not Tested | — |
| ADM-07 | Search | Search covers complete roster | — | Not Tested | — |
| ADM-08 | Pagination/page size | Navigation and page sizes are correct | — | Not Tested | — |
| ADM-09 | Add Walk-Up | Walk-up creation works safely | — | Not Tested | — |
| ADM-10 | Edit/review actions | Authorized actions work and are audited | — | Not Tested | — |
| ADM-11 | Export and print | Outputs match roster | — | Not Tested | — |
| ADM-12 | Audit/history | Registration history is visible and accurate | — | Not Tested | — |
| ADM-13 | Total Money Collected | Display exists and reconciles, or remains a known requirement | — | Not Tested | — |
| ADM-14 | No Show count/filter | No Show control exists and works across all pages, or remains a known requirement | — | Not Tested | — |
| ADM-15 | Large-field No Show search | One No Show is found in a 100+ boat field | — | Not Tested | — |
| ADM-16 | Filter clearing | Clearing filters restores the complete roster | — | Not Tested | — |

## 6. Tournament Morning

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| MOR-01 | Online check-in | Registered teams can be checked in | — | Not Tested | — |
| MOR-02 | Walk-up creation | Walk-ups are created through supported workflow | — | Not Tested | — |
| MOR-03 | Boat numbering | Numbers are sequential and unique | — | Not Tested | — |
| MOR-04 | Missing preregistered teams | Missing teams are identifiable | — | Not Tested | — |
| MOR-05 | Pending attendance | Pending count reaches zero before launch decision | — | Not Tested | — |
| MOR-06 | No Show mark/reversal | Mark and reversal work safely | — | Not Tested | — |
| MOR-07 | Attendance exclusivity | Checked In and No Show cannot coexist | — | Not Tested | — |
| MOR-08 | Withdrawal/DQ | Supported withdrawal and DQ paths preserve auditability | — | Not Tested | — |
| MOR-09 | Paper reconciliation | Paper forms reconcile to AITT roster | — | Not Tested | — |
| MOR-10 | Membership reconciliation | Membership states reconcile | — | Not Tested | — |
| MOR-11 | Duplicate-member detection | Duplicate identity risks are surfaced | — | Not Tested | — |
| MOR-12 | Final field | AITT roster matches the WeighFish field | — | Not Tested | — |

## 7. WeighFish CSV Import and Reconciliation

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| WF-01 | Valid CSV | Valid CSV imports successfully | — | Not Tested | — |
| WF-02 | Complete field | Every roster team is represented | — | Not Tested | — |
| WF-03 | Team matching | Teams match the authoritative roster | — | Not Tested | — |
| WF-04 | Normal zero result | Zero-fish/zero-weight row imports normally | — | Not Tested | — |
| WF-05 | Checked In zero result | Checked In zero result retains participation treatment | — | Not Tested | — |
| WF-06 | No Show zero result | No Show appears as ordinary zero-weight result | — | Not Tested | — |
| WF-07 | Attendance eligibility | No Show affects only AOY/Championship credit | — | Not Tested | — |
| WF-08 | Missing row | Missing rows are identified | — | Not Tested | — |
| WF-09 | Unmatched row | Unmatched rows require review | — | Not Tested | — |
| WF-10 | Duplicate row | Duplicate ownership is blocked | — | Not Tested | — |
| WF-11 | Malformed/numeric rows | Invalid CSV and numeric values are rejected clearly | — | Not Tested | — |
| WF-12 | Competitive fields | Fish, weight, penalties, Big Bass, and placement persist correctly | — | Not Tested | — |
| WF-13 | Reimport/idempotency | Reimport does not create duplicate results | — | Not Tested | — |
| WF-14 | 14-team staging rehearsal | Actual representative 14-team CSV rehearsal completes | — | Not Tested | — |

## 8. Results and Displayed Data

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| RES-01 | Complete results | All teams are displayed | — | Not Tested | — |
| RES-02 | Placements/ties | Order and ties are correct | — | Not Tested | — |
| RES-03 | Zero-weight teams | Zero-weight teams display correctly | — | Not Tested | — |
| RES-04 | No Show result | No Show displays as zero-weight result | — | Not Tested | — |
| RES-05 | Big Bass/Big Bag | Winners and values are correct | — | Not Tested | — |
| RES-06 | Names | Team/angler names are correct | — | Not Tested | — |
| RES-07 | Fish/weight | Fish count and weight are correct | — | Not Tested | — |
| RES-08 | Penalties | Penalties display correctly | — | Not Tested | — |
| RES-09 | Responsive results | Desktop, tablet, and mobile remain clean | — | Not Tested | — |
| RES-10 | Public agreement | Public results match approved imported results | — | Not Tested | — |
| RES-11 | Publication lock | Results remain unpublished until explicit approval | — | Not Tested | — |

## 9. Payouts and Check Writing

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| PAYO-01 | Base payouts | Correct places and amounts | — | Not Tested | — |
| PAYO-02 | Bronze | Correct eligibility and amounts | — | Not Tested | — |
| PAYO-03 | Silver | Correct eligibility and amounts | — | Not Tested | — |
| PAYO-04 | Gold | Correct eligibility and amounts | — | Not Tested | — |
| PAYO-05 | Insurance | Correct eligibility and amounts | — | Not Tested | — |
| PAYO-06 | Big Bass | Correct payouts | — | Not Tested | — |
| PAYO-07 | Big Bag | Correct payout | — | Not Tested | — |
| PAYO-08 | Pot eligibility | No ineligible participant is paid | — | Not Tested | — |
| PAYO-09 | Places/percentages | Places, percentages, and rounding are correct | — | Not Tested | — |
| PAYO-10 | Insurance first-out | First-out-of-money logic is correct | — | Not Tested | — |
| PAYO-11 | Assignments | Team and category assignments are correct | — | Not Tested | — |
| PAYO-12 | Checks | Individual check amounts are correct | — | Not Tested | — |
| PAYO-13 | Liability total | Checks equal total payout liability | — | Not Tested | — |
| PAYO-14 | Collected/allocated money | Payout totals reconcile to approved funds | — | Not Tested | — |
| PAYO-15 | Check list/closeout | Printable list and financial completion work | — | Not Tested | — |

## 10. AOY and Championship

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| AOY-01 | AOY points | Points match approved finishes | — | Not Tested | — |
| AOY-02 | Best 5 of 8 | Calculation is correct | — | Not Tested | — |
| AOY-03 | Membership eligibility | Eligibility is correct | — | Not Tested | — |
| AOY-04 | Checked In zero | Participating zero result receives normal treatment | — | Not Tested | — |
| AOY-05 | No Show points | No Show receives zero points | — | Not Tested | — |
| AOY-06 | No Show Championship | No Show receives no participation credit | — | Not Tested | — |
| AOY-07 | 5-of-8 exclusion | No Show tournament does not count toward 5-of-8 | — | Not Tested | — |
| AOY-08 | DQ | DQ treatment matches approved rules | — | Not Tested | — |
| AOY-09 | Identity consistency | Individual/team identities remain consistent | — | Not Tested | — |
| AOY-10 | Publication timing | Standings update only after approved results | — | Not Tested | — |
| AOY-11 | Manual reconciliation | Expected and actual rehearsal calculations agree | — | Not Tested | — |

## 11. Publishing and Closeout

| ID | Test | Expected Result | Actual Result / Evidence | Status | Tested By / Date |
|---|---|---|---|---|---|
| CLS-01 | Internal approval | Results receive internal approval | — | Not Tested | — |
| CLS-02 | Public publication | Approved results publish successfully | — | Not Tested | — |
| CLS-03 | Winner/pot displays | Winner, Big Bass, Big Bag, and payout displays are correct | — | Not Tested | — |
| CLS-04 | AOY publication | AOY output is correct | — | Not Tested | — |
| CLS-05 | Photos | Photo workflow is complete or dispositioned | — | Not Tested | — |
| CLS-06 | Financial completion | Financial closeout is complete | — | Not Tested | — |
| CLS-07 | Audit trail | Operational and financial audit records are complete | — | Not Tested | — |
| CLS-08 | Paper records | Paper records are transferred and retained | — | Not Tested | — |
| CLS-09 | Public smoke tests | Public routes pass after publication | — | Not Tested | — |
| CLS-10 | Authenticated smoke tests | Admin routes/workflows pass after publication | — | Not Tested | — |
| CLS-11 | Responsive review | Desktop/mobile review passes | — | Not Tested | — |
| CLS-12 | Compatibility/rollback | Production schema compatibility and rollback target are confirmed; post-release health is recorded | — | Not Tested | — |

## Known Requirements Before Final Readiness

These are documented requirements only; do not implement them as part of this checklist task:

1. Add tournament-level **Total Money Collected** to the roster and reconcile it against payment processor and bank totals.
2. Add a **No Show** roster filter/button that searches the full roster across pagination.
3. Update registration-confirmation email text when final wording is supplied.
4. Determine through code inspection and controlled staging testing whether walk-up registrations generate confirmation emails; implement the approved behavior if they do not.

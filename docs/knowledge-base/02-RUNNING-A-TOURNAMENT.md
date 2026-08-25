# Running a Tournament

This is the Tournament Director's concise runbook. The complete lifecycle and
business-rule authority is [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md).
The [Official Tournament Rules](../TOURNAMENT_RULES.md) control competition.

## Before tournament morning

1. Select the correct tournament and verify its saved information.
2. Open that tournament's registration independently when approved. The current
   homepage tournament does not control whether another future event can register.
3. Review paid registrations, memberships, side-pot choices, and identity-review
   items. Registration is permissive, review is corrective, and failed payment
   is blocking.
4. Confirm Tournament Preparation only after Registration Review is resolved and
   paper memberships are recorded. Preparation cannot be unchecked while real
   protected downstream work remains.
5. Print the Registration & Check-In roster.

## Tournament morning

1. Check in every online team and confirm its boat number.
2. Register walkups on site. Assign sequential boat numbers after the online
   registrations; never reuse a cancelled number.
3. Announce missing preregistered teams, finalize the field, and launch.
4. Reconcile walkups and paper records in AITT, then perform Membership
   Reconciliation separately.
5. Confirm the final AITT field and WeighFish field agree. The roster is an
   operational check-in tool, not the accounting ledger.

## Weigh-in through publication

1. Complete scoring in WeighFish and export the final CSV.
2. Import it into Tournament Manager. Verify every finish, weight, Big Bass,
   payout field, participation state, registration owner, and Competitive Record.
3. Resolve all manual review. One non-null tournament registration may belong to
   only one working result.
4. Calculate and review payouts. Insurance is calculated inside this combined
   payout/closeout flow; it is not a separate operational step.
5. Approve payouts and complete financial closeout before website work.
6. Upload and verify winner and Big Bass photographs.
7. Publish Official Results only after every readiness check passes.
8. Verify the public Results pages and then calculate/recalculate AOY and
   Championship projections.

Anglers waiting for payment take priority over publication. The public payout
total must reconcile to Main Tournament, Bronze, Silver, Gold, Big Bass, and
Insurance exactly once, using the completed closeout total as authority.

## Corrections and resets

- Before publication, use supported working-result review and reset controls.
- Reset Payout Calculations removes the current unpublished closeout and its
  unpublished nested Insurance result. Published Insurance history is protected.
- There is no implemented **Exclude Invalid Result** action. Do not present a
  staging SQL repair or competitive disqualification as a normal substitute.
- After publication, use only an authorized audited correction workflow; never
  directly rewrite Official Results.
- The next clean staging rehearsal must explicitly test a competitive DQ and
  verify its Results, payout, AOY, Championship, and audit effects.

## Related documents

- [Admin Center Guide](05-ADMIN-CENTER-GUIDE.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)
- [Launch Test Plan](AITT-LAUNCH-TEST-PLAN.md)

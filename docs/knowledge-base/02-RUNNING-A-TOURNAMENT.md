# Running a Tournament

## Purpose

Use this sequence for every AITT tournament. Do not skip a verification because
the previous event worked.

## 2026–2027 schedule

The Regular Season contains eight events: Eagle Mountain (November 1), Squaw
Creek (November 22), Ray Hubbard (December 13), Granbury (January 17), Squaw
Creek (February 14), Ray Roberts (March 14), Tawakoni (April 25), and
Lewisville (May 16). Tournament numbers 1–8 remain fixed even if a date changes.

The Championship is a separate two-day event on June 12–13, 2027. Its lake is
TBD. It is not Tournament #9 and does not count as a Regular Season event.

| Step | What to do and why | Before continuing / verify afterward | Stop condition |
| --- | --- | --- | --- |
| 1. Tournament Reset | On selected Tournament Detail, preview and reset tournament activity. This creates a clean operational start without deleting setup, members, or seasons. | Confirm the UUID-selected tournament and deletion counts; afterward status is Ready for Registration and activity counts are zero. | Wrong tournament, unexpected counts, missing preview, or production reset disabled. |
| 2. Prepare Tournament | Complete name, lake, date, ramp, registration information, practice information, and public setup. | Required information is saved and reloads unchanged. | Any value is missing, stale, or belongs to another event. |
| 3. Confirm Featured Tournament | Mark the intended event featured and visible. | Homepage title, date, image, registration/practice information match Admin. | More than one event appears featured or the wrong event displays. |
| 4. Open Registration | Set the tournament's registration state and configured window. | Registration page accepts an eligible attempt; homepage remains informational. | Registration page disagrees with configured state. |
| 5. Receive and review registrations | Use Registration Review and the Tournament Manager preparation roster to review supported entries, payment status, memberships, side pots, and identity issues. | Only genuinely confirmed records are treated as entries. | Live Square checkout is not operational; do not treat a quote or browser confirmation as paid registration. |
| 6. Verify Early Entries | Compare count and names on public Entries with saved registrations. | No private payment/admin data is public; every confirmed early entry appears once. | Count, identity, tournament, or privacy mismatch. |
| 7. Review memberships | Search existing anglers and add confirmed physical-form memberships when needed. | Active season, status, First Eligible Tournament, and contact identity are correct. | Duplicate/uncertain identity or wrong season/eligibility event. |
| 8. Close Registration | Allow the configured registration page to reject submission. | A new submission is prevented and receives a clear message. | Homepage status is being used as the control or submission still succeeds. |
| 9. Confirm official field | Reconcile saved early entries, tournament-morning WeighFish entries, withdrawals, and corrections. | One complete field is ready in WeighFish. | Unresolved duplicate, missing team, or uncertain member identity. |
| 10. Conduct tournament and weigh-in | Enter tournament results in WeighFish under the Official Rules. | Finishing order, weights, fish count, Big Bass, payouts, DQ/no-show status, and the complete field are final. | Protest, correction, or Director review remains open. |
| 11. Import WeighFish immediately | As soon as weigh-in is final, export the complete official CSV and import it into Tournament Manager for the selected tournament. | Parser accepts it and imported row count equals the official field. | Malformed file, wrong tournament, partial field, or unexplained totals. |
| 12. Review, validate, and reconcile | Compare every imported row with WeighFish. Resolve required registration and identity-reconciliation reviews and mark results verified. | Order, names, weights, payout categories, participation, stable identities, and eligibility decisions are resolved. | Any unresolved row, identity, payout label, or source mismatch. |
| 13. Calculate Insurance Pot | Enter the participant count, calculate the true 1-in-5 payout with its one-place minimum, and assign eligible winners beginning outside the Tournament Entry payout. | Pot total, paid places, and winners are complete and saved. | Entry count, total, eligibility, or winner order does not reconcile. |
| 14. Calculate payouts and prepare checks | Use Calculate Payouts and On-Site Tournament Closeout to reconcile collections, assign each place/category to a payee, generate place-by-place checks, and track delivery. | Every payout is explainable and the closeout difference is zero. | Missing payee, duplicate category, wrong amount, or nonzero difference. |
| 15. Complete financial closeout | Confirm all required checks/payout assignments and delivery status before moving to website work. | Tournament payout closeout is marked complete. | Any angler payment remains unresolved. |
| 16. Upload and review images | After payout work, upload or replace the correct Overall Winner and Big Bass photos. | Preview and reload show the intended people/event. | Wrong image, unclear ownership, failed upload, or cross-event path. |
| 17. Publish Official Results | Review the public preview, results, payouts, Insurance Pot, and images; then publish once. | Tournament Manager records an Official Results publication. | Any readiness item is pending or any preview value disagrees with verified source data. |
| 18. Verify public results | Check Winner's Circle, Results index, and `/results/[slug]`. | Event appears once and order, weights, names, Big Bass, payouts, and images agree. | Missing archive, duplicate, wrong slug, or mismatched value. |
| 19. Recalculate AOY | After Official Results are published and identities/memberships are resolved, run the approved AOY processing. | Only published eligible Regular Season results contribute; best five of eight determine final AOY. | Calculation evidence is missing or totals cannot be explained. |
| 20. Recalculate Championship qualification | Run the separate Championship qualification processing as appropriate. | Member teams receive participation credit only for qualifying appearances; five of eight are required. | Qualification is being inferred from AOY rank or unresolved eligibility. |
| 21. Verify season displays | Compare homepage AOY, Standings, and available Championship information with the calculated projections. | Ranks, points, event counts, and qualification status agree. | Any display uses stale or different projection data. |
| 22. Confirm archive complete | Record that Official Results, payout closeout, AOY evidence, qualification evidence, images, and public pages agree. | Temporary CSV/image workflow files are not treated as the permanent record; saved official records remain durable. | Any mismatch, missing source record, or unexplained correction. |

## After-weigh-in priority

Anglers waiting for payment take priority over website work. Complete steps
11–15—import, verification, reconciliation, Insurance Pot, payout checks, and
financial closeout—before photos, public publication, AOY, or Championship
updates.

## Recovery principle

Before publication, correct the selected tournament's imported working results
through the documented review/correction controls and repeat verification.
After publication, do not directly edit Official Results. Use only the
authorized correction/reset workflow, record the reason, and verify the rebuilt
public, AOY, and Championship projections.

## Related Documents

- [Admin Center Guide](05-ADMIN-CENTER-GUIDE.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)
- [Launch Test Plan](AITT-LAUNCH-TEST-PLAN.md)

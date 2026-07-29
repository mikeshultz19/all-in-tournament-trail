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
| 5. Receive registrations | Monitor supported public entries and confirmed operational records. | Each accepted entry is durable and has one stable reference. | Public flow only produces a quote or payment cannot be confirmed; current launch build has this blocker. |
| 6. Verify Early Entries | Compare count and names on public Entries with saved registrations. | No private payment/admin data is public; every confirmed early entry appears once. | Count, identity, tournament, or privacy mismatch. |
| 7. Review memberships | Search existing anglers and add confirmed physical-form memberships when needed. | Active season, status, First Eligible Tournament, and contact identity are correct. | Duplicate/uncertain identity or wrong season/eligibility event. |
| 8. Close Registration | Allow the configured registration page to reject submission. | A new submission is prevented and receives a clear message. | Homepage status is being used as the control or submission still succeeds. |
| 9. Confirm official field | Reconcile saved early entries, tournament-morning WeighFish entries, withdrawals, and corrections. | One complete field is ready in WeighFish. | Unresolved duplicate, missing team, or uncertain member identity. |
| 10. Conduct tournament and weigh-in | Operate the event in WeighFish under the approved rules. | Finishing order, weights, Big Bass, payouts, DQ/no-show status are final. | Protest, correction, or Director review remains open. |
| 11. Import WeighFish | Export the complete official CSV and import it for the selected tournament. | Parser accepts it and imported row count equals the official field. | Malformed file, wrong tournament, partial field, or unexplained totals. |
| 12. Review and reconcile | Compare every imported row with WeighFish and stable AITT identities. | Order, names, weights, payout categories, participation, and eligibility decisions are resolved. | Identity reconciliation is not currently implemented; launch must stop here for authoritative AOY. |
| 13. Upload images | Upload or replace the correct Overall Winner and Big Bass photos. | Preview and reload show the intended people/event. | Wrong image, unclear ownership, failed upload, or cross-event path. |
| 14. Publish Official Results | Confirm final import and publish once. | Publication succeeds atomically and becomes immutable. | Current implementation permits mutation/non-atomic writes; do not launch until corrected. |
| 15. Verify Winner's Circle | Check latest winner, standings excerpt, payout summary, Big Bass, and photos. | All values agree with Official Results. | Any stale, invented, double-counted, or wrong-event value. |
| 16. Verify Featured Tournament | Confirm homepage now identifies the correct next/active event according to approved selection. | No completed event incorrectly remains featured unless intentionally configured. | Admin and homepage disagree. |
| 17. Verify Results pages | Check Results index and the event's `/results/[slug]` archive detail. | Event appears once; order, weights, names, Big Bass, and payouts agree. | Missing archive, duplicate, wrong slug, or editable published record. |
| 18. Verify AOY | Generate/recalculate from published Official Results after identity/membership reconciliation. | Tournament AOY positions and points follow the approved rules. | Current authoritative engine is absent. |
| 19. Verify homepage AOY top five | Compare the five displayed leaders. | Order is 2nd, 3rd, 1st, 4th, 5th and values match full Standings. | Missing published data, different totals, or wrong order. |
| 20. Verify Standings | Review rank, team, events, wins, Top 10s, and points where supported. | Best-five total and tie breakers are explainable from tournament history. | Current page lacks authoritative team/tie-break data. |
| 21. Verify Championship qualification | Recalculate qualifying stable-team participations separately from AOY. | Team progress matches eligible appearances and solo continuity. | Current calculation is absent. |
| 22. Confirm archive complete | Record that Official Results, AOY evidence, qualification evidence, images, and public pages agree. | Temporary CSV/image workflow files are no longer treated as permanent evidence; published records remain durable. | Any mismatch, missing source record, or unexplained correction. |

## Recovery principle

Before publication, correct the selected tournament's draft/import and repeat
verification. After publication, do not edit Official Results. A documented,
authorized correction process must preserve the original record and auditability;
the current software does not yet provide that complete process.

## Related Documents

- [Admin Center Guide](05-ADMIN-CENTER-GUIDE.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)
- [Launch Test Plan](AITT-LAUNCH-TEST-PLAN.md)

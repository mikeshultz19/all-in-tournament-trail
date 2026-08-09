# Admin Center Guide

## Access

Admin login uses each active administrator's own account. Sessions persist
through normal browsing until Logout. Never share a browser session on an
untrusted device. Server actions recheck Admin status.

## Current Admin pages

| Page | Purpose and when used | Primary inputs and outputs | Public effect / risk / recovery |
| --- | --- | --- | --- |
| `/admin` | Tournament Operations dashboard; used throughout an event. | Selected tournament and lifecycle progress; links to next action. | Coordinates work. Confirm selected event before every action. |
| `/admin/login` | Sign in. | Username/email and password; persistent session. | No public content change. Invalid/inactive account is denied. |
| `/admin/tournament` | Prepare selected tournament and access Danger Zone. | Tournament information, dates, ramp, registration/practice text, visibility/status; reset preview/dialog. | Updates Featured Tournament, schedule, registration. Reset irreversibly removes selected event activity but preserves configuration/members/seasons. |
| `/admin/tournament-manager` | Six-stage tournament workspace. | Prepare Tournament, Import Results, Insurance Pot, Calculate Payouts, Publish Results, and Calculate AOY. | Primary event workflow. Always verify the selected tournament and complete stages in order. |
| `/admin/tournament-manager/prepare` | Review the pre-event roster and check-in materials. | Registration roster, payment/review counts, WeighFish export, printed check-in list, membership confirmations. | Blocks import readiness when required registration or membership review remains unresolved. |
| `/admin/registration-review` | Resolve registrations needing staff review. | Tournament-scoped registrations, identity/payment context, resolution and notes. | Determines which records can be trusted for preparation; never mark an unverified payment as paid. |
| `/admin/announcements` | List/delete homepage announcements. | Existing global announcements. | Homepage news changes after revalidation. Delete is irreversible. |
| `/admin/announcements/new` | Publish a global announcement. | Title, message, pinned flag. | Adds homepage content. Validate wording before publishing. |
| `/admin/announcements/[id]/edit` | Correct/delete one announcement. | Existing announcement fields. | Updates/removes homepage content. |
| `/admin/conditions` | Current conditions management placeholder/entry. | Current implementation is limited. | Do not assume a complete persisted conditions workflow without simulation. |
| `/admin/members` | Search/filter/paginate/export current-season members. | Search and Active/Inactive filter; member rows and CSV. | No direct public page. Confirms eligibility administration. |
| `/admin/members/new` | Create member and membership from physical form. | Identity/contact, status, Effective Date, First Eligible Tournament. | Atomic save. Duplicate email stops creation. Does not create AOY, team, or registration. |
| `/admin/members/[id]` | Review lifecycle and delete/deactivate/reactivate. | UUID-selected member and membership detail. | Delete is blocked for detected history; deactivate preserves history. No edit form currently exists despite an Edit button placeholder. |
| `/admin/members/export` | On-demand current search/filter CSV. | Query/filter from Members. | Downloads data; treat contact information as private. |
| `/admin/settings` | Select Active Membership Season. | One season. | Changes default/current membership administration context. High-impact but reversible. |
| `/admin/tournament-manager/import` | Import, review, validate, reset, or replace WeighFish working results. | Official CSV, imported rows, verification state, identity reconciliation. | Nothing is public until publication. Compare every row with WeighFish and resolve review items before verification. |
| `/admin/tournament-manager/insurance` | Calculate and assign Insurance Pot winners. | Entry count, true 1-in-5 calculation, pot total, places, eligible winners. | Required before final payout checks; feeds the saved Insurance Pot result. |
| `/admin/tournament-manager/closeout` | Complete tournament-day payout closeout. | Imported payout evidence, collections, place/category assignments, payees, checks, delivery status, reconciliation difference. | First priority after verified import because anglers are waiting. It does not publish website content. |
| `/admin/tournament-manager/photos` | Upload winner and Big Bass images. | Image files for selected event. | Feeds Winner's Circle/Results after publication. Verify previews. |
| `/admin/tournament-manager/publish` | Preview and publish verified Official Results. | Results, completed payouts, Insurance Pot, photos, public preview, confirmation. | Publishes website results only after closeout readiness is complete. |
| `/admin/tournament-manager/publish/success` | Publication confirmation/navigation. | Published tournament context. | Links to public Results and operations. |
| `/admin/results` | Tournament Results review and approved result-management area. | Result entries, payout fields, Big Bass, and tournament-derived processing. | Use from Tournament Manager's Publish Results stage; do not bypass import verification or closeout. |
| AOY/Championship processing | Rebuild season projections after Official Results or an authorized correction. | Published Official Results, stable Competitive Records, membership eligibility, AOY points, and qualification participation. | AOY and Championship are separate. Verify best-five AOY and five-of-eight qualification independently. |
| `/admin/analytics` | Website analytics overview. | Page activity and recent registration-interest records. | Read-only operational insight; registration-interest contact data is private. |
| `/admin/registration-interest` | Review/export registration-interest contacts. | Search/sort, CSV export, and email-copy tools. | Handle email addresses as private information. |
| `/admin/rules` | Rules administration entry. | Current Rules-management presentation. | The Official Tournament Rules remain the authority; do not casually change them. |
| `/admin/faq` | FAQ administration entry. | FAQ-management presentation. | Verify any published explanation against the Official Rules. |
| `/admin/sponsors` | Sponsor administration placeholder. | No complete sponsor-management workflow. | Do not represent it as operational until implemented and verified. |
| `/admin/sponsors` | Placeholder. | No production sponsor management. | Homepage sponsors remain configured elsewhere; no current operational workflow. |

## Full Admin workflow

Use `/admin` to select the tournament and Tournament Manager to complete the
stages in order. Before the event, prepare the roster, resolve Registration
Review, and confirm memberships. During weigh-in, enter results in WeighFish.
Immediately afterward, import and verify the CSV, resolve identity reviews,
calculate Insurance and all other payouts, prepare checks, and finish closeout.
Only then upload photos, preview and publish website results, and recalculate
AOY and Championship projections as appropriate.

## High-risk actions

- Tournament Reset: selected tournament only; preview and typed confirmation.
- Delete Member: permanent only when history checks prove no permanent records.
- Delete Announcement: removes homepage content.
- Imported-result reset/replacement: selected tournament only; do not proceed
  when the source export or intended replacement is uncertain.
- Payout reset: stronger warnings apply after checks are delivered or public
  results exist; preserve reconciliation evidence.
- Published-result correction/reset: authorized workflow only; record the
  reason and verify all rebuilt public and season projections.

## Related Documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)

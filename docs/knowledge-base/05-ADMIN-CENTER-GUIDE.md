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
| `/admin/announcements` | List/delete homepage announcements. | Existing global announcements. | Homepage news changes after revalidation. Delete is irreversible. |
| `/admin/announcements/new` | Publish a global announcement. | Title, message, pinned flag. | Adds homepage content. Validate wording before publishing. |
| `/admin/announcements/[id]/edit` | Correct/delete one announcement. | Existing announcement fields. | Updates/removes homepage content. |
| `/admin/conditions` | Current conditions management placeholder/entry. | Current implementation is limited. | Do not assume a complete persisted conditions workflow without simulation. |
| `/admin/members` | Search/filter/paginate/export current-season members. | Search and Active/Inactive filter; member rows and CSV. | No direct public page. Confirms eligibility administration. |
| `/admin/members/new` | Create member and membership from physical form. | Identity/contact, status, Effective Date, First Eligible Tournament. | Atomic save. Duplicate email stops creation. Does not create AOY, team, or registration. |
| `/admin/members/[id]` | Review lifecycle and delete/deactivate/reactivate. | UUID-selected member and membership detail. | Delete is blocked for detected history; deactivate preserves history. No edit form currently exists despite an Edit button placeholder. |
| `/admin/members/export` | On-demand current search/filter CSV. | Query/filter from Members. | Downloads data; treat contact information as private. |
| `/admin/settings` | Select Active Membership Season. | One season. | Changes default/current membership administration context. High-impact but reversible. |
| `/admin/tournament-manager` | Closeout hub. | Selected tournament and readiness steps. | Routes to import, insurance, photos, and publish. |
| `/admin/tournament-manager/import` | Import/replace WeighFish draft rows. | CSV for selected tournament. | Creates draft rows only. Delete-then-insert is not transactional; retry after failure requires technical review. |
| `/admin/tournament-manager/insurance` | Record manual Insurance Pot paid out. | Amount and optional notes/review. | Feeds locked public payout total after publication. |
| `/admin/tournament-manager/photos` | Upload winner and Big Bass images. | Image files for selected event. | Feeds Winner's Circle/Results after publication. Verify previews. |
| `/admin/tournament-manager/publish` | Review and publish selected event. | Imported rows, insurance, photos, confirmation. | Creates public Official Results and sets Results Published. Current multi-write path is not atomic/immutable: launch blocker. |
| `/admin/tournament-manager/publish/success` | Publication confirmation/navigation. | Published tournament context. | Links to public Results and operations. |
| `/admin/results` | Legacy direct Results editor/reset. | Tournament/results/payout/media values. | Overlaps the authoritative workflow and can mutate/delete published data. Do not use for launch; must be retired safely later. |
| `/admin/sponsors` | Placeholder. | No production sponsor management. | Homepage sponsors remain configured elsewhere; no current operational workflow. |

## Full Admin workflow

Use `/admin` to select the tournament, `/admin/tournament` to reset and prepare
it, registration/Entries to confirm the field, then Tournament Manager import,
insurance, photos, and publish. Return to `/admin` after each step and verify
the next incomplete action. After publication, verify every public surface
listed in [Running a Tournament](02-RUNNING-A-TOURNAMENT.md).

## High-risk actions

- Tournament Reset: selected tournament only; preview and typed confirmation.
- Delete Member: permanent only when history checks prove no permanent records.
- Delete Announcement: removes homepage content.
- Import replacement: can leave draft rows absent if insert fails after delete.
- Publish/legacy Results editor: currently violates required atomic immutability.

## Related Documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)

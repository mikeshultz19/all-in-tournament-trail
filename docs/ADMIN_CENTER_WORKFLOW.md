# AITT Admin Center Workflow

Updated: 2026-07-23

AITT Admin Center is organized around one selected tournament. Tournament
identity must remain visible, and navigation must preserve the selected
tournament ID so staff do not accidentally edit a different event.

## Dashboard order

1. AITT Admin Center header
2. Persistent warning that changes affect the live website
3. Current Tournament
4. Website Readiness
5. Four management areas

## Current Tournament

The context panel displays:

- Tournament name
- Date
- Lake
- Ramp
- Tournament lifecycle status
- Change Tournament control

The eventual default is the earliest upcoming non-cancelled tournament, with
the most recent past tournament as a fallback. Tournament records and selector
options now load from Supabase. Selected-tournament IDs are carried through
Admin links.

## Website Readiness

Only the **Before the Tournament** checklist determines whether Tournament
Setup is complete.

### Before the Tournament

- Tournament Information Updated
- Registration Information Complete
- Announcements Reviewed
- Conditions Updated

### After the Tournament

- Import WeighFish Results
- Upload Tournament Winner Photo
- Upload Big Bass Winner Photo
- Publish Tournament Results

Unfinished post-tournament work is upcoming workflow, not a pre-tournament
setup failure.

## Management areas

- Tournament Information
- News & Announcements
- Tournament Conditions
- Tournament Results

Sponsors are not a tournament readiness item or dashboard management card.
Public sponsor content may continue to exist independently.

## Implementation status

- Dashboard, context, selector, readiness structure, and management navigation:
  complete.
- Live Supabase tournament reads: complete.
- Tournament Information read/update workflow, including persistence after
  refresh: complete and verified.
- Tournament creation/deletion: not verified.
- Announcements, Conditions, results import/publishing, Auth, and Storage:
  planned.

Until Auth is implemented, do not describe the Admin Center as protected.

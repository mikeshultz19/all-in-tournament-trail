# Official 2026–2027 Season Schedule

## Scope

This is the authoritative application schedule for the 2026–2027 AITT season.
It is intentionally season-specific. It does not introduce a generalized
future-season scheduling system.

## Regular Season

| Number | Lake | Date |
| ---: | --- | --- |
| 1 | Eagle Mountain | November 1, 2026 |
| 2 | Squaw Creek | November 22, 2026 |
| 3 | Ray Hubbard | December 13, 2026 |
| 4 | Granbury | January 17, 2027 |
| 5 | Squaw Creek | February 14, 2027 |
| 6 | Ray Roberts | March 14, 2027 |
| 7 | Tawakoni | April 25, 2027 |
| 8 | Lewisville | May 16, 2027 |

Each Regular Season number is immutable within the season. Changing a date,
launch, weigh-in location, or time does not change tournament identity. A
postponed event retains its original number.

## Championship

- Dates: June 12–13, 2027
- Format: two-day tournament
- Lake: TBD
- Event type: Championship
- Regular Season number: none

The Championship is separate from the Regular Season. It does not become
Tournament #9 and does not contribute to Regular Season AOY or Championship
qualification participation.

## Competition Integration

- AOY uses published Official Results from the eight numbered Regular Season
  tournaments and counts each Competitive Record's best five performances.
- Championship qualification requires five qualifying Official Regular Season
  participations.
- Both engines exclude the unnumbered Championship.
- Calendar dates are display and operations data; immutable tournament numbers
  determine Regular Season identity and sequence.

## Data Sources

The checked-in database migration assigns the active season dates, numbered
events, and Championship. Public registration and schedule pages read the
active season from Supabase. `data/tournaments.ts` and the schedule-restoration
script contain matching compatibility and operational data; they are not a
second authority over persisted tournament records.

## Deployment

Apply
`supabase/migrations/202607290010_set_2026_2027_official_schedule.sql` through
the normal Supabase migration process. The migration does not delete legacy
tournaments. Active-season queries prevent unassigned legacy schedule rows
from appearing in current registration and schedule interfaces.

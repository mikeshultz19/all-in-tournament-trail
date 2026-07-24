# Tournament Data Model

Updated: 2026-07-23

`public.tournaments` in Supabase is the implemented source for Admin tournament
records. The schema is defined by
`supabase/migrations/202607230001_create_tournaments.sql`; do not manually add
columns in the Supabase dashboard.

## Implemented tournaments table

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()`. |
| `name` | `text` | Required public tournament name. |
| `slug` | `text` | Required and unique stable identifier. |
| `lake` | `text` | Required lake name. |
| `tournament_date` | `timestamptz` | Required tournament date and time. |
| `ramp` | `text` | Optional launch ramp. |
| `launch_type` | `text` | Optional launch details. |
| `morning_registration` | `text` | Optional morning-registration details. |
| `registration_opens` | `timestamptz` | Optional opening time. |
| `registration_closes` | `timestamptz` | Optional closing time. |
| `status` | `text` | Required supported lifecycle status. |
| `description` | `text` | Optional public description. |
| `hero_image_url` | `text` | Optional URL field; Storage is not implemented. |
| `is_featured` | `boolean` | Selects the single featured tournament. |
| `show_on_homepage` | `boolean` | Controls homepage eligibility. |
| `created_at` | `timestamptz` | Defaults to `now()`. |
| `updated_at` | `timestamptz` | Defaults to `now()` and updates automatically. |
| `updated_by` | `text` | Optional editor attribution. |

## Supported statuses

- Scheduled
- Registration Open
- Registration Closed
- Postponed
- Cancelled
- Tournament Day
- Results Published

The database check constraint rejects other values.

## Database behavior

- `id` is a UUID primary key.
- `slug` is unique.
- Registration close cannot precede registration open when both are present.
- A trigger refreshes `updated_at` before updates.
- A partial unique index allows only one `is_featured = true` row.
- A trigger removes the featured flag from other tournaments when a tournament
  becomes featured.
- Row Level Security is enabled.
- Anonymous public reads are permitted.
- Anonymous updates are temporarily permitted for development and must be
  replaced with authenticated Admin policies before production.

## Current seed

| Field | Value |
| --- | --- |
| Name | Lake Fork Open |
| Slug | `lake-fork-open-2026` |
| Lake | Lake Fork |
| Ramp | Pope's Landing |
| Status | Registration Open |
| Featured | `true` |
| Show on homepage | `true` |

`supabase/seed.sql` uses an upsert keyed by slug and was run through the hosted
Supabase SQL Editor.

## TypeScript ownership

`types/tournament.ts` defines the shared `Tournament`, `TournamentStatus`,
`TournamentUpdate`, and `TournamentFormValues` types. `lib/tournaments.ts`
contains server-only reads, next-upcoming selection, featured selection, and
updates.

Do not duplicate the status union or create another Supabase client.

## Other data areas

Tournament results and AOY currently retain separate static/placeholder models.
Announcements, conditions, registration persistence, results persistence,
authentication, and Storage do not yet have completed Supabase data models.
Sponsors are not part of tournament readiness or the four-card Admin workflow.

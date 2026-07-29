# Immutable Regular-Season Tournament Numbering

## Architecture decision

`public.tournaments` remains the authoritative tournament identity table.
Regular-season sequence is stored directly on the tournament as
`regular_season_number`.

The field is:

- required for season-assigned regular-season tournaments
- limited to 1 through 8
- unique within a season
- always null for the Championship
- immutable after assignment

No schedule table or parallel tournament identity model was introduced.

## Identity and postponement

The immutable number, tournament UUID, season, and event type form the
competition identity of a numbered event. Once assigned, the number, season,
and event type cannot change.

Tournament date, launch location, weigh-in information, and operational times
remain editable. Moving Tournament #3 after Tournament #8 changes only its
calendar information; it remains Tournament #3.

## Membership eligibility

First Eligible Tournament comparisons use:

1. matching season
2. active membership status
3. stored First Eligible Tournament
4. immutable regular-season number

Calendar dates are not used to determine eligibility order. Membership remains
valid through the unnumbered Championship when its First Eligible Tournament
is a valid numbered regular-season event.

## Migration safety

The inaugural Eagle Mountain backfill uses only the two previously documented
environment-specific UUIDs. The migration assigns Tournament #1 only when
exactly one matching tournament exists. It stops if both identities appear in
one database rather than guessing.

Unassigned legacy tournaments remain unnumbered until they are attached to a
season. A tournament attached to a season as `regular_season` must have a
reviewed number before the migration constraint can succeed.


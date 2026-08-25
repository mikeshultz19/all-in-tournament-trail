# Championship Qualification Engine

## Constitutional rule

Qualification implements Section 5 and the participation rules in Section 9 of
`docs/AITT_COMPETITION_RULES.md`. A Competitive Record qualifies after five
eligible participations among the eight numbered Regular Season tournaments.
AOY points and rank are not inputs.

## Official Results dependency

The engine reads the immutable Official Results historical snapshot. It uses
the stored registration, Competitive Record, record type, historical
eligibility decision, participation status, season, tournament UUID, and
`regular_season_number`.

Working Results, Championship events, unnumbered events, and cancelled
tournaments are excluded. Calendar dates are not read for sequencing.

## Participation calculation

An historically eligible Official Result counts when its status is:

- `participated`
- `withdrew_after_start`

The following do not count:

- `no_show`
- `disqualified`
- historically ineligible

A shortened tournament counts when it has Official Results. Registration
without an Official Result never enters the engine.

## Projection and recalculation

Qualification is a persisted, rebuildable projection separate from AOY. Every
unique Official Results fingerprint creates an immutable calculation run.
Identical retries reuse the existing run. A current pointer selects the active
run for each season, while prior runs remain reproducible.

A documented Official Result correction changes the source fingerprint. The
protected Official Results correction action immediately rebuilds the complete
season. Tournament-triggered recalculation also rebuilds the complete season
to prevent partial state.

## Output

Each Competitive Record includes:

- stable Competitive Record UUID and type
- canonical members
- qualifying Official participation count
- qualifying tournaments
- nonqualifying Official Results and reasons
- remaining participation count
- uncredited Regular Season numbers
- qualified/not-qualified status
- qualification and recalculation timestamps

Team and Solo records remain distinct even when they contain the same angler.

## Integrity and authorization

Database constraints enforce one participation per Competitive Record per
tournament/run and one qualification per record/season run. The projection RPC
validates every submitted row against an Official Result, its registration,
publication audit, Competitive Record, season, and numbered Regular Season
tournament.

Only the service role can replace a projection. Every recalculation server
action independently requires an active Admin.

## Limitations

- Championship tournament scoring is not implemented.
- The public Championship registration qualification gate is not implemented;
  review and add it before Championship registration opens.
- Publication does not automatically rebuild qualification; the protected
  rebuild action must run after newly publishing Official Results.
- Legacy Official Results without historical snapshots require reviewed
  reconciliation.
- The historical field is currently named `aoy_eligible`; it represents the
  reviewed season-award eligibility decision recorded at Official publication
  and is also the available constitutional membership eligibility evidence for
  Championship participation.

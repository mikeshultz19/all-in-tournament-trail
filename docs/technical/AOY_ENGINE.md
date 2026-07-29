# AITT AOY Engine

## Constitutional source

The engine implements Sections 1–4, 7, and 9 of
`docs/AITT_COMPETITION_RULES.md`. Official Results remain authoritative.
Neither Working Results nor current membership rows participate in the
calculation.

## Architecture

AOY is a persisted, rebuildable projection. Each calculation creates an
immutable calculation run containing tournament performances and season
standings. A season pointer selects the current run. Repeating a rebuild from
the identical Official Results fingerprint reuses the existing run, making
retries idempotent while retaining prior runs after corrections.

## Input and ownership

Only `official_result_entries` belonging to tournaments with:

- `result_status = official`
- `event_type = regular_season`
- `regular_season_number` from 1 through 8
- a non-cancelled tournament status

are inputs. Registration UUID, Competitive Record UUID, record type,
participation state, placement, weight, penalty, and reviewed historical
eligibility come directly from the Official Result snapshot.

Team and Solo records share one standings list but remain separate UUID-owned
Competitive Records. Member names are display information only.

## Scoring and reranking

Ineligible entries remain in Official Results but receive no AOY position or
points. Eligible participating entries are kept in official relative order and
reranked. AOY first receives 200, second 199, and each following position one
less.

Eligible participating zero-weight and post-start withdrawal entries receive
10 points. No-shows and disqualified entries receive zero. A positive-weight
eligible entry without an official placement blocks calculation.

## Best five

All eligible performances remain stored. The five highest point scores count.
Equal scores at the count/drop boundary use immutable tournament number only
to select the displayed counted rows; this cannot change the points total.
Records with fewer than five performances count all their performances.

## Tie breakers

Season ties use, in order:

1. Most AOY wins
2. Most AOY Top 10s
3. Highest total official weight from all eligible appearances
4. AOY finish from Tournament 8 backward through Tournament 1

If all four remain equal, or one record lacks a comparable finish at the
relevant recent tournament, the tied records share a rank and expose
`unresolved` instead of using an invented fallback.

The Constitution does not define tournament AOY point allocation when
Official Results contain equal placements. Such a tournament returns
`AITT_AOY_OFFICIAL_PLACEMENT_TIE_UNRESOLVED`.

## Corrections and rebuilds

A documented Official Result correction changes the source fingerprint.
The next protected rebuild creates a new immutable run and makes it current.
Prior runs remain available for reproduction. Season, tournament, and
Competitive Record rebuild entry points all rebuild the complete season so
tie breakers and best-five selection cannot become partially stale.
`getSeasonAoyStandings` reads the current full projection, including canonical
members, counted and dropped performances, participation totals, and tie
details, without recalculating it.

## Integrity and security

Database constraints enforce one performance per record/tournament/run,
regular-season numbers 1–8, at most five counted results, stable record types,
and nonnegative points and weights. The replacement RPC independently verifies
every performance against an Official Result and official regular-season
tournament. Only the service role may execute it, and every server action
requires an active Admin.

## Limitations

- Championship qualification is intentionally not implemented.
- No automatic rebuild is attached to publication or corrections in this
  milestone.
- Legacy published results without the historical snapshot must be reconciled
  before they can enter AOY.
- Tournament-level equal-placement scoring requires a future constitutional
  rule before it can be calculated.

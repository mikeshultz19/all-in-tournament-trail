# Data Model

The project currently uses typed static modules as a temporary public data layer. These modules are intentionally small so a future administrator workflow or WeighFish import can replace them without changing page and component contracts.

## Tournament model

`data/tournaments.ts` is the canonical source for public tournament event information.

| Field | Purpose |
|---|---|
| `slug` | Stable event identifier and the identifier used by `/results/[slug]` and result records. |
| `name` | Public tournament/stop name. |
| `season` | Season label shown with the event. |
| `lake` | Public lake name. |
| `venue` | Launch site or event venue. |
| `city` | Event city. |
| `date` | Calendar date in `YYYY-MM-DD` format. |
| `status` | Event lifecycle: `upcoming`, `live`, `unofficial`, or `official`. |
| `registrationStatus` | Registration state: `open`, `closed`, or `unavailable`. |
| `registrationUrl` | Registration destination when one exists; `null` means no destination is currently available. |
| `resultsAvailable` | Whether public results may be shown. |
| `featured` | Explicit homepage feature selection flag. |
| `heroImage` | Optional event-specific image. |
| `livestreamAvailable` | Whether a livestream is available for the event. |

`getFeaturedTournament()` chooses the explicitly featured record and falls back to the next upcoming record. If neither exists, consumers render a safe unavailable state. `getUpcomingTournaments()` returns upcoming records in date order, and `getTournamentBySlug()` resolves event/result routes.

Registration controls use `registrationStatus`. An `open` status does not create a link unless `registrationUrl` is also present. No current registration URL has been recorded. `getTournamentImage()` returns `heroImage` when present and otherwise uses `/images/tournament-hero.png`.

## Tournament Result model

`data/tournamentResults.ts` owns post-event information. Each `TournamentResult` relates to exactly one event through `tournamentSlug`, using the same slug as the tournament and result route.

The model contains typed `standings`, a `winner`, `winningWeight`, `bigBass`, `payouts`, and a `published` flag. A standing contains rank, team, anglers, weight, points, and payout. Big Bass is a tournament award nested within its tournament result and includes team, anglers, weight, and payout. It is not a separate page or event record.

Empty arrays, `null` awards/weights, and `published: false` represent the current placeholder state. `getTournamentResultsBySlug()` isolates UI consumers from the storage implementation. A result is shown as available only when the event and result record both indicate publication.

## AOY model

`data/aoyStandings.ts` remains independent from event and result records. An AOY standing contains `rank`, `team`, `anglers`, `eventsFished`, and `points`. Existing AOY values are unchanged. A future validated WeighFish import can replace or calculate this module without making tournament schedule data part of the AOY model.

## Data ownership

- `data/tournaments.ts` is the temporary canonical public event source.
- `data/tournamentResults.ts` separately owns tournament results and Big Bass.
- `data/aoyStandings.ts` separately owns AOY standings.
- A future admin system or WeighFish integration is expected to replace these static modules while retaining their clear event/result/AOY boundaries.

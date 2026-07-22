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
| `tournamentStatus` | Current public operational status: `scheduled`, `weather_watch`, `delayed`, `postponed`, `cancelled`, or `rescheduled`. |
| `statusMessage` | Current official public announcement; no status history is stored. |
| `statusUpdatedAt` | Absolute timestamp for the current status update; displayed in `America/Chicago`. |
| `rescheduledDate` | Replacement tournament date when the status is `rescheduled`. |
| `safeLightOverride` | Optional Tournament Official override in local `HH:mm` format. |
| `safeLightOverridePublicMessage` | Optional public explanation for the override; private administrative notes are never included. |
| `earlyRegistrationDeadlineTime` | Local early-registration cutoff, currently 9:00 PM. |
| `tournamentMorningRegistrationOpensAt` / `ClosesAt` | Optional public operating window for the in-person Tournament Director workflow in WeighFish; it does not open website registration. |
| `resultsAvailable` | Whether public results may be shown. |
| `featured` | Explicit homepage feature selection flag. |
| `heroImage` | Optional event-specific image. |
| `livestreamAvailable` | Whether a livestream is available for the event. |

`getFeaturedTournament()` chooses the explicitly featured record and falls back to the next upcoming record. If neither exists, consumers render a safe unavailable state. `getUpcomingTournaments()` returns upcoming records in date order, and `getTournamentBySlug()` resolves event/result routes.

Operational status and schedule fields remain in the same centralized
tournament records. `lib/tournament-operations.ts` provides the replaceable
selection and registration-policy boundary. `lib/safe-light.ts` uses `suncalc`
with the centralized Fort Worth reference location; `lib/tournament-time.ts`
owns deterministic `America/Chicago` conversion and formatting.

Registration controls combine `registrationStatus`, the current operational status, and the Early Online Registration deadline. The existing `/register` route is the public early-online destination. After its deadline, the website directs anglers to the in-person Tournament Director workflow in WeighFish; configured morning hours never open website submission.
Every registration structurally includes Tournament Entry. Future public
registration records should show Tournament Entry as present and may
additionally show Big Bass,
one of Bronze, Silver, or Gold, and Insurance; they must not model a zero-cost
participation entry. Internal code may retain the `baseEntry` identifier.
`getTournamentImage()` returns `heroImage` when present and otherwise uses
`/images/tournament-hero.png`.

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
- `data/sponsors.ts` is the temporary canonical sponsor source. Sponsor records
  contain `name`, `logo`, optional `websiteUrl`, `active`, `showOnHomepage`,
  `majorSponsor`, and `displayOrder`; the homepage projection includes only
  active major sponsors selected for homepage display and sorts them by display
  order.
- A future admin system or WeighFish integration is expected to replace these static modules while retaining their clear event/result/AOY boundaries.

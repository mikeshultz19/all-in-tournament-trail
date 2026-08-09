# Project Status

> **Historical / Superseded:** This document reflects an earlier implementation
> state and is retained for reference only. Use
> [DOCUMENTATION-INDEX.md](../DOCUMENTATION-INDEX.md) for current documentation.

Version: 1.1
Last verified: 2026-07-29

This is a dated implementation and session summary, not current-state evidence.

## Implemented

- Supabase-backed homepage Featured Tournament, schedule, registrations,
  announcements, Results archive/detail, public standings, and Winner's Circle.
- Supabase Auth login/logout, persistent sessions, `/admin/:path*` route
  protection, active-Admin metadata checks, and independent Server Action
  authorization.
- Seasons, anglers, memberships, stable teams, team members, Members
  pagination/search/export/create/detail/deactivate/guarded-delete, and Admin
  Settings active-season selection.
- Tournament Operations dashboard; preparation, registration, WeighFish
  import, insurance review, photo upload, publication, and tournament-scoped
  reset interfaces.
- Shared payout rule: public `TOTAL PAID OUT TO ANGLERS` is Bronze + Silver +
  Gold + Insurance only.
- Public AOY queries include only rows belonging to tournaments whose status is
  `Results Published`.
- The active 2026–2027 schedule contains eight immutable numbered Regular
  Season tournaments from November 1, 2026 through May 16, 2027, followed by
  the separate, unnumbered two-day Championship on June 12–13, 2027 (lake TBD).

## Incomplete or unsafe

- Checked-in migrations retain anonymous write grants/policies on tournaments,
  news, registrations, results, and AOY rows.
- `/admin/results` is a second publication/editor workflow and can update
  already-published results.
- Tournament Manager publication writes results and tournament status in
  separate operations; rollback is not guaranteed.
- AOY points use name arrays and per-angler aggregation rather than stable team
  UUIDs, membership reconciliation, eligible-field reranking, full tie
  breakers, and stored calculation provenance.
- Championship qualification calculation/persistence is absent.
- WeighFish identity reconciliation to stable anglers/teams is absent.
- Sponsor content remains static and `/admin/sponsors` remains a placeholder.
- Production deployment, DNS, database policy state, Storage policies, and a
  full disposable-tournament workflow have not been verified end to end.

## Validation on 2026-07-29

- `npm run lint`: passed with 4 warnings.
- `npx tsc --noEmit`: passed after stale tests were reconciled.
- `npm test`: 44 files and 263 tests passed.
- `npm run build`: passed; all current App Router routes compiled.

See [CURRENT_STATE_AUDIT_2026-07-29.md](CURRENT_STATE_AUDIT_2026-07-29.md)
for the complete evidence and launch blockers.

## Session Log — 2026-07-30

- Recorded the approved Practice and Off-Limits Policy for every tournament:
  registered non-member anglers are off-limits beginning Monday at 12:00 AM;
  current members registered for the specific event receive one official
  practice day, choosing Friday or Saturday, but not both.
- Updated the public Rules source, How It Works FAQ, and membership-benefit
  wording so membership alone is not described as sufficient.
- Updated Tournament Operations, Decision Log, membership knowledge-base, and
  terminology documentation.
- Completed a repository-wide conflict search for practice, off-limits,
  prefishing, tournament-week, Friday, Saturday, and membership-benefit
  wording.
- Added focused consistency tests and ran the required test, lint, TypeScript,
  build, and diff validation commands.

## Session Log — 2026-07-30 — Public Sponsors

- Refined the compact homepage sponsor section to display Texas Boat Works,
  Fenix Parts, and Mad Dawg Graphics & Design in that order.
- Removed Phoenix Boats from the homepage sponsor data while preserving the
  green Fenix Parts logo and its correct public name.
- Integrated the supplied `mad-dawg-graphics-design-wide1.png` asset unchanged,
  with responsive contained sizing that preserves the complete artwork.
- Added the compact sponsorship invitation and linked “Learn more” to
  `/sponsors`.
- Completed the approved Sponsors page with partnership information,
  sponsorship benefits, and a Contact Us action using `/contact`.
- Added a bold, keyboard-focusable homepage “How AITT Works” link to the
  existing `/how-it-works` route.
- Added focused assertions for sponsor identity, order, assets, responsive
  classes, accessible names, approved routes, Sponsors content, and contextual
  links.
- Validation: 13 focused sponsor/header tests passed; TypeScript, production
  build, and `git diff --check` passed; lint completed with two unrelated
  existing warnings. The full suite passed 423 of 426 tests, with the three
  existing payment/homepage mock failures unchanged.

## Session Log — 2026-07-30 — Homepage Forecast and Balance

- Moved the existing Be the First to Know registration-interest component
  directly beneath Featured Tournament without changing its form or submission
  behavior. The component appears once and follows Featured Tournament on
  desktop and mobile.
- Replaced the text-heavy weather presentation with a compact, chronological
  five-day forecast using the then-existing server-only weather integration and
  a normalized provider-neutral daily forecast model.
- The subsequent compact rolling-forecast correction supersedes the original
  tournament-horizon labeling: the display now begins with today's
  `America/Chicago` date and is independent of the tournament date.
- Preserved application-controlled Tournament Status and Safe Light, the
  then-current provider attribution and update time, and the graceful provider-failure
  fallback.
- Confirmed the sponsor invitation's Learn more link uses the existing
  `/sponsors` route with a descriptive accessible name and visible focus state.
- Simplified the contextual hero link to **How AITT Works** and applied the
  established gold accent utility while preserving its route and interaction
  states.
- Added focused homepage, forecast normalization, horizon, fallback,
  responsive-layout, and sponsorship-link assertions.
- Validation: 28 focused homepage, weather, sponsor, and analytics tests
  passed; lint passed with two unrelated existing Admin results-form warnings;
  TypeScript, production build, and `git diff --check` passed. The full suite
  passed 424 of 425 tests; the remaining existing payment-content assertion
  expects `Continue to Payment` while Soft Launch correctly displays
  `Registration Closed`.

## Session Log — 2026-07-30 — Compact Rolling Forecast Correction

- Restored the compact larger-screen Tournament Conditions row with Safe Light
  on the left and five narrow forecast columns on the right.
- Changed forecast normalization to start with the current
  `America/Chicago` calendar date, sort chronologically, discard past entries,
  and return up to five available days. Tournament date no longer affects
  forecast selection or labeling.
- Kept condition text available through accessible daily labels and tooltips
  while using concise visible weekday, condition indicator, high/low, and rain
  values.
- Confined small-screen horizontal scrolling to the forecast region and
  preserved page-level overflow protection.
- Preserved Safe Light calculation and overrides, Tournament Status authority,
  server-only provider requests, caching, attribution, and graceful
  fallback behavior.
- Validation: all 14 focused Tournament Conditions and provider tests passed;
  lint passed with two unrelated existing Admin results-form warnings;
  TypeScript, production build, and `git diff --check` passed. The rendered
  homepage returned HTTP 200 with the compact desktop row, Safe Light,
  five-day heading, fallback, and page-level overflow protection. The full
  suite passed 424 of 425 tests; the remaining existing payment-content
  assertion expects `Continue to Payment` while Soft Launch correctly displays
  `Registration Closed`.

## Session Log — 2026-07-30 — Public AOY Resilience and Access

- Traced the homepage `42501` failure to the server-side `service_role` client:
  the full `current_aoy_standings` view was granted to `anon` and
  `authenticated`, but not `service_role`.
- Confirmed the full view contains internal calculation fields and replaced
  direct public access with a narrow `get_public_aoy_standings` function that
  returns only rank, display name, official participation count, and counted
  points. No registration, payment, membership, contact, or admin fields are
  exposed.
- Added a typed AOY unavailable state. Expected Supabase data-access failures
  now produce a concise server log and the restrained homepage message
  **AOY standings are temporarily unavailable.** Other homepage sections
  continue rendering.
- Added focused tests for `42501`, public output mapping, migration scope,
  homepage resilience, forecast preservation, and available AOY rows.
- Restarted the development server and visually confirmed the full homepage,
  compact AOY fallback, and the desktop Tournament Conditions row without a
  Next.js error overlay. Live legacy-provider cards could not be verified at
  that time because their required configuration was absent; the weather
  fallback rendered correctly.
- Local migration application is pending because Docker Desktop reports that
  it is unable to start. No linked remote migration push was performed.
- Validation: 25 focused AOY, homepage, public-standings, and Tournament
  Conditions tests passed; TypeScript, production build, and
  `git diff --check` passed; lint completed with two unrelated existing Admin
  results-form warnings. The full suite passed 429 of 430 tests; the remaining
  existing payment-content assertion expects `Continue to Payment` while Soft
  Launch correctly displays `Registration Closed`.

## Session Log — 2026-07-30 — Open-Meteo Forecast Provider

- Replaced the inactive AccuWeather provider with a server-only Open-Meteo
  integration that requires no API key and preserves the normalized
  provider-neutral UI boundary.
- Added approved WGS84 weather-coordinate fields to tournaments and configured
  the inaugural Eagle Mountain event by its actual ramp: West Bay Marina uses
  `32.93417, -97.51397`, while the static Twin Points fixture uses
  `32.87562, -97.49323`. Both coordinates are published in the Texas Parks &
  Wildlife Department 2024 Eagle Mountain Reservoir survey.
- Requests use Open-Meteo's official forecast endpoint, seven daily variables,
  Fahrenheit, mph, `America/Chicago`, five forecast days, an eight-second
  timeout, and the existing three-hour server revalidation interval.
- Normalization now includes condition, high/low, precipitation probability,
  maximum sustained wind, maximum gust, and dominant wind direction. Malformed
  optional values are omitted per day without blocking other usable days.
- Preserved the compact Safe Light-left / Next 5 Days-right layout, manual Safe
  Light override precedence, and application-controlled Tournament Status.
- Replaced provider attribution with the required visible Open-Meteo link and
  retained compact missing-location and provider-failure fallbacks.
- Updated setup, operations, deployment, rules, terminology, and provider
  decision documentation. Production must confirm Open-Meteo's current
  licensing and commercial-use terms before launch.
- Added focused provider, request, normalization, weather-code, fallback,
  responsive-layout, attribution, and AOY-resilience assertions.
- Live development verification returned HTTP 200 and rendered Safe Light
  beside five chronological Open-Meteo cards for Thursday through Monday at
  West Bay Marina, with Fahrenheit temperatures, precipitation percentages,
  visible linked attribution, and no forecast fallback.
- Validation: 24 focused weather/AOY tests passed; TypeScript, production
  build, and `git diff --check` passed; lint completed with the same two
  unrelated Admin results-form warnings. The full suite passed 436 of 437
  tests; the unchanged payment-content assertion expects `Continue to Payment`
  while Soft Launch correctly displays `Registration Closed`.
- Local migration application remains pending because Docker Desktop is unable
  to start. The approved exact-ramp rollout mapping keeps the active West Bay
  forecast operational until the checked-in coordinate migration is applied.

## Session Log — 2026-07-31 — Bass Stack Challenge Format

- Added an explicit tournament-format flag for the approved Bass Stack Challenge events so the public schedule can render the badge from the tournament data model instead of lake-name checks in the UI.
- Designated tournament #5 at Squaw Creek and tournament #8 at Lewisville as AITT Bass Stack Challenge events.
- Added the compact gold Bass Stack badge to the public schedule row and added matching About This Tournament copy that explains the MLF-inspired cumulative-weight format without changing unrelated schedule data.
- Updated How It Works FAQ copy, the Official Rules source, Tournament Operations documentation, Decision Log language, and style guidance so the public and internal descriptions stay aligned.
- Added focused tests for the schedule designation, badge rendering, about copy, FAQ wording, rules wording, and the absence of official Major League Fishing affiliation claims.
- Validated the change set with focused Bass Stack tests, TypeScript, production build, and `git diff --check`; the full suite still contains the unchanged pre-existing payment-content assertion mismatch.

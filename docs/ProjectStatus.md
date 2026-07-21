# All-In Tournament Trail

## Project Status

- **Last Updated:** 2026-07-21
- **Current Version:** v0.3
- **Overall Progress:** Phase 3 of 8 complete

---

# Current Phase

## Phase 3 – Public Tournament Entries

**Status:** Complete

**Current Goal:** Phase 3 is complete. Phase 4 — Registration Persistence is
the next implementation phase.

**Prerequisite completed before continuing Phase 3:**

- Removed Free Entry from the tournament-entry model.
- Tournament Entry is now required for every registration.
- Replaced Base Entry with Tournament Entry in all public-facing terminology.
- Organized registration options into Tournament Registration, Optional Side
  Pots, and Member Bonus Pots.
- Updated registration pricing and validation copy, Rules, FAQ, tests, and the
  authoritative operations documentation.
- Added a concise UI terminology and style guide.
- Added the public `/registrations` route with links from the Home and
  Registration pages.
- Added a responsive spreadsheet-style semantic table with exact
  `America/Chicago` timestamps and oldest-to-newest sorting.
- Added total, team, solo, Big Bass, Bronze, Silver, Gold, and Insurance Pot
  counts; team and solo display; optional pot selections;
  and an explanatory empty state.
- Added an explicit privacy-safe public entry projection and non-persistent
  sample data.
- Added focused automated tests and completed production validation.

---

# Completed Phases

## ✅ Phase 1 – Project Documentation

Completed:

- Tournament Operations document
- Registration workflow
- WeighFish workflow
- Membership rules
- Weather policy
- Safe Light specification
- Tournament Status specification

---

## ✅ Phase 2 – Tournament Status & Safe Light

Completed:

- Tournament Status model
- Tournament Status & Announcements
- Estimated Safe Light
- Home page integration
- Registration page integration
- Weather FAQ
- Rules updates
- Automated tests

---

# Remaining Phases

## Phase 3 – Public Tournament Entries

Completed:

- Public registration page
- Team display
- Entry counts
- Privacy filtering
- Home page link

---

## ⚪ Phase 4 – Registration Persistence

Planned:

- Database
- Registration storage
- Payment status
- Membership linkage

---

## ⚪ Phase 5 – Membership System

Planned:

- Member records
- Annual renewals
- Eligibility validation

---

## ⚪ Phase 6 – Admin Portal

Planned:

- Secure login
- Registration management
- Tournament management
- Weather announcements
- Safe Light override

---

## ⚪ Phase 7 – WeighFish CSV Import

Planned:

- CSV upload
- Results publishing
- AOY updates
- Tournament history

---

## ⚪ Phase 8 – Post-Tournament Reconciliation

Planned:

- Compare WeighFish vs registrations
- Compare WeighFish vs membership
- Detect duplicates
- Detect typos
- Detect missing memberships
- Review queue
- Manual merge tools

---

# Open Business Decisions

- Refund vs Credit policy
- Exact morning registration cutoff
- Public team-name format
- Automatic member creation rules

---

# Future Enhancements

Ideas not yet scheduled:

- Email notifications
- SMS notifications
- QR Code check-in
- Live leaderboard
- Mobile scoring

---

# Session Log

## 2026-07-21 — Homepage Restoration and Cleanup

- Restored Latest News & Announcements to its established homepage position
  and preserved its tournament status content, dates, and empty state.
- Removed the detailed Tournament Entry, Team, Solo, and optional-pot summary
  from the homepage while retaining the complete dynamic summary and public
  registration table on the Tournament Entries page.
- Preserved compact Tournament Conditions in the existing Safe Light area,
  including status, Safe Light rules and overrides, forecast details,
  fallbacks, update time, attribution, and the server-only provider boundary.
- Restored the original two-column section hierarchy, responsive stacking,
  spacing, action alignment, and horizontal-overflow protection without
  removing supporting homepage sections.
- Updated focused homepage and Tournament Entries coverage and completed
  test, lint, TypeScript, production build, and diff validation.

## 2026-07-21 â€” Homepage Tournament Dashboard Completion

- Completed the homepage as a cohesive public tournament dashboard while
  preserving the existing visual system and responsive two-column structure.
- Strengthened the current tournament identity, venue and date details,
  application-controlled Tournament Status, and open/closed registration
  action treatment.
- Integrated compact Tournament Conditions into the existing Safe Light area;
  preserved Safe Light calculation, override behavior, timezone rules, and
  Tournament Director authority.
- Kept the server-only AccuWeather provider boundary, normalized forecast
  model, tournament-date horizon behavior, linked attribution, caching, and
  graceful missing-key/provider fallbacks.
- Added dynamically derived Tournament Entries, Team, Solo, Big Bass, Bronze,
  Silver, Gold, and Insurance Pot summary data without exposing private
  registration fields. The detailed summary is presented on the Tournament
  Entries page rather than the homepage.
- Added the exact Central-time registration deadline and concise links to
  tournament details, Rules, Results, registration, and the public field.
- Refined responsive wrapping, compact metric layout, semantic time markup,
  visible focus states, textual status communication, and action hierarchy.
- Added focused homepage assertions for identity, actions, counts, deadline,
  navigation, privacy, weather behavior, and closed registration.
- Passed `npm test` (47 tests), `npm run lint`, `npx tsc --noEmit`,
  `npm run build`, tracked-secret and client-weather checks, and
  `git diff --check`.
- Phase 4 â€” Registration Persistence remains next and was not implemented.

## 2026-07-21 — Homepage Tournament Conditions

- Evolved the homepage Safe Light panel into compact Tournament Conditions
  while preserving the existing homepage grid and concise Tournament Entries
  access.
- Preserved configured Tournament Status and the existing Safe Light
  calculation, official override, and Tournament Director authority.
- Added a server-side AccuWeather daily-forecast service, stable per-tournament
  location-key configuration, a provider-neutral normalized model, and
  three-hour Next.js revalidation.
- Added five-day tournament-date selection so distant events show a pending
  state instead of unrelated current weather.
- Added graceful missing-key, missing-location, provider-error, and invalid-data
  fallbacks that leave the homepage, status, and Safe Light available.
- Added linked AccuWeather attribution and documented the required official
  logo, account, API-key, location-key, license, and deployment setup.
- Added focused Tournament Conditions and provider tests.
- Passed `npm test` (46 tests), `npm run lint`, `npx tsc --noEmit`,
  `npm run build`, and `git diff --check`.
- Phase 4 — Registration Persistence remains next and was not implemented.

## 2026-07-21 — Phase 3: Public Tournament Entries

- Added the public Tournament Entries route and Home and Registration
  page links.
- Added a compact, horizontally scrollable spreadsheet-style table with
  semantic markup and exact `America/Chicago` timestamps.
- Enforced oldest-to-newest sorting and displayed dynamically calculated total,
  team, solo, Big Bass, Bronze, Silver, Gold, and Insurance Pot counts in a
  compact, centered, responsive summary.
- Added a privacy-safe public model excluding private contact, payment,
  administrative, database, reconciliation, and WeighFish details.
- Covered team and solo entries, optional pots, the zero-count summary, empty
  state, accessible labels, responsive behavior, and unchanged Tournament
  Status and Safe Light behavior with focused tests.
- Passed `npm test` (36 tests), `npm run lint`, `npx tsc --noEmit`,
  `npm run build`, and `git diff --check`.
- Phase 4 — Registration Persistence is next and was not implemented.

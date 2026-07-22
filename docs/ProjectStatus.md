# All-In Tournament Trail Project Dashboard

## Overall Project Progress

- **Last Updated:** 2026-07-22
- **Overall Progress:** Approximately 40% complete
- **Public Website:** Complete
- **Registration Persistence:** Ready to Begin

## Current Phase

### Phase 4 – Registration Persistence (Supabase)

- **Status:** Ready to Begin
- **Primary Goal:** Replace mock registration data with persistent Supabase storage and build the Admin Portal foundation.

## Completed Phases

### Phase 1 – Foundation

**Status:** Completed

- Architecture
- Repository organization
- Documentation structure
- Planning documents
- Project tracking
- Design direction

### Phase 2 – Public Website

**Status:** Completed

- Homepage
  - Featured Tournament
  - Tournament Conditions
  - Safe Light
  - Weather architecture
  - Latest News & Announcements
  - Tournament Status
  - Responsive design
- Registration
  - Tournament Registration
  - Membership workflow
  - Condensed deadline and Estimated Safe Light header
  - Four-stage Team Info, Options, Review, and Payment progression
  - Combined policy acknowledgment
  - Compact server-authoritative pricing summary
  - Minimal Square handoff boundary pending production configuration
  - Timestamp capture
- Tournament Entries
  - Public entries page
  - Spreadsheet layout
  - Pot participation
  - Registration timestamps
- How It Works
- Rules
- FAQ
- Responsive polish
- Accessibility
- Testing
- Documentation

## Latest Completed Milestone

### Registration Rules and Waiver Integration

**Status:** Completed

- Added public `/rules` and `/liability-waiver` routes backed directly by the authoritative Markdown documents.
- Preserved stable rule anchors, a linked contents list, readable legal typography, and return paths to registration.
- Kept the waiver visibly marked as a draft pending qualified legal review.
- Finalized one required, unchecked combined acknowledgment linking both policies.
- Added `rulesVersion`, `waiverVersion`, `acknowledgedAt`, and `acknowledgmentAccepted` to the registration submission contract.
- Kept Team and Individual / Solo as the only registration types and removed active co-angler terminology.
- Preserved the compact 3% Card Processing Fee summary and disabled Square execution boundary.
- Added focused policy-route, version, acknowledgment, team-field, and registration validation coverage.

### Registration Page Simplification

**Status:** Completed

- Deadline and Estimated Safe Light are grouped beside the page heading.
- Tournament-morning guidance and the verbose status card are omitted from the form.
- One required acknowledgment records the applicable policy-version set.
- The summary retains subtotal, the 3% Card Processing Fee, and final total.
- Decorative payment branding and simulated payment controls are excluded before the actual Square step.
- Local decorative calendar and sun assets now identify the registration deadline and Estimated Safe Light; the same sun treatment is shared with the homepage Safe Light display, while text remains the accessible source of truth.

### Homepage Tournament Dashboard

**Status:** Completed

- Homepage finalized
- Tournament Conditions
- Safe Light calculator
- Fort Worth sunrise calculation
- Automatic Daylight Saving Time handling
- Weather integration architecture
- Latest News restored
- Public Tournament Entries page
- Registration workflow finalized
- Responsive improvements
- Accessibility improvements
- Documentation updated
- Tests passing
- Committed and pushed

## Next Phase

### Phase 4 – Registration Persistence

#### Objectives

- Configure Supabase
- Registration table
- Membership table
- Tournament table
- Persist registrations
- Replace mock data
- Build Admin authentication
- Build Admin Portal foundation
- Persist Early Online Registrations before enabling production Square checkout
- Complete secure server-side Square payment confirmation

## Future Phases

### Phase 5 – Tournament Administration

- Registration management
- News management
- Tournament status management
- Weather announcements
- CSV export

### Phase 6 – WeighFish Integration

- CSV import
- Results
- AOY calculations
- Membership reconciliation
- Duplicate detection
- Typo detection

### Phase 7 – Member Experience

- Profiles
- AOY history
- Tournament history
- Statistics
- Championship qualification

## Future Enhancements

These items are intentionally deferred and are not in active development.

- Tournament weather radar
- Weather alerts
- Tournament analytics
- Historical statistics
- Member dashboard
- Sponsor management
- Championship dashboard
- Mobile enhancements
- Additional reporting
- Email notifications
- Payment reconciliation improvements

## Operational Workflow

1. Early Online Registration remains open until 9:00 PM before tournament day.
2. Online credit card, debit card, and Apple Pay payment on supported devices and browsers uses Square and includes the 3% Card Processing Fee.
3. AITT confirms an online registration only after successful payment; this payment and persistence integration is not yet implemented.
4. The Tournament Director conducts Tournament-Morning Registration in WeighFish.
5. Morning cash has no fee; morning card, Apple Pay, and other supported contactless-wallet payments use the Square reader with the 3% Card Processing Fee.
6. WeighFish remains the official tournament-day roster and payment-method record.
7. After the tournament, the WeighFish CSV becomes the official tournament record.
8. A future protected CSV import updates:
   - Registrations
   - Memberships
   - AOY
   - Results
9. The future import workflow flags:
   - Duplicates
   - Possible typos
   - Membership discrepancies

## Project Health

| Area | Status |
| --- | --- |
| Architecture | Excellent |
| Documentation | Excellent |
| Homepage | Complete |
| Registration UX | Complete |
| Testing | Passing |
| Git History | Clean |
| Phase 4 readiness | Ready |

## Payment and Import Implementation Status

- **Approved:** Square card and supported digital-wallet provider, Apple Pay on compatible devices and browsers, 3% Card Processing Fee parity for card and wallet transactions, fee-free tournament-morning cash, WeighFish-owned Tournament-Morning Registration, official Apple-only branding, and system ownership boundaries.
- **Implemented:** Public disclosures, a compact card and Apple Pay announcement within Latest News & Announcements, FAQ content, a documented Apple Pay text fallback and official-asset path, integer-cent fee helpers, a safe Square configuration boundary, the Phase 1 online-registration state and price-snapshot model, server validation and authoritative quoting, required acknowledgments, dynamic schedule CTAs, review and confirmation structures, and focused recovery tests.
- **Not implemented:** Registration persistence, Square payment creation or confirmation, verified callbacks or webhooks, registration confirmation email, protected Admin Portal, and WeighFish CSV upload/import. Checkout remains disabled until the documented persistence and verification prerequisites are complete.

## Last Git Milestone

- **Description:** Public Website Complete
- **Includes:** Homepage, Tournament Conditions, Public Tournament Entries, Registration workflow, Documentation, and Tests
- **Next Development Branch:** Phase 4 – Registration Persistence

## Session Log

### 2026-07-21 — Homepage Restoration and Cleanup

- Restored Latest News & Announcements to its established homepage position and preserved its tournament status content, dates, and empty state.
- Removed the detailed Tournament Entry, Team, Solo, and optional-pot summary from the homepage while retaining the complete dynamic summary and public registration table on the Tournament Entries page.
- Preserved compact Tournament Conditions in the existing Safe Light area, including status, Safe Light rules and overrides, forecast details, fallbacks, update time, attribution, and the server-only provider boundary.
- Restored the original two-column section hierarchy, responsive stacking, spacing, action alignment, and horizontal-overflow protection without removing supporting homepage sections.
- Updated focused homepage and Tournament Entries coverage and completed test, lint, TypeScript, production build, and diff validation.

### 2026-07-21 — Homepage Tournament Dashboard Completion

- Completed the homepage as a cohesive public tournament dashboard while preserving the existing visual system and responsive two-column structure.
- Strengthened the current tournament identity, venue and date details, application-controlled Tournament Status, and open/closed registration action treatment.
- Integrated compact Tournament Conditions into the existing Safe Light area; preserved Safe Light calculation, override behavior, timezone rules, and Tournament Director authority.
- Kept the server-only AccuWeather provider boundary, normalized forecast model, tournament-date horizon behavior, linked attribution, caching, and graceful missing-key/provider fallbacks.
- Added dynamically derived Tournament Entries, Team, Solo, Big Bass, Bronze, Silver, Gold, and Insurance Pot summary data without exposing private registration fields. The detailed summary is presented on the Tournament Entries page rather than the homepage.
- Added the exact Central-time registration deadline and concise links to tournament details, Rules, Results, registration, and the public field.
- Refined responsive wrapping, compact metric layout, semantic time markup, visible focus states, textual status communication, and action hierarchy.
- Added focused homepage assertions for identity, actions, counts, deadline, navigation, privacy, weather behavior, and closed registration.
- Passed `npm test` (47 tests), `npm run lint`, `npx tsc --noEmit`, `npm run build`, tracked-secret and client-weather checks, and `git diff --check`.
- Phase 4 — Registration Persistence remains next and was not implemented.

### 2026-07-21 — Homepage Tournament Conditions

- Evolved the homepage Safe Light panel into compact Tournament Conditions while preserving the existing homepage grid and concise Tournament Entries access.
- Preserved configured Tournament Status and the existing Safe Light calculation, official override, and Tournament Director authority.
- Added a server-side AccuWeather daily-forecast service, stable per-tournament location-key configuration, a provider-neutral normalized model, and three-hour Next.js revalidation.
- Added five-day tournament-date selection so distant events show a pending state instead of unrelated current weather.
- Added graceful missing-key, missing-location, provider-error, and invalid-data fallbacks that leave the homepage, status, and Safe Light available.
- Added linked AccuWeather attribution and documented the required official logo, account, API-key, location-key, license, and deployment setup.
- Added focused Tournament Conditions and provider tests.
- Passed `npm test` (46 tests), `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`.
- Phase 4 — Registration Persistence remains next and was not implemented.

### 2026-07-21 — Phase 3: Public Tournament Entries

- Added the public Tournament Entries route and Home and Registration page links.
- Added a compact, horizontally scrollable spreadsheet-style table with semantic markup and exact `America/Chicago` timestamps.
- Enforced oldest-to-newest sorting and displayed dynamically calculated total, team, solo, Big Bass, Bronze, Silver, Gold, and Insurance Pot counts in a compact, centered, responsive summary.
- Added a privacy-safe public model excluding private contact, payment, administrative, database, reconciliation, and WeighFish details.
- Covered team and solo entries, optional pots, the zero-count summary, empty state, accessible labels, responsive behavior, and unchanged Tournament Status and Safe Light behavior with focused tests.
- Passed `npm test` (36 tests), `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`.
- Phase 4 — Registration Persistence is next and was not implemented.

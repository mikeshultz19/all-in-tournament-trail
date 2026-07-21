# Decision Log

Use this document to record approved project decisions that affect architecture, routes, design, data, integrations, or maintenance.

## Decision Template

### YYYY-MM-DD — Decision Title

- **Status:** Proposed | Approved | Superseded
- **Context:** Describe the issue or choice being considered.
- **Decision:** Record the approved direction.
- **Reasoning:** Explain why this direction was selected.
- **Impact:** List the routes, components, data, workflows, or documentation affected.
- **Follow-up:** Record any required next steps.

## Decisions

### 2026-07-21 — Keep detailed entry statistics off the homepage

- **Status:** Approved
- **Context:** Detailed registration participation statistics crowded the
  homepage and displaced established public communication content.
- **Decision:** Detailed registration participation statistics belong on the
  Tournament Entries page, not the homepage.
- **Reasoning:** The homepage should remain focused on current tournament
  information, conditions, announcements, and primary navigation without
  becoming crowded.
- **Impact:** The homepage retains concise registration actions and a link to
  Tournament Entries; the full summary and table remain on `/registrations`.

### 2026-07-21 — Keep Latest News & Announcements on the homepage

- **Status:** Approved
- **Context:** Operational updates need a consistent, prominent public home.
- **Decision:** Latest News & Announcements remains a core homepage section.
- **Reasoning:** It is the primary public communication surface for tournament
  updates and operational announcements.
- **Impact:** The section remains visible on desktop and mobile in its
  established position above the compact Tournament Conditions panel.

### 2026-07-21 â€” Use the homepage as the tournament dashboard

- **Status:** Approved
- **Context:** Most anglers need current tournament identity, registration access, conditions, and field participation in one place.
- **Decision:** The homepage is the primary public tournament dashboard.
- **Reasoning:** A single action-oriented surface answers the most common pre-tournament questions quickly.
- **Impact:** Current tournament identity, registration state, deadline, conditions, announcements, and links to the field, tournament details, Rules, and Results share one hierarchy. Detailed entry counts remain on the Tournament Entries page.
- **Follow-up:** Keep future homepage additions subordinate to current tournament information and registration actions.

### 2026-07-21 â€” Keep registration actions dominant on the homepage

- **Status:** Approved
- **Context:** Weather and participation information are useful but should not compete with the primary angler task.
- **Decision:** Register Now and current tournament information remain more prominent than weather and secondary navigation.
- **Reasoning:** Registration is the primary action for an open tournament; conditions, Rules, and Results provide supporting context.
- **Impact:** The featured tournament uses a consistent primary and secondary action hierarchy, with detailed entry statistics available on the Tournament Entries page.
- **Follow-up:** Do not promote weather into a separate large homepage feature.

### 2026-07-21 — Keep tournament conditions in the Safe Light area

- **Status:** Approved
- **Context:** Tournament Status, Safe Light, and forecast conditions answer related tournament-morning questions while the featured tournament and announcements retain homepage priority.
- **Decision:** Integrate tournament weather into the existing Safe Light homepage area rather than displaying a separate large widget.
- **Reasoning:** The related information fits in one compact panel without competing with the featured tournament or announcements.
- **Impact:** The homepage Safe Light footprint becomes Tournament Conditions while the broader homepage grid remains unchanged.
- **Follow-up:** Keep future weather additions compact and within the documented scope.

### 2026-07-21 — Preserve application authority over Safe Light and status

- **Status:** Approved
- **Context:** Weather-provider output is supplemental to established tournament business rules and human operational decisions.
- **Decision:** Safe Light remains controlled by the documented application calculation and override rules, and weather data cannot automatically change Tournament Status.
- **Reasoning:** Provider data must not alter an established business rule or replace Tournament Director authority.
- **Impact:** Forecast failures do not affect Safe Light, status, or homepage availability.
- **Follow-up:** Do not infer operational status from forecast conditions.

### 2026-07-21 — Normalize AccuWeather data server-side

- **Status:** Approved
- **Context:** Provider credentials and response structures must not reach browser code or spread through UI components.
- **Decision:** Integrate AccuWeather through a server-only provider service that returns a small normalized application weather model.
- **Reasoning:** The API key remains private, provider payloads stay outside components, and the integration remains replaceable.
- **Impact:** The homepage server component controls forecast selection, caching, errors, and normalized presentation.
- **Follow-up:** Complete the documented API account, location-key, and official-logo setup before enabling live data.

### 2026-07-21 — Use a table for public tournament entries

- **Status:** Approved
- **Context:** Tournament fields may exceed 100 entries.
- **Decision:** Public tournament entries use a spreadsheet-style table rather than cards.
- **Reasoning:** A compact table scales better and preserves fast comparison across entries.
- **Impact:** The `/registrations` page remains semantic, compact, and horizontally scrollable.
- **Follow-up:** Preserve this presentation when persistent data replaces fixtures.

### 2026-07-21 — Show exact Central-time registration order

- **Status:** Approved
- **Context:** Registration order may matter operationally.
- **Decision:** Display exact registration timestamps in `America/Chicago` and sort entries oldest to newest by default.
- **Reasoning:** Exact timestamps provide transparency and chronological order reflects actual registration order.
- **Impact:** Public formatting, sorting, fixtures, and tests use deterministic Central time.
- **Follow-up:** Persistent registrations must provide trustworthy server timestamps.

### 2026-07-21 — Omit the implicit Tournament Entry column

- **Status:** Approved
- **Context:** Every valid registration requires Tournament Entry.
- **Decision:** Do not show Tournament Entry as a redundant table column.
- **Reasoning:** It would add no varying information.
- **Impact:** The table focuses on anglers, timestamps, and optional pots.
- **Follow-up:** Continue enforcing Tournament Entry in registration validation.

### 2026-07-21 — Summarize optional-pot participation

- **Status:** Approved
- **Context:** Anglers need a quick view of participation in each optional pot.
- **Decision:** Display dynamically calculated counts for Big Bass, Bronze, Silver, Gold, and Insurance Pot.
- **Reasoning:** Visible counts clarify the field and may encourage additional participation.
- **Impact:** A reusable pure summary calculation supplies the public page.
- **Follow-up:** Reuse the calculation with Phase 4 data.

### 2026-07-21 — Keep the entry summary compact

- **Status:** Approved
- **Context:** Counts should be immediately useful without competing with the list.
- **Decision:** Place entry and pot counts in a small, centered summary above the table.
- **Reasoning:** The grouped layout scans quickly and avoids dashboard-card clutter.
- **Impact:** Summary metrics wrap responsively in a concise panel.
- **Follow-up:** Preserve the hierarchy as entry volume grows.

### 2026-07-21 — Present early entries as an oldest-first public table

- **Status:** Approved
- **Context:** The public entry list may exceed 100 registrations and must be
  easy to scan without exposing private registration data.
- **Decision:** Use a spreadsheet-style table sorted oldest to newest. Display
  exact registration timestamps in `America/Chicago`. Treat Tournament Entry
  as implicit and omit it as a redundant column.
- **Reasoning:** Dense tabular rows scale more cleanly than cards, chronological
  order makes registration sequence clear, and Central-time timestamps match
  tournament business rules.
- **Impact:** The `/registrations` route, public entry projection, sample data,
  responsive table, date formatting, and tests follow these rules.
- **Follow-up:** Replace static source records during Phase 4 without changing
  the public projection or exposing private fields.

### 2026-07-21 — Remove Free Entry

- **Status:** Approved
- **Context:** A zero-cost tournament-entry path adds registration and
  tournament-day operational complexity.
- **Decision:** Free Entry is not supported. Require Tournament Entry for every
  solo and team tournament registration. Big Bass and eligible member pots
  remain optional add-ons.
- **Reasoning:** Supporting a free tournament-entry path creates unnecessary
  registration, payment, and tournament-day logistics.
- **Impact:** There is no zero-cost participation option. Registration and
  payment flows, tournament-day reconciliation, payouts, and eligibility rules
  are simpler and clearer.
- **Follow-up:** Future public registration records must assume Tournament Entry is
  present and display only selected optional add-ons.

### 2026-07-21 — Use Tournament Entry as the public name

- **Status:** Approved
- **Context:** Base Entry is an implementation-oriented term and is less
  intuitive for anglers.
- **Decision:** Display the required entry publicly as Tournament Entry.
- **Reasoning:** Tournament Entry describes the required purchase directly and
  consistently across registration, Rules, FAQ, confirmations, and receipts.
- **Impact:** User-facing content uses Tournament Entry. Internal code may
  retain the stable `baseEntry` identifier.
- **Follow-up:** Apply this terminology to future public and administrative
  user-facing features.

### 2026-07-21 — Group registration options by angler intent

- **Status:** Approved
- **Context:** A single mixed list makes required entry, optional side pots,
  and members-only choices harder to distinguish.
- **Decision:** Group options as Tournament Registration, Optional Side Pots,
  and Member Bonus Pots.
- **Reasoning:** This matches how anglers think about entering an event and
  makes eligibility and optional choices easier to understand.
- **Impact:** Tournament Entry appears under Tournament Registration; Big Bass
  and Insurance Pot appear under Optional Side Pots; Bronze, Silver, and Gold
  appear under Member Bonus Pots.
- **Follow-up:** Preserve these groups in future confirmation, receipt, and
  registration-management interfaces where appropriate.

### 2026-07-21 — Adopt the tournament operations and registration specification

- **Status:** Approved
- **Context:** Registration periods, member eligibility, payout-pot selection,
  tournament-morning processing, safe-light guidance, weather decisions,
  public status communication, privacy, and Tournament Director workflows need
  one authoritative definition before full implementation.
- **Decision:** Treat
  `docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md` as the authoritative
  specification for these workflows unless the documented requirements are
  later amended.
- **Reasoning:** A single source prevents pricing, terminology, timing,
  eligibility, privacy, Rules, and FAQ requirements from diverging across the
  public site and Admin Portal.
- **Impact:** Future registration, Early Registrations, Rules, FAQ, tournament
  status, weather notice, safe-light, Admin Portal, payment, and WeighFish work
  must conform to the specification.
- **Follow-up:** Resolve the open business decisions recorded in section 20 of
  the specification before implementing behavior that depends on them.

### 2026-07-20 — Archive design sources outside the public deployment tree

- **Status:** Approved
- **Context:** Historical mockups, revisions, a flyer, and a source ZIP were stored under `public/` despite having no runtime references.
- **Decision:** Keep only actively referenced production assets under `public/` and preserve design sources in `archive/design-assets/` with clear filenames.
- **Reasoning:** This keeps deployable assets lean without discarding useful design history or source packages.
- **Impact:** Sixteen design-source files moved out of `public/`; no application asset path changed.
- **Follow-up:** Store future non-runtime design sources in the repository archive rather than `public/`.

### 2026-07-20 — Use one Tailwind CSS 4 PostCSS configuration

- **Status:** Approved
- **Context:** Equivalent CommonJS and ESM PostCSS files coexisted, and an unused Tailwind 3-style config duplicated obsolete content discovery settings.
- **Decision:** Use `postcss.config.mjs` with `@tailwindcss/postcss` as the canonical configuration and keep Tailwind CSS 4 directives in `app/globals.css`; remove the duplicate PostCSS file and obsolete Tailwind config.
- **Reasoning:** One configuration removes ambiguity and preserves the verified Tailwind CSS 4 output.
- **Impact:** `postcss.config.js` and `tailwind.config.js` were removed after lint, TypeScript, and production build verification.
- **Follow-up:** Configure future Tailwind changes through the Tailwind CSS 4 stylesheet-first workflow unless a documented need changes this convention.

### 2026-07-20 — Keep only dependencies with active code or tooling ownership

- **Status:** Approved
- **Context:** The earlier generated UI chain left direct packages with mixed runtime and tooling relevance.
- **Decision:** Remove unused `@base-ui/react`, `class-variance-authority`, and `autoprefixer`; retain `clsx`, `tailwind-merge`, `lucide-react`, and `shadcn` for the configured shadcn CSS, utility, and component-generation workflow.
- **Reasoning:** Direct dependencies should have an identifiable maintained consumer while preserving the documented component workflow.
- **Impact:** `package.json` and `package-lock.json` were synchronized through npm uninstall.
- **Follow-up:** Re-evaluate retained workflow dependencies if `components.json`, the shadcn CSS import, or `lib/utils.ts` is intentionally retired.

### 2026-07-20 — Separate event, result, and AOY data by responsibility

- **Status:** Approved
- **Context:** Tournament facts were duplicated across the schedule, homepage feature, AOY schedule, and a mixed winner placeholder module.
- **Decision:** Use one tournament slug for both pre-event information and its post-event result relationship. Keep public event facts in `data/tournaments.ts`, tournament results (including Big Bass) in `data/tournamentResults.ts`, and AOY standings in `data/aoyStandings.ts`.
- **Reasoning:** Stable slug relationships and separate typed modules remove duplicated facts while keeping each data concern replaceable by a future admin or WeighFish workflow.
- **Impact:** Homepage tournament components, Schedule, Results, result detail routes, and static data ownership now share the same event identity without merging result or AOY values into event records.
- **Follow-up:** Preserve these boundaries when implementing real result publication, AOY calculations, registration, or WeighFish imports.

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

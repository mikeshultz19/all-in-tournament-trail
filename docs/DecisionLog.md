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

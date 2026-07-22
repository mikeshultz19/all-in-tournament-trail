# Repository Map

Updated: 2026-07-20
Cleanup baseline: v0.2

This map describes the maintained repository after Repository Cleanup Batch 4.
The approved route hierarchy remains defined by `docs/MasterSiteMap.md`; missing
future routes are not represented here as existing files.

## Active application routes

| Route | Source | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Homepage |
| `/schedule` | `app/schedule/page.tsx` | Tournament schedule |
| `/results` | `app/results/page.tsx` | Results index |
| `/results/[slug]` | `app/results/[slug]/page.tsx` | Per-tournament results shell; Big Bass remains within the tournament result |
| `/how-it-works` | `app/how-it-works/page.tsx` | Current How It Works and FAQ content |
| `/register` | `app/register/page.tsx` | Early Online Registration form and policy acknowledgment |
| `/rules` | `app/rules/page.tsx` | Official Tournament Rules loaded from the authoritative Markdown source |
| `/liability-waiver` | `app/liability-waiver/page.tsx` | Participant Liability Waiver loaded from the legal-review draft |
| `/api/feedback` | `app/api/feedback/route.ts` | Feedback email API used by the global widget |

`app/layout.tsx` provides the root layout, fonts, Footer, and FeedbackWidget.
`app/globals.css` provides Tailwind CSS 4 and global theme styles.
`app/favicon.ico` is the application favicon.

## Shared and homepage components

- `components/Header.tsx` — active homepage header
- `components/Footer.tsx` — root-layout footer
- `components/FeedbackWidget.tsx` — root-layout feedback form
- `components/PageHeader.tsx` — shared major-page heading
- `components/PolicyDocument.tsx` — shared trusted-Markdown policy renderer
- `components/Hero.tsx` — homepage hero
- `components/LatestTournamentNews.tsx` — homepage Tournament Status & Announcements section
- `components/TournamentStatusAnnouncement.tsx` — shared accessible current-status notice
- `components/SafeLightCard.tsx` — shared Estimated Safe Light presentation
- `components/FeaturedTournament.tsx` — canonical featured-event consumer
- `components/WinnersCircle.tsx` — homepage tournament-results preview
- `components/AOYStandings.tsx` — homepage AOY preview

The Header intentionally remains outside the root layout. Moving it is deferred
to approved feature/architecture work.

## Data and helpers

- `data/tournaments.ts` — canonical typed public tournament facts and selectors
- `data/tournamentResults.ts` — typed result records, including nested Big Bass
- `data/aoyStandings.ts` — typed AOY standings
- `config/tournament-operations.ts` — Fort Worth safe-light reference and operational time zone
- `config/payment-policy.ts` — provider-neutral integer-cent card-fee policy
- `lib/safe-light.ts` — isolated internal sunrise and safe-light calculation
- `lib/tournament-time.ts` — `America/Chicago` date conversion and formatting
- `lib/tournament-operations.ts` — status labels, registration gating, and next-tournament selection
- `lib/tournament-view-model.ts` — serializable server-derived operational display data
- `lib/policy-documents.ts` — server-side authoritative policy Markdown and metadata loader
- `lib/square.ts` — server-side Square configuration boundary; payment creation remains deferred
- `lib/utils.ts` — `cn` class composition helper for the configured shadcn workflow

## Active public assets

```text
public/images/
├── featured-tournament.png
├── logo.png
├── tournament-hero.png
├── hero/
│   └── hero-locked-v10.png
└── results/
    ├── big-bass.jpg
    └── overall-winner.jpg
```

Every listed public asset has an active source or data reference. No source ZIP
or unreferenced design revision remains publicly deployable.

## Archived design assets

```text
archive/design-assets/
├── all-in-flyer.png
├── homepage-mockup.png
├── homepage-v2.png
├── trophy-inaugural.png
├── trophy-inaugural-v2.png
├── winners-circle-template.png
├── winners-circle-title.png
├── winners-circle-title-v3.png
├── winners-circle-title-v4.png
└── hero/
    ├── all-in-feedback-footer.zip
    ├── hero-image.png
    ├── hero-locked-v6.png
    ├── hero-locked-v7.png
    ├── hero-locked-v8.png
    ├── hero-locked-v9.png
    └── hero-title.png
```

These files are retained design history or source material and are not served by
Next.js.

## Documentation

- `AGENTS.md` — repository operating instructions
- `CLAUDE.md` — delegates compatible tooling to `AGENTS.md`
- `README.md` — factual repository overview
- `docs/AI_RELEARN.md` — authoritative AI onboarding and collaboration guide
- `docs/PAYMENT_OPERATIONS.md` — authoritative financial operations manual
- `docs/TOURNAMENT_RULES.md` — authoritative Official Tournament Rules content
- `docs/LIABILITY_WAIVER.md` — Participant Liability Waiver draft pending legal review
- `docs/MasterSiteMap.md` — approved public information architecture
- `docs/RepositoryAudit.md` — cleanup audit and batch record
- `docs/RepositoryMap.md` — current maintained-file map
- `docs/DevelopmentRoadmap.md` — milestone roadmap
- `docs/VersionHistory.md` — completed and planned release milestones
- `docs/ProjectStatus.md` — current project and milestone status
- `docs/DecisionLog.md` — approved architectural and maintenance decisions
- `docs/DataModel.md` — static typed data ownership
- `docs/UI-Standards.md` — visual and UI standards
- `docs/WeighFishIntegration.md` — future integration planning only
- `docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md` — authoritative
  registration, tournament operations, weather/status, privacy, Rules, FAQ,
  and Tournament Director workflow specification

## Configuration and package files

- `package.json` and `package-lock.json` — npm scripts and synchronized dependency graph
- `next.config.ts` — typed Next.js configuration
- `postcss.config.mjs` — canonical Tailwind CSS 4 PostCSS configuration
- `components.json` — maintained shadcn component-generation configuration
- `tsconfig.json` — TypeScript configuration and `@/*` alias
- `eslint.config.mjs` — Next.js/TypeScript ESLint configuration
- `.gitignore` — dependency, build, environment, and local-file exclusions

There is no `postcss.config.js` duplicate and no Tailwind 3-style
`tailwind.config.js`.

## Approved architecture guardrails

- No route was added or removed during Batch 4.
- Big Bass is part of `data/tournamentResults.ts` and the tournament result UI;
  there is no separate Big Bass page.
- Safety Requirements remain within the future Official Rules branch defined in
  the master sitemap; there is no separate safety page.
- There is no archive gallery route. `archive/design-assets/` is repository-only.

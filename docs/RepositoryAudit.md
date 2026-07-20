# Repository Audit

Audit date: 2026-07-20

## Scope and Classification

This audit inspected every project-owned file in the repository, including ignored local configuration and generated TypeScript declarations. Dependency, build-output, and Git-internal trees (`node_modules/`, `.next/`, and `.git/`) were excluded as generated or third-party content. The npm dependency tree and lockfile were validated through npm. Binary assets were inspected by path, type, size, dimensions, hash, source references, and—where applicable—archive contents. Secret values in `.env.local` were not exposed; only variable names were reviewed.

Classification meanings:

- **KEEP** — active, required, approved documentation, or otherwise currently necessary.
- **REVIEW** — requires a product, design, history, deployment, or architecture decision before changing or deleting.
- **SAFE TO DELETE** — no route, import, string reference, archive dependency, or build dependency was found; removal is safe for the current application runtime. This is a recommendation only. Nothing was deleted.

The working tree contained application changes before this audit began. They were preserved. This audit changed only `docs/RepositoryAudit.md`.

## Executive Summary

- **KEEP** — Six application routes are active: five page routes and one API endpoint. The framework also emits `/_not-found`.
- **KEEP** — Ten TSX components are reachable from a route or the root layout.
- **KEEP** — `Footer` and `FeedbackWidget` are global shared components; `PageHeader` is shared-capable but currently used only on Schedule.
- **SAFE TO DELETE** — Six TSX files are absent from the complete route/import graph, including one empty file and an inactive duplicate header.
- **SAFE TO DELETE** — Five default Create Next App SVGs and two unreferenced exact-copy placeholder images have no runtime references.
- **REVIEW** — Nineteen additional unreferenced images/archive assets appear to be design sources, revisions, mockups, or experiments.
- **REVIEW** — Static AOY, schedule, featured-event, result, and winner data should be consolidated before content management or WeighFish automation is implemented.
- **REVIEW** — Live navigation contains missing routes, dead fragments, placeholders, and one missing image extension.
- **KEEP** — Lint, TypeScript, dependency validation, and the production build all pass.

## Active Project Structure

- **KEEP** — `app/`: Next.js 16 App Router routes, layout, global CSS, favicon, and API handler.
- **KEEP** — `components/`: homepage sections and shared site UI.
- **REVIEW** — `components/ui/`: generated-style UI primitives plus a second header; neither file is currently active.
- **KEEP** — `data/`: tournament records and current-winner placeholder data, both imported by active UI.
- **KEEP** — `lib/`: class-name utility, currently reachable only through the inactive UI button.
- **KEEP** — `public/`: active production artwork mixed with unreferenced design iterations and starter assets.
- **KEEP** — `docs/`: approved project direction and audit/status documents.
- **KEEP** — Root configuration and npm manifests, subject to the specific consolidation reviews below.

## Routes

Production-build-confirmed routes:

| Classification | Route | Source | Status |
|---|---|---|---|
| **KEEP** | `/` | `app/page.tsx` | Static homepage |
| **KEEP** | `/how-it-works` | `app/how-it-works/page.tsx` | Static explainer and embedded FAQ content |
| **KEEP** | `/schedule` | `app/schedule/page.tsx` | Static schedule from tournament data |
| **KEEP** | `/results` | `app/results/page.tsx` | Static results index/shell |
| **KEEP** | `/results/[slug]` | `app/results/[slug]/page.tsx` | Dynamic event/result shell |
| **KEEP** | `/api/feedback` | `app/api/feedback/route.ts` | Dynamic POST endpoint |
| **KEEP** | `/_not-found` | Framework generated | Static framework route |

### Unused Pages

- **KEEP** — No unused `page.tsx` or `route.ts` file was found. App Router files are entry points and all six application route files appear in the production route manifest.

### Duplicate Routes

- **KEEP** — No duplicate filesystem routes, route groups resolving to the same URL, Pages Router overlap, or duplicate API endpoint was found.
- **REVIEW** — Schedule labels `/results/[slug]` as “Event Info,” while the same route is also the results detail route. Decide whether one approved route should intentionally serve both pre-event and post-event states, or whether the approved Event Information structure needs a distinct route. Do not add a route without approval.

### Approved Sitemap Gaps

- **REVIEW** — Registration and confirmation, AOY Standings, Official Rules, FAQ, Sponsors, Contact, Privacy Policy, and Terms of Use do not yet have dedicated route files. This is a gap report, not approval to create routes.
- **REVIEW** — `/how-it-works` currently contains FAQ material. Decide whether that satisfies the approved FAQ grouping or should later be consolidated into an approved FAQ & Rules experience.

## Components

### Active Components

| Classification | Component | Used by |
|---|---|---|
| **KEEP** | `components/Header.tsx` | Homepage |
| **KEEP** | `components/Hero.tsx` | Homepage |
| **KEEP** | `components/LatestTournamentNews.tsx` | Homepage |
| **KEEP** | `components/FeaturedTournament.tsx` | Homepage |
| **KEEP** | `components/WinnersCircle.tsx` | Homepage |
| **KEEP** | `components/AOYStandings.tsx` | Homepage |
| **KEEP** | `components/Footer.tsx` | Root layout; all pages |
| **KEEP** | `components/FeedbackWidget.tsx` | Root layout; all pages |
| **KEEP** | `components/PageHeader.tsx` | Schedule page |

### Shared Components

- **KEEP** — `Footer` and `FeedbackWidget` are truly shared through `app/layout.tsx`.
- **KEEP** — `PageHeader` is an intended shared component, but only Schedule uses it today.
- **REVIEW** — `Header` is rendered only by `app/page.tsx`, so internal pages have no shared header. Consider moving the canonical header into the root layout when the shared-header design is approved.
- **REVIEW** — Results and How It Works implement their own page introductions instead of reusing `PageHeader`. Consolidate only after confirming the desired variants.

### Unused TSX Files

The complete static import graph found no incoming import from any route, layout, API handler, or active component for these files:

- **SAFE TO DELETE** — `components/Button.tsx`: zero-byte empty file.
- **SAFE TO DELETE** — `components/HeroActions.tsx`: inactive CTA experiment; no imports.
- **SAFE TO DELETE** — `components/HomeDashboard.tsx`: inactive homepage composition wrapper; the homepage imports its child sections directly.
- **SAFE TO DELETE** — `components/HomeHighlights.tsx`: older/inactive homepage composition wrapper; the homepage already implements the equivalent two-column section directly.
- **SAFE TO DELETE** — `components/ui/Header.tsx`: inactive alternate header; `components/Header.tsx` is the imported implementation.
- **SAFE TO DELETE** — `components/ui/button.tsx`: generated UI primitive with no consumers.

These files are proven unused by the current import graph and successful build. If they represent designs the project owner wants to preserve, archive them outside the production source tree before deletion.

### Duplicate Components and Old Experiments

- **SAFE TO DELETE** — `components/ui/Header.tsx` duplicates the role, navigation data, logo, CTA, and login link of active `components/Header.tsx`; it differs mainly in layout/styling and is not imported.
- **SAFE TO DELETE** — `HomeDashboard` and `HomeHighlights` are superseded composition experiments. Active `app/page.tsx` directly composes the same child components.
- **SAFE TO DELETE** — `HeroActions` is a standalone CTA-strip experiment not used by `Hero` or the homepage.
- **REVIEW** — `components/ui/button.tsx` is the only consumer of `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lib/utils.ts`. Removing the primitive creates a larger dependency/config cleanup opportunity described below.

## Dead Imports

- **KEEP** — ESLint reports no unused imports in the checked TypeScript/TSX source.
- **KEEP** — TypeScript reports no type errors.
- **REVIEW** — TypeScript does not enable `noUnusedLocals` or `noUnusedParameters`; current ESLint coverage found no dead imports, but enabling those compiler checks later would strengthen enforcement.
- **REVIEW** — `lucide-react` has no source import anywhere.
- **REVIEW** — `autoprefixer` has no source or PostCSS configuration reference.
- **REVIEW** — `@base-ui/react`, `class-variance-authority`, `clsx`, and `tailwind-merge` are reachable only through the unused `components/ui/button.tsx` chain.
- **REVIEW** — `shadcn` is present as a runtime dependency although it appears to be used as project tooling/configuration; confirm whether it should remain installed and whether it belongs in dependencies or devDependencies.

## Data

### Active Data

- **KEEP** — `data/tournaments.ts` is imported by Schedule, Results, and dynamic result detail.
- **KEEP** — `data/tournamentData.ts` is imported by `WinnersCircle`.

### Stale Mock Data and Placeholder Data

- **REVIEW** — `AOYStandings.tsx` contains hard-coded standings and a separate hard-coded upcoming schedule. This is presentation mock data and duplicates the role of `data/tournaments.ts`.
- **REVIEW** — `WinnersCircle.tsx` contains a hard-coded top-five results array while also consuming `data/tournamentData.ts`.
- **REVIEW** — `FeaturedTournament.tsx` hard-codes its event date, venue, entry details, and route instead of deriving the featured event from `data/tournaments.ts`.
- **REVIEW** — `data/tournamentData.ts` is explicitly placeholder content: all winners are “Coming Soon,” weights/points are empty, and multiple winner slots share one placeholder image.
- **REVIEW** — All events in `data/tournaments.ts` are upcoming, registration-open, and results-unavailable. Confirm these flags against the actual operational source before launch.
- **REVIEW** — `status`, `livestream`, and `heroImage` exist in the tournament model but are not currently rendered. `heroImage` values point to a nonexistent `/images/lakes/` directory.
- **REVIEW** — `resultsPage`, `bronzePot`, `silverPot`, and `goldPot` are present in `currentTournament` but are not read by active UI.
- **REVIEW** — The roadmap refers to a nine-event season, while the active tournament array contains three events. Confirm whether the data is intentionally partial.

### Data Consolidation Opportunities

- **REVIEW** — Use `data/tournaments.ts` as the single public tournament source until a database/admin system replaces it.
- **REVIEW** — Derive the featured tournament and homepage upcoming schedule from that source rather than maintaining separate constants.
- **REVIEW** — Define result/AOY data separately from components so future WeighFish parsing and AOY recalculation do not require editing presentation files.
- **REVIEW** — Keep Big Bass within each tournament result, matching the approved sitemap and planned integration flow.

## Assets

### Active Assets

- **KEEP** — `app/favicon.ico`.
- **KEEP** — `public/images/logo.png`.
- **KEEP** — `public/images/featured-tournament.png`.
- **KEEP** — `public/images/hero/hero-locked-v10.png`.
- **KEEP** — `public/images/tournament-hero.png` (used by Results index and likely intended for result detail).
- **KEEP** — `public/images/results/overall-winner.jpg` and `public/images/results/big-bass.jpg`.
- **KEEP** — `public/images/placeholders/tournament-coming-soon.png`.

### Unused Images — Safe Runtime Cleanup

- **SAFE TO DELETE** — `public/file.svg`.
- **SAFE TO DELETE** — `public/globe.svg`.
- **SAFE TO DELETE** — `public/next.svg`.
- **SAFE TO DELETE** — `public/vercel.svg`.
- **SAFE TO DELETE** — `public/window.svg`.
- **SAFE TO DELETE** — `public/images/placeholders/big-bass.jpg`.
- **SAFE TO DELETE** — `public/images/placeholders/overall-winner.jpg`.

The two placeholder JPGs are unreferenced and byte-for-byte identical to the retained tournament placeholder and both active result images.

### Unused Images and Archives — Design Review

- **REVIEW** — `public/images/all-in-flyer.png`.
- **REVIEW** — `public/images/homepage-mockup.png`.
- **REVIEW** — `public/images/homepage-v2.png`.
- **REVIEW** — `public/images/trophy-inaugural.png` and `trophy-inaugural-v2.png`.
- **REVIEW** — `public/images/winners-circle-template.png`.
- **REVIEW** — `public/images/winners-circle-title.png`, `winners-circle-title-v3.png`, and `winners-circle-title-v4.png`.
- **REVIEW** — `public/images/hero/hero-image.png`, `hero-locked-v6.png`, `hero-locked-v7.png`, `hero-locked-v8.png`, `hero-locked-v9.png`, and `hero-title.png`.
- **REVIEW** — `public/images/hero/all-in-feedback-footer.zip`.

The PNGs have distinct hashes and appear to be design revisions or source experiments, so code references alone cannot prove they have no archival value. The ZIP is particularly important to review: it is publicly deployable under `public/`, contains an install guide and source copies of `FeedbackWidget`, `Footer`, and the feedback API route, and two archived source files differ from the live versions. Move it outside `public/` if it must be retained.

### Duplicate Assets

- **SAFE TO DELETE** — The two unused placeholder JPGs named above are exact duplicates of active/retained assets.
- **KEEP** — `results/overall-winner.jpg`, `results/big-bass.jpg`, and `placeholders/tournament-coming-soon.png` are also byte-identical, but all three paths are actively referenced and currently express distinct semantic roles. Consolidate references before deleting any of these three.
- **REVIEW** — Hero, trophy, and winners-circle version files are not byte-identical; they require visual comparison and an archival decision.

### Missing Asset References

- **REVIEW** — `app/results/[slug]/page.tsx` requests `/images/tournament-hero.jpg`, but only `/images/tournament-hero.png` exists.
- **REVIEW** — Tournament `heroImage` fields request three nonexistent `/images/lakes/*.jpg` assets. The fields are dormant today, so this does not break the current render.

## Broken Links and Placeholder Code

### Missing Live Routes

- **REVIEW** — `/standings` from `AOYStandings`.
- **REVIEW** — `/tournaments/eagle-mountain-lake` from `FeaturedTournament`.
- **REVIEW** — `/register` from `FeaturedTournament` and How It Works.
- **REVIEW** — `/rules` from How It Works.
- **REVIEW** — `/login` from `Header`.
- **REVIEW** — `/contact` from `Footer`.
- **REVIEW** — `/register?tournament=...` from Schedule.

### Dead Fragments and Placeholders

- **REVIEW** — Homepage/header/footer links target `#schedule`, `#standings`, `#rules`, `#sponsors`, and `#register`, but those IDs do not exist. `#results` is the only matching section ID.
- **REVIEW** — Home and all three social links use bare `#` placeholders.
- **REVIEW** — Root metadata remains the Create Next App default.
- **REVIEW** — `next.config.ts` contains only its generated placeholder comment.
- **REVIEW** — README ends with “Coming Soon” despite active pages now existing.
- **REVIEW** — Results detail always renders “Results Coming Soon,” independent of tournament status or `resultsAvailable`.
- **REVIEW** — Results index is a card-heavy shell, which should be checked against the approved minimal, typography-driven UI standards.
- **REVIEW** — How It Works has extensive embedded content and data arrays; extract shared/maintainable content only if it will be reused or administered.

### Feedback Configuration

- **KEEP** — The feedback widget and API route are active and build successfully.
- **REVIEW** — The API route hard-codes the recipient address and Resend onboarding sender even though `.env.local` defines `FEEDBACK_TO_EMAIL` and `FEEDBACK_FROM_EMAIL`. Align configuration before production.
- **REVIEW** — The endpoint validates presence but not email format, message length, payload type, rate limits, spam, or abuse controls.
- **REVIEW** — The archived ZIP contains older feedback source, increasing maintenance ambiguity and exposing downloadable source under `public/`.

## Configuration and Dependency Consolidation

- **KEEP** — `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `components.json`, and at least one PostCSS configuration are required project controls.
- **REVIEW** — `postcss.config.js` and `postcss.config.mjs` configure the same plugin in different module formats. Confirm which filename is canonical, retain one, and validate a clean build.
- **REVIEW** — `tailwind.config.js` is an empty/minimal Tailwind 3-style content config while Tailwind CSS 4 is configured through CSS and `components.json` specifies no config file. Confirm no editor/tooling workflow consumes it before removal.
- **REVIEW** — After removing the unused UI button, assess removal of `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, and `lib/utils.ts` as one verified cleanup group.
- **REVIEW** — Assess unused `lucide-react` and `autoprefixer` separately.
- **KEEP** — `tw-animate-css` and shadcn CSS imports are active in `app/globals.css`; do not remove packages or CSS imports independently.
- **KEEP** — `next-env.d.ts` and `tsconfig.tsbuildinfo` are generated and ignored. They need not be committed; normal tooling may recreate them.
- **KEEP** — `.env.local` is ignored and contains required integration keys. Preserve it securely and never commit its values.

## Build / Lint / TypeScript Findings

- **KEEP** — `npm ls --depth=0` passed with a complete installed dependency tree.
- **KEEP** — `npm run lint` passed on 2026-07-20.
- **KEEP** — `npx tsc --noEmit` passed on 2026-07-20.
- **KEEP** — `npm run build` passed on 2026-07-20 using Next.js 16.2.10. Google Fonts network access was allowed so `next/font` could fetch Geist and Geist Mono.
- **REVIEW** — Passing checks do not detect missing application routes, dead fragments, missing public images, placeholder business data, or unused whole files; those were found through the separate repository graph/content audit.

## Safe to Delete

No deletion was performed. For the current runtime, these are classified **SAFE TO DELETE**:

1. `components/Button.tsx`
2. `components/HeroActions.tsx`
3. `components/HomeDashboard.tsx`
4. `components/HomeHighlights.tsx`
5. `components/ui/Header.tsx`
6. `components/ui/button.tsx`
7. `public/file.svg`
8. `public/globe.svg`
9. `public/next.svg`
10. `public/vercel.svg`
11. `public/window.svg`
12. `public/images/placeholders/big-bass.jpg`
13. `public/images/placeholders/overall-winner.jpg`

Before any future deletion, verify the exact working-tree state, archive anything intentionally retained, remove associated dependencies only as a separate step, and rerun all checks.

## Manual Review Required

- **REVIEW** — All pre-existing modified, deleted, and untracked application work before committing.
- **REVIEW** — Tracked deletions of `SeasonBanner.tsx`, `SeasonStrip.tsx`, and `data/AITT 2026-2027 Schedule.docx`; these files are absent now but their deletions have not been committed.
- **REVIEW** — All design-version images and the public ZIP archive.
- **REVIEW** — Broken routes, fragments, social placeholders, and missing image paths.
- **REVIEW** — Static mock/placeholder data and duplicated tournament/event facts.
- **REVIEW** — Header/PageHeader placement and consistency across major pages.
- **REVIEW** — PostCSS/Tailwind configuration duplication and transitively unused packages.
- **REVIEW** — Feedback recipient/sender configuration and production hardening.

## Must Keep

- **KEEP** — Every active route file and root layout/global CSS/favicon.
- **KEEP** — Every active component and both active data modules.
- **KEEP** — Active assets listed above.
- **KEEP** — Package manifest/lockfile and framework/compiler/lint configuration until specific consolidation is proven separately.
- **KEEP** — `.gitignore`, secure local environment configuration, root `AGENTS.md`, and project documentation.
- **KEEP** — User changes already present in the working tree unless separately reviewed and approved.

## Complete File Disposition

This appendix accounts for every inspected project-owned file. Generated/dependency/Git trees are accounted for by scope rather than enumerated.

### Root and Configuration

- **KEEP** — `.env.local`, `.gitignore`, `AGENTS.md`, `README.md`, `components.json`, `eslint.config.mjs`, `next.config.ts`, `next-env.d.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.tsbuildinfo`.
- **REVIEW** — `CLAUDE.md`, `postcss.config.js`, `postcss.config.mjs`, `tailwind.config.js`.

### Application

- **KEEP** — `app/api/feedback/route.ts`, `app/favicon.ico`, `app/globals.css`, `app/how-it-works/page.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/results/[slug]/page.tsx`, `app/results/page.tsx`, `app/schedule/page.tsx`.

### Components and Library

- **KEEP** — `components/AOYStandings.tsx`, `FeaturedTournament.tsx`, `FeedbackWidget.tsx`, `Footer.tsx`, `Header.tsx`, `Hero.tsx`, `LatestTournamentNews.tsx`, `PageHeader.tsx`, `WinnersCircle.tsx`.
- **KEEP** — `lib/utils.ts` until the inactive UI-button dependency group is reviewed.
- **SAFE TO DELETE** — `components/Button.tsx`, `HeroActions.tsx`, `HomeDashboard.tsx`, `HomeHighlights.tsx`, `components/ui/Header.tsx`, `components/ui/button.tsx`.

### Data

- **KEEP** — `data/tournamentData.ts`, `data/tournaments.ts`; their contents require the placeholder/consolidation reviews described above.

### Documentation

- **KEEP** — `docs/DevelopmentRoadmap.md`, `MasterSiteMap.md`, `ProjectStatus.md`, `RepositoryAudit.md`, `UI-Standards.md`, `WeighFishIntegration.md`.

### Public Assets

- **KEEP** — `public/images/featured-tournament.png`, `logo.png`, `tournament-hero.png`, `hero/hero-locked-v10.png`, `placeholders/tournament-coming-soon.png`, `results/big-bass.jpg`, `results/overall-winner.jpg`.
- **SAFE TO DELETE** — `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, `images/placeholders/big-bass.jpg`, `images/placeholders/overall-winner.jpg`.
- **REVIEW** — `public/images/all-in-flyer.png`, `homepage-mockup.png`, `homepage-v2.png`, `trophy-inaugural.png`, `trophy-inaugural-v2.png`, `winners-circle-template.png`, `winners-circle-title.png`, `winners-circle-title-v3.png`, `winners-circle-title-v4.png`, `hero/all-in-feedback-footer.zip`, `hero/hero-image.png`, `hero/hero-locked-v6.png`, `hero/hero-locked-v7.png`, `hero/hero-locked-v8.png`, `hero/hero-locked-v9.png`, `hero/hero-title.png`.

## Recommended Cleanup Order

1. **REVIEW** — Snapshot and approve the existing dirty working tree, especially the three tracked deletions, before mixing cleanup with feature work.
2. **REVIEW** — Fix live broken links, dead fragments, missing asset paths, default metadata, and feedback configuration using only approved sitemap routes.
3. **REVIEW** — Establish `data/tournaments.ts` as the temporary single tournament source and consolidate Featured Tournament, AOY schedule, and winner/result mock data around a maintainable model.
4. **SAFE TO DELETE** — Remove the six unused TSX files as one focused change after a final reference search.
5. **REVIEW** — If the unused UI button is removed, evaluate and remove its now-unneeded utility/dependency chain; separately review `lucide-react`, `autoprefixer`, and `shadcn` placement.
6. **SAFE TO DELETE** — Remove the five starter SVGs and two unused exact-copy placeholder JPGs.
7. **REVIEW** — Visually inventory design variants. Keep approved masters in an archive outside `public/`, then remove obsolete deployed revisions. Move the source ZIP out of `public/` if retained.
8. **REVIEW** — Consolidate PostCSS configuration and confirm whether `tailwind.config.js` is still needed.
9. **REVIEW** — Move the canonical Header into shared layout and extend `PageHeader` reuse only after the global navigation/page-header design is approved.
10. **KEEP** — After every cleanup group, rerun `npm run lint`, `npx tsc --noEmit`, `npm run build`, route/link checks, and the asset-reference scan.

# Repository Audit

> **Historical document:** This audit records the 2026-07-20 cleanup baseline.
> It does not describe the current Supabase or AITT Admin Center state. For the
> current repository, use [ProjectStatus.md](ProjectStatus.md) and
> [RepositoryMap.md](RepositoryMap.md). Placeholder observations below are
> preserved as dated audit findings, not current claims.

## Cleanup Batch 4 — Complete (2026-07-20)

Repository polish is complete and establishes the v0.2 cleanup baseline. The
detailed audit below remains as the historical pre-cleanup record; this section
supersedes its file, dependency, and configuration inventories where they differ.

### Design assets

- Moved 16 unreferenced design-source files from `public/` to
  `archive/design-assets/`: the flyer, two homepage mockups, two trophy
  revisions, five winners-circle revisions, five historical hero sources or
  revisions, and `hero/all-in-feedback-footer.zip`.
- Retained the original clear filenames and retained the `hero/` grouping in
  the archive.
- Retained six actively referenced production assets under `public/images/`:
  `logo.png`, `hero/hero-locked-v10.png`, `featured-tournament.png`,
  `tournament-hero.png`, `results/overall-winner.jpg`, and
  `results/big-bass.jpg`.
- Deleted the unreferenced `public/images/placeholders/tournament-coming-soon.png`
  after confirming it was byte-identical to both retained result placeholders;
  it had neither runtime nor distinct archival value.
- Every other unreferenced design candidate had archival value, and no ZIP or
  other source package remains publicly deployable.

### Dependency decisions

- Removed `@base-ui/react` and `class-variance-authority`: neither is imported,
  configured, nor required by the maintained shadcn setup.
- Removed `autoprefixer`: neither PostCSS configuration used it, and the active
  Tailwind CSS 4 pipeline uses `@tailwindcss/postcss`.
- Retained `clsx` and `tailwind-merge`: `lib/utils.ts` uses both for the
  configured shadcn `cn` helper.
- Retained `lucide-react`: `components.json` selects Lucide as the icon library
  for the maintained shadcn component workflow.
- Retained `shadcn`: `app/globals.css` imports `shadcn/tailwind.css`, and
  `components.json` is the active generated-component configuration.
- Package changes were made with `npm uninstall`; `package.json` and
  `package-lock.json` are synchronized.

### Configuration and root-file review

- Kept `postcss.config.mjs` as the canonical ESM PostCSS configuration and
  removed the equivalent `postcss.config.js` after lint, TypeScript, and a
  production build passed.
- Removed the obsolete Tailwind 3-style `tailwind.config.js`. Tailwind CSS 4
  continues to load through `app/globals.css` and `@tailwindcss/postcss`.
- Retained `components.json` for the shadcn workflow, `next.config.ts` as the
  typed Next.js configuration boundary, and `.gitignore` for generated,
  dependency, environment, and local files.
- Retained `CLAUDE.md`; its single `@AGENTS.md` directive delegates to the
  canonical repository instructions and does not conflict with them.
- Updated `README.md` to describe implemented and future sections factually.
- Removed generated placeholder comments from maintained configuration.

### Final scan and unresolved review items

- No unused imports or broken imports were reported by lint, TypeScript, or the
  production build.
- No `href="#"`, missing referenced public asset, public source archive,
  duplicate PostCSS/Tailwind config, active stale Create Next App language, or
  empty maintained directory remains.
- All active routes remain in place. Big Bass remains nested in tournament
  results; no Big Bass page or archive gallery exists. Safety Requirements
  remains assigned to Official Rules in the approved sitemap; that future route
  was not created.
- Unresolved work is intentionally route/feature scoped: Event Information,
  Registration and confirmation, full tournament results, AOY, FAQ & Rules
  (including Official Rules and Safety Requirements), Sponsors, Contact,
  Privacy Policy, and Terms of Use. Existing placeholder AOY values remain
  unchanged as required.

### Batch 4 verification

- `npm install`: pass
- `npm ls --depth=0`: pass
- `npm run lint`: pass
- `npx tsc --noEmit`: pass
- `npm run build`: pass
- Production asset reference check: pass
- Public archive/source-package check: pass

## Cleanup Batch 3 — Complete (2026-07-20)

Tournament data consolidation is complete. `data/tournaments.ts` is now the temporary canonical source for public event facts and provides typed selectors for featured, upcoming, slug lookup, and image fallback behavior.

### Data files changed

- Refined `data/tournaments.ts` into the canonical typed event model.
- Replaced the mixed `data/tournamentData.ts` module with `data/tournamentResults.ts`.
- Added `data/aoyStandings.ts` to keep unchanged AOY values separate from schedule data.

### Duplicate data removed

- Removed the hard-coded featured event date, name, image, and countdown source from `FeaturedTournament.tsx`.
- Removed the duplicate three-event schedule and display dates from `AOYStandings.tsx`.
- Removed component-local populated-looking result names and weights from `WinnersCircle.tsx`.
- Removed the duplicate event name, date, and result route from the former `data/tournamentData.ts` structure.

### Remaining placeholders and unresolved decisions

- The single result record is deliberately unpublished and empty; all current event results remain “Results Coming Soon.”
- Existing AOY values remain unchanged and are still unsourced placeholder data pending an approved real data source.
- Registration is marked open for the three existing events, but no approved registration URLs exist, so controls remain unavailable.
- The canonical public lake names remain exactly as recorded in the prior schedule data; no naming changes were invented.
- Event information and registration route work remains outside this batch.

Audit date: 2026-07-20  
Scope: complete maintained repository, excluding generated/dependency internals (`.git/`, `.next/`, and `node_modules/`)  
Mode: read-only analysis; this report is the only modified file  
Source of truth: `AGENTS.md`, `docs/MasterSiteMap.md`, `docs/DevelopmentRoadmap.md`, `docs/UI-Standards.md`, `docs/DecisionLog.md`, and `docs/ProjectStatus.md`

## Executive Summary

> **Historical audit snapshot:** The following paragraph describes the
> repository when this audit was originally performed and is not current-state
> evidence. See [Project Status](ProjectStatus.md) for verified current status.

At the time of the original audit, the repository was a working Next.js
foundation that did not implement most of the approved sitemap. It had Home,
Schedule, Results, a dynamic result detail, and How It Works. The original
audit concerns included broken navigation, missing images, placeholder
results/AOY content, duplicated tournament information, unused experiments,
and unreferenced public files.

The implementation also conflicts with the approved hierarchy in two places: `/how-it-works` is a top-level route instead of living under FAQ & Rules, and Schedule sends “Event Info” traffic to `/results/[slug]`. No separate archive gallery, Big Bass page, or safety page exists.

## 1. Active Project Structure

### Application routes

| URL | File | Type | Current purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Static page | Home |
| `/schedule` | `app/schedule/page.tsx` | Static page | Tournament schedule |
| `/results` | `app/results/page.tsx` | Static page | Results index, currently “Coming Soon” |
| `/results/[slug]` | `app/results/[slug]/page.tsx` | Dynamic page | Tournament result shell |
| `/how-it-works` | `app/how-it-works/page.tsx` | Static page | How It Works plus embedded FAQ |
| Contact email endpoint | Removed 2026-07-23 | Not present | Contact now uses visitor-initiated email |
| `/_not-found` | Framework generated | Static | Next.js not-found output; not a source route |

### Layouts

| File | Scope | Contents |
|---|---|---|
| `app/layout.tsx` | Entire application | Geist fonts, global CSS, shared Footer, shared FeedbackWidget |

There are no nested layouts. The active Header is rendered only by `app/page.tsx`, so it is not actually global. Footer and FeedbackWidget are global.

### Reusable components

| File | Imported by active code? | Notes |
|---|---:|---|
| `components/Header.tsx` | Yes | Home only; should be promoted to the shared layout |
| `components/Footer.tsx` | Yes | Shared through root layout |
| `components/FeedbackWidget.tsx` | Yes | Shared through root layout; opens a `mailto:` link to `info@allintrail.com` |
| `components/PageHeader.tsx` | Yes | Schedule only; approved shared major-page heading |
| `components/Hero.tsx` | Yes | Home hero |
| `components/LatestTournamentNews.tsx` | Yes | Home news block |
| `components/FeaturedTournament.tsx` | Yes | Home featured tournament; contains hard-coded tournament data |
| `components/WinnersCircle.tsx` | Yes | Home placeholder results/Big Bass |
| `components/AOYStandings.tsx` | Yes | Home placeholder AOY and duplicated schedule |
| `components/HomeDashboard.tsx` | No | Unused alternate composition |
| `components/HomeHighlights.tsx` | No | Unused alternate composition |
| `components/HeroActions.tsx` | No | Unused action strip |
| `components/ui/Header.tsx` | No | Duplicate/experimental Header |
| `components/ui/button.tsx` | No | Unused generated UI primitive |
| `components/Button.tsx` | No | Empty file |

### Data and utility files

| File | Active? | Contents |
|---|---:|---|
| `data/tournaments.ts` | Yes | Three 2026–2027 tournament records and exported types |
| `data/tournamentData.ts` | Yes | Placeholder current-tournament winners/pots used by WinnersCircle |
| `lib/utils.ts` | Indirect unused chain only | Used only by unused `components/ui/button.tsx` |

All exports in `data/tournaments.ts` and `data/tournamentData.ts` are used. `TournamentStatus` and `Tournament` support the exported active array. There are no compiler-reported unused imports or variables.

### Public assets currently referenced

| Asset | References | Status |
|---|---|---|
| `public/images/logo.png` | Both Header implementations | Exists |
| `public/images/hero/hero-locked-v10.png` | `components/Hero.tsx` | Exists |
| `public/images/featured-tournament.png` | `components/FeaturedTournament.tsx` | Exists |
| `public/images/tournament-hero.png` | Results index | Exists |
| `public/images/results/overall-winner.jpg` | WinnersCircle | Exists; byte-identical placeholder |
| `public/images/results/big-bass.jpg` | WinnersCircle | Exists; byte-identical placeholder |
| `public/images/placeholders/tournament-coming-soon.png` | `data/tournamentData.ts` | Exists; byte-identical placeholder |
| `app/favicon.ico` | Next.js metadata convention | Exists, implicitly referenced |
| `public/images/tournament-hero.jpg` | Result detail | **Missing**; only `.png` exists |
| `public/images/lakes/eagle-mountain.jpg` | Tournament data | **Missing** |
| `public/images/lakes/squaw-creek.jpg` | Tournament data | **Missing** |
| `public/images/lakes/ray-hubbard.jpg` | Tournament data | **Missing** |

The three missing lake paths are not currently rendered by the active pages, but they are malformed data references and will break when `heroImage` is consumed.

## 2. Route Analysis

### Active and missing approved routes

Home, Schedule, Results, and individual tournament result URLs are active. The following approved sitemap destinations are missing:

- Schedule → Event Information
- Event Information → Registration
- Registration → Confirmation
- AOY Standings
- FAQ & Rules landing/organization
- Official Rules, including safety requirements
- FAQ as its own approved entry/section
- Sponsors
- Contact
- Privacy Policy
- Terms of Use

Current Tournament Results and Past Tournament Results are not implemented as meaningful views. The Results index and details are shells populated from upcoming tournaments.

### Extra, duplicate, and ambiguous routes

- `/how-it-works` is an approved concept but is implemented as an ungrouped top-level route. The sitemap puts it under FAQ & Rules. It also embeds a full FAQ, blurring two approved entries.
- The former feedback endpoint was removed on 2026-07-23. The Contact page and
  widget now open the visitor's email application; there is no server-submitted
  contact form.
- `/results/[slug]` is appropriate for individual results, but Schedule labels links to it “Event Info.” This conflates the approved Schedule/Event Information branch with Results.
- No duplicate filesystem route resolves to the same URL.

### Broken internal links

| Target | Sources | Finding |
|---|---|---|
| `/standings` | `components/AOYStandings.tsx` | Missing approved route |
| `/tournaments/eagle-mountain-lake` | `components/FeaturedTournament.tsx` | Missing and not an approved route pattern |
| `/register` and `/register?tournament=…` | FeaturedTournament, Schedule, How It Works | Missing; registration should be under Event Information |
| `/rules` | How It Works | Missing; Official Rules belongs under FAQ & Rules |
| `/login` | Both Header files | Missing and not yet approved as a public Phase 2 route |
| `/contact` | Footer | Missing approved route |
| `#schedule`, `#standings`, `#rules`, `#sponsors`, `#register` | Header/Footer | No matching IDs on Home |
| `#` | Header/Footer Home and social links | Placeholder; does not navigate to an approved destination |

`#results` is the only valid homepage fragment among the shared navigation targets. `/schedule`, `/results`, `/how-it-works`, and `/results/[slug]` have active incoming links. Therefore, there is no dynamic route with no active entry point: `/results/[slug]` is reached from Schedule and Results for all three tournament slugs.

### Placeholder pages

- `app/results/page.tsx`: all cards display “Coming Soon.”
- `app/results/[slug]/page.tsx`: only a “Results Coming Soon” shell; no standings, weight, payouts, or Big Bass data.
- `app/how-it-works/page.tsx`: substantial content, but registration/rules calls to action are broken.
- Schedule is functional content, although its Event Info and Register destinations are incorrect/missing.

## 3. Component Analysis

### Imported components

The nine active reusable components are Header, Footer, FeedbackWidget, PageHeader, Hero, LatestTournamentNews, FeaturedTournament, WinnersCircle, and AOYStandings. Their exact active parent relationships are documented in the structure table above.

### Never imported / experimental

- `components/Button.tsx` is empty and never imported.
- `components/HomeDashboard.tsx` and `components/HomeHighlights.tsx` are unused competing homepage compositions.
- `components/HeroActions.tsx` is a complete but unused action-bar experiment.
- `components/ui/Header.tsx` is an unused competing Header with similar navigation.
- `components/ui/button.tsx` and `lib/utils.ts` form an unused generated UI dependency chain.

### Duplicate components and sharing opportunities

- `components/Header.tsx` and `components/ui/Header.tsx` duplicate header/navigation responsibility. The active one should become global; the inactive one should not coexist after review.
- `HomeDashboard` and `HomeHighlights` overlap the direct composition already present in `app/page.tsx`.
- Schedule data is duplicated inside `AOYStandings.tsx`; it should derive from `data/tournaments.ts`.
- FeaturedTournament hard-codes the event date, lake, launch site, and URLs instead of selecting the `featured` tournament from `data/tournaments.ts`.
- Header and Footer duplicate navigation definitions and disagree on destinations. A small shared navigation definition would prevent drift.
- Results and Schedule each implement tournament presentations inline. A shared tournament summary component may become appropriate once Event Information is implemented, but creating it now is not required.
- `PageHeader` should be used by other major pages as required by UI Standards.

The high-confidence component removals are the empty Button and unused alternate compositions. The generated UI Button chain is safe only if the project does not intend to adopt it imminently; it is classified high-confidence because no active source imports it.

## 4. Data Analysis

### Active sources and duplication

`data/tournaments.ts` is the closest thing to a canonical schedule source and powers Schedule plus both Results routes. `data/tournamentData.ts` separately models the current tournament and winner placeholders. AOYStandings and FeaturedTournament contain additional private, hard-coded copies of the schedule/event data.

Conflicts include:

- Eagle Mountain is named `Eagle Mountain` in `tournaments.ts`, `Eagle Mountain Lake` in `tournamentData.ts`, and `Eagle Mountain Lake` in FeaturedTournament.
- Canonical slug is `eagle-mountain-2026`, while FeaturedTournament links to `/tournaments/eagle-mountain-lake`.
- Tournament date is ISO text in `tournaments.ts`, display text in `tournamentData.ts`/AOYStandings, and a timezone-bearing `Date` constant in FeaturedTournament.
- All three tournaments have `resultsAvailable: false`, but the Results index still treats each upcoming tournament as a result card.
- `heroImage` is populated for every tournament with nonexistent asset paths.

### Placeholder, mock, and malformed content

- AOY standings (`Smith / Jones`, `Davis / Lee`, `Brown`) are unsourced mock values and conflict with Project Status, which marks AOY not started.
- WinnersCircle contains a hard-coded `topFiveResults` with generic `Angler 1`–`Angler 5` and blank weights.
- `currentTournament` supplies “Coming Soon” for champion, Big Bass, AOY leader, and all pot winners.
- Five placeholder/result image files have the exact same SHA-256 hash despite different roles and extensions.
- Feedback sends `category` from the client but the API silently ignores it.
- Feedback accepts any nonempty email string server-side; browser validation does not protect direct API calls.

There are no syntax errors, TypeScript-invalid structures, or unused exported data symbols. The problems are semantic/staleness issues rather than malformed TypeScript.

## 5. Asset Analysis

### Referenced assets

The referenced/existing and referenced/missing assets are fully listed in Section 1.

### Unused assets

The repository contains 24 files under `public/` with no static reference in `app/`, `components/`, or `data/`:

- Starter SVGs: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- Design/source candidates: `images/all-in-flyer.png`, `homepage-mockup.png`, `homepage-v2.png`
- Trophy variants: `trophy-inaugural.png`, `trophy-inaugural-v2.png`
- Winners-circle variants: `winners-circle-template.png`, `winners-circle-title.png`, `winners-circle-title-v3.png`, `winners-circle-title-v4.png`
- Hero source/variants: `hero-image.png`, `hero-locked-v6.png` through `hero-locked-v9.png`, `hero-title.png`
- Temporary archive: `images/hero/all-in-feedback-footer.zip`
- Redundant placeholders: `images/placeholders/big-bass.jpg`, `images/placeholders/overall-winner.jpg`

The mockups and design variants may be source material, so absence of a code reference alone is not enough to delete them without owner review. The ZIP is not a web-delivered site asset and should not live under `public/`.

### Duplicate images

These five files are byte-for-byte identical (SHA-256 `646DE262…CCB0C`):

- `public/images/placeholders/big-bass.jpg`
- `public/images/placeholders/overall-winner.jpg`
- `public/images/placeholders/tournament-coming-soon.png`
- `public/images/results/big-bass.jpg`
- `public/images/results/overall-winner.jpg`

The first two are unreferenced and safe to remove. The three referenced copies should be consolidated only as part of an intentional placeholder/data cleanup, because changing their paths modifies active code.

## 6. Code Quality

| Check | Result |
|---|---|
| `npm run lint` | Pass; zero reported errors/warnings |
| `npx tsc --noEmit` | Pass; zero TypeScript errors |
| `npm run build` | Pass with network access; Next.js 16.2.10 compiled and generated 8 static pages |
| Initial sandboxed build | Failed only because `next/font` could not fetch Geist and Geist Mono from Google Fonts |
| Broken import search | No missing module imports found; compiler/build pass |
| Internal link search | Broken targets listed in Section 2 |
| Static asset reference search | Four missing paths listed in Section 1 |

No unused imports, unused variables, or dead local functions were reported by ESLint/TypeScript. No commented-out experimental code was found; comments are section labels. Dead code exists at the file/component graph level, which the compiler does not flag.

Additional quality findings:

- `app/layout.tsx` still has Create Next App metadata (`title: "Create Next App"`, generated description).
- Both `postcss.config.js` and `postcss.config.mjs` configure the same plugin; retaining two formats is unnecessary and can create ambiguity.
- `tailwind.config.js` is a Tailwind 3-style content config in a Tailwind 4 project and may be redundant; review before removal because tooling conventions can vary.
- `components/FeedbackWidget.tsx` uses `FormEvent` as a value import instead of `import type`; valid, but a minor consistency improvement.
- Contact email is inbound through Cloudflare Email Routing to the verified
  Gmail destination. The website does not contain a transactional contact-email
  sender.
- Global navigation and metadata do not yet satisfy the approved global architecture.

## 7. Approved Architecture Comparison

| Approved item | Repository state |
|---|---|
| Home | Implemented |
| Schedule | Implemented; downstream routes missing |
| Event Information → Registration → Confirmation | Missing; result detail is incorrectly used as Event Info |
| Results: current and past | Shell only |
| Big Bass stored within tournament result | Placeholder shown on Home; not stored/displayed in result detail |
| AOY Standings | Missing route; mock Home excerpt only |
| FAQ & Rules → How It Works / Official Rules / FAQ | Only standalone `/how-it-works`; FAQ embedded there; rules missing |
| Sponsors | Missing |
| Contact | Missing page; modal/API exists |
| Shared Header | Not global |
| Shared Footer | Implemented globally |
| Shared PageHeader | Exists, used only by Schedule |
| Privacy / Terms / social links | Missing or placeholder |

Explicit confirmations:

- **No separate archive image gallery exists.** This matches the approved exclusion.
- **No separate Big Bass page exists.** This matches the approved exclusion.
- **Big Bass must stay with each tournament’s results.** Current result details mention it but do not yet store or display it; the Home WinnersCircle is only a teaser.
- **Safety requirements must stay inside Official Rules.** No safety route or Official Rules route currently exists; do not create a separate safety page.
- **FAQ and How It Works belong under FAQ & Rules.** The current standalone `/how-it-works` route and embedded FAQ need architectural review when that approved section is implemented.

## 8. Cleanup Classification

Each row is one counted cleanup item. “Safe” means there is strong repository evidence of no active use; it does not override the project rule to prove unused status again immediately before deletion.

### SAFE TO DELETE — 15 items

| Full path | Why / evidence | Confidence | Recommendation |
|---|---|---|---|
| `components/Button.tsx` | Empty, zero-line file; no imports | High | SAFE TO DELETE |
| `components/HomeDashboard.tsx` | Never imported; duplicates active Home composition | High | SAFE TO DELETE |
| `components/HomeHighlights.tsx` | Never imported; duplicates active Home composition | High | SAFE TO DELETE |
| `components/HeroActions.tsx` | Never imported or rendered | High | SAFE TO DELETE |
| `components/ui/Header.tsx` | Never imported; duplicate of active Header | High | SAFE TO DELETE |
| `components/ui/button.tsx` | Never imported by active source | High | SAFE TO DELETE |
| `lib/utils.ts` | Used only by unused UI button; no active consumer | High | SAFE TO DELETE |
| `public/file.svg` | Unreferenced Create Next App asset | High | SAFE TO DELETE |
| `public/globe.svg` | Unreferenced Create Next App asset | High | SAFE TO DELETE |
| `public/next.svg` | Unreferenced Create Next App asset | High | SAFE TO DELETE |
| `public/vercel.svg` | Unreferenced Create Next App asset | High | SAFE TO DELETE |
| `public/window.svg` | Unreferenced Create Next App asset | High | SAFE TO DELETE |
| `public/images/placeholders/big-bass.jpg` | Unreferenced and byte-identical to four other placeholders | High | SAFE TO DELETE |
| `public/images/placeholders/overall-winner.jpg` | Unreferenced and byte-identical to four other placeholders | High | SAFE TO DELETE |
| `public/images/hero/all-in-feedback-footer.zip` | Unreferenced temporary archive exposed under `public/` | High | SAFE TO DELETE |

### REVIEW — 28 items

| Full path | Why / evidence | Confidence | Recommendation |
|---|---|---|---|
| `app/how-it-works/page.tsx` | Approved content at a top-level route; embeds FAQ and links to missing routes | High | REVIEW |
| `app/results/page.tsx` | Placeholder-only results structure built from upcoming tournaments | High | REVIEW |
| `app/results/[slug]/page.tsx` | Placeholder result shell; used incorrectly as Event Info; missing hero JPG | High | REVIEW |
| Former contact email endpoint | Removed 2026-07-23; widget uses visitor-initiated email | None | REMOVED |
| `app/layout.tsx` | Starter metadata and Header not global | High | REVIEW |
| `components/Header.tsx` | Active, but broken/placeholder links and only rendered on Home | High | REVIEW |
| `components/Footer.tsx` | Active, but broken fragments, missing Contact, placeholder social links | High | REVIEW |
| `components/AOYStandings.tsx` | Contains stale mock standings and duplicated schedule data | High | REVIEW |
| `components/FeaturedTournament.tsx` | Hard-coded duplicate event data and broken routes | High | REVIEW |
| `components/WinnersCircle.tsx` | Placeholder Top 5/results and duplicate placeholder imagery | High | REVIEW |
| `data/tournamentData.ts` | Duplicates canonical tournament data and contains only placeholder winners | High | REVIEW |
| `data/tournaments.ts` | Canonical active data, but all three `heroImage` paths are missing | High | REVIEW |
| `postcss.config.js` | Duplicates `postcss.config.mjs` | High | REVIEW |
| `postcss.config.mjs` | Duplicates `postcss.config.js`; determine canonical format | High | REVIEW |
| `tailwind.config.js` | Potentially redundant legacy-style config in Tailwind 4 | Medium | REVIEW |
| `docs/RepositoryMap.md` | Secondary architecture report contains interpretations that should not outrank MasterSiteMap | Medium | REVIEW |
| `public/images/all-in-flyer.png` | Unreferenced; may be retained source/marketing art | Medium | REVIEW |
| `public/images/homepage-mockup.png` | Unreferenced temporary/design mockup | High | REVIEW |
| `public/images/homepage-v2.png` | Unreferenced temporary/design mockup | High | REVIEW |
| `public/images/trophy-inaugural.png` | Unreferenced design variant | Medium | REVIEW |
| `public/images/trophy-inaugural-v2.png` | Unreferenced design variant | Medium | REVIEW |
| `public/images/winners-circle-template.png` | Unreferenced design template | Medium | REVIEW |
| `public/images/winners-circle-title.png` | Unreferenced design variant | Medium | REVIEW |
| `public/images/winners-circle-title-v3.png` | Unreferenced design variant | Medium | REVIEW |
| `public/images/winners-circle-title-v4.png` | Unreferenced design variant | Medium | REVIEW |
| `public/images/hero/hero-image.png` | Unreferenced hero source/variant | Medium | REVIEW |
| `public/images/hero/hero-locked-v6.png` | Unreferenced superseded hero variant | High | REVIEW |
| `public/images/hero/hero-locked-v7.png` | Unreferenced superseded hero variant | High | REVIEW |

The remaining unreferenced hero variants are counted below as KEEP because the numbered progression and current v10 make provenance uncertain without visual/owner confirmation.

### KEEP — 10 items

| Full path | Why / evidence | Confidence | Recommendation |
|---|---|---|---|
| `public/images/hero/hero-locked-v8.png` | Unreferenced but near-current source variant; retain pending visual provenance review | Low | KEEP |
| `public/images/hero/hero-locked-v9.png` | Immediate predecessor to active v10; likely useful source/fallback | Medium | KEEP |
| `public/images/hero/hero-title.png` | Unreferenced but likely compositing source for current hero | Low | KEEP |
| `public/images/hero/hero-locked-v10.png` | Actively rendered by Home Hero | High | KEEP |
| `public/images/logo.png` | Actively rendered by Header | High | KEEP |
| `public/images/featured-tournament.png` | Actively rendered by FeaturedTournament | High | KEEP |
| `public/images/tournament-hero.png` | Actively rendered by Results index; may also replace broken `.jpg` reference | High | KEEP |
| `public/images/placeholders/tournament-coming-soon.png` | Actively referenced by current tournament data | High | KEEP |
| `public/images/results/overall-winner.jpg` | Actively rendered by WinnersCircle | High | KEEP |
| `public/images/results/big-bass.jpg` | Actively rendered by WinnersCircle | High | KEEP |

Missing files are defects, not cleanup candidates, so they are not counted as classification items. The classification likewise does not label required source-of-truth documents or ordinary active source files as cleanup candidates merely to inflate KEEP totals.

## 9. Cleanup Order

### Batch 1: High-confidence safe removals — COMPLETE (2026-07-20)

Completed the approved Repository Cleanup Batch 1 after a final import/reference check. Removed the 13 files explicitly approved for this batch (six components, five starter SVGs, and two redundant placeholder images). No active imports or references required removal. Lint and build verification passed. The two other items in the original 15-item SAFE TO DELETE classification (`lib/utils.ts` and `public/images/hero/all-in-feedback-footer.zip`) were outside the approved Batch 1 deletion list and remain for a later cleanup decision.

### Batch 2: Link, asset, metadata, and feedback configuration repairs — COMPLETE (2026-07-20)

Completed the approved Repository Cleanup Batch 2 without adding routes, pages,
features, or architecture. Repairs made:

- Replaced the missing result-detail hero reference
  `/images/tournament-hero.jpg` with the existing
  `/images/tournament-hero.png`.
- Removed the unused `heroImage` field and its three nonexistent
  `/images/lakes/*.jpg` values from `data/tournaments.ts`.
- Replaced Home, Schedule, and Results fragment/placeholder navigation with
  `/`, `/schedule`, and `/results` respectively.
- Removed broken links to `/standings`,
  `/tournaments/eagle-mountain-lake`, `/register`, `/rules`, `/login`,
  `/contact`, and `/register?tournament=...`.
- Kept AOY Standings, Event Info, Register, Official Rules, Sponsors, and Login
  visible but intentionally disabled until their approved routes are built.
- Changed Footer Contact Us to open the then-current contact experience. The
  current implementation uses visitor-initiated email.
- Rendered Facebook, Instagram, and YouTube labels as non-clickable placeholders
  because no verified social URLs are documented.
- Replaced default Create Next App metadata with the approved site title and
  description.
- A later 2026-07-23 contact-architecture change removed the server email
  endpoint and its environment configuration; this earlier audit action is no
  longer current.
- Revised the README's blanket “Coming Soon” statement to describe the active
  implementation factually.

Unresolved route-dependent items: Event Information, Registration and its
confirmation flow, AOY Standings, Official Rules, Sponsors, Contact, Privacy
Policy, and Terms of Use. These require future approved route work and were not
created in this batch. Repository cleanup as a whole remains in progress.

### Batch 3: Route and architecture cleanup

Implement only approved routes in sitemap order: Event Information/Registration/Confirmation, AOY, FAQ & Rules children, Sponsors, Contact, Privacy, and Terms. Move or map How It Works under FAQ & Rules, keep results separate from event information, make Header global, and replace all broken/placeholder navigation. Do not invent `/tournaments/...`, a separate Big Bass page, gallery, or safety page.

### Batch 4: Data cleanup

Make `data/tournaments.ts` the single tournament source (or replace it with one equally simple canonical model). Remove duplicated event constants, replace mock AOY/results data with clearly typed empty states, store Big Bass inside each tournament result, fix missing image paths, and reconcile event names/slugs/dates.

### Batch 5: Folder and naming cleanup

Choose one PostCSS config, evaluate the Tailwind config, normalize image naming/extensions, consolidate identical placeholders, and move source mockups/archives out of publicly served folders if they must be retained.

## 10. Verification Record

- Reviewed 77 maintained repository files present at audit start, including the pre-existing `docs/RepositoryAudit.md`; generated/dependency internals were excluded.
- Enumerated routes using both filesystem inspection and successful Next.js build output.
- Traced every static `import`, internal `href`, image `src`, CSS `url()`, and data image path under `app/`, `components/`, `data/`, and `lib/`.
- Compared referenced asset paths with the `public/` filesystem.
- Hashed every public file with SHA-256 to identify exact duplicates.
- Ran `npm run lint`: pass.
- Ran `npx tsc --noEmit`: pass.
- Ran `npm run build`: pass with network access. Initial restricted run failed only on Google Fonts retrieval.
- Confirmed Git working tree was clean before writing this report.

## Final Counts

- Audit completed
- Number of files reviewed: **77**
- Number of SAFE TO DELETE items: **15**
- Number of REVIEW items: **28**
- Number of KEEP items: **10**
- Recommended first cleanup batch: **Batch 1 — High-confidence safe removals (15 items), followed by lint, TypeScript, and build verification**

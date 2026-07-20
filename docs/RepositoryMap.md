# Repository Map

Comparison date: 2026-07-20

This report compares the current repository against the approved architecture in `docs/MasterSiteMap.md`.

## Intended High-Level Structure

```text
app/
├── page.tsx
├── schedule/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── results/
│   └── page.tsx
└── standings/
    └── page.tsx

components/
├── Header
├── Footer
├── PageHeader
├── TournamentCard
└── etc.

data/

public/
```

Current differences from this intended outline:

- `app/schedule/[slug]/page.tsx` does not exist.
- `app/standings/page.tsx` does not exist.
- `components/TournamentCard` does not exist; tournament presentation is implemented inline or within other components.
- The repository has an additional `app/results/[slug]/page.tsx` route.
- The repository has an additional `app/how-it-works/page.tsx` route, which is approved under FAQ & Rules.
- The repository has an additional `app/api/feedback/route.ts` supporting API route.
- Component files use `.tsx` filenames, such as `Header.tsx`, `Footer.tsx`, and `PageHeader.tsx`.

## Active Routes

| Route | Source | Architecture status |
|---|---|---|
| `/` | `app/page.tsx` | Approved: Home |
| `/schedule` | `app/schedule/page.tsx` | Approved: Schedule |
| `/results` | `app/results/page.tsx` | Approved: Results |
| `/results/[slug]` | `app/results/[slug]/page.tsx` | Consistent with individual tournament results, but also being used as Event Information |
| `/how-it-works` | `app/how-it-works/page.tsx` | Approved under FAQ & Rules |
| `/api/feedback` | `app/api/feedback/route.ts` | Supporting API route not documented in the sitemap |

The framework-generated `/_not-found` route is not an architectural inconsistency.

## Missing Pages

- Event Information
- Registration
- Registration Confirmation
- AOY Standings
- Official Rules
- FAQ as a dedicated page or section
- Sponsors
- Contact
- Privacy Policy
- Terms of Use

Results-related implementation gaps:

- No implemented Current Tournament Results view
- No implemented Past Tournament Results archive
- No stored or displayed Big Bass result within each tournament result
- `/results/[slug]` currently displays a “Results Coming Soon” shell

## Extra Pages and Routes

- `/api/feedback` is not documented in the master sitemap, although it supports the global feedback widget.
- No clearly unapproved public page file currently exists.
- `/login` and `/tournaments/eagle-mountain-lake` are referenced by navigation but are neither implemented nor approved routes.

## Broken Navigation

Live navigation targets without matching routes:

- `/standings`
- `/tournaments/eagle-mountain-lake`
- `/register`
- `/rules`
- `/login`
- `/contact`
- `/register?tournament=...`

Broken homepage fragments:

- `#schedule`
- `#standings`
- `#rules`
- `#sponsors`
- `#register`

Only `#results` has a corresponding section ID.

Additional navigation inconsistencies:

- Header and footer Home links use `#` instead of `/`.
- Facebook, Instagram, and YouTube links use `#` placeholders.
- Header Schedule points to `#schedule` instead of `/schedule`.
- Header Results points to `#results` instead of `/results`.
- Footer Schedule, Results, Standings, Rules, and Sponsors use fragments rather than approved page routes.
- Schedule “Event Info” links point to `/results/[slug]`, conflating event information with tournament results.

## Unused Routes

No implemented application route is completely unused:

- `/` is the site entry point.
- `/how-it-works` has incoming links.
- `/schedule` is linked from the AOY component.
- `/results` has incoming links.
- `/results/[slug]` is linked from Schedule and Results.
- `/api/feedback` is called by the feedback widget.

However, `/schedule` and `/results` are omitted from the live shared navigation because the header and footer use fragments instead.

## Duplicate Functionality

- `components/Header.tsx` and inactive `components/ui/Header.tsx` implement competing headers with similar navigation.
- Header and footer independently duplicate navigation definitions with inconsistent targets.
- How It Works contains a complete FAQ collection even though the approved architecture identifies How It Works and FAQ as separate entries under FAQ & Rules.
- `/results/[slug]` is being used for both Event Information and future tournament results.
- `AOYStandings.tsx` contains upcoming schedule information that duplicates the dedicated Schedule functionality and tournament data.
- `FeaturedTournament.tsx` duplicates tournament information instead of deriving it from the shared tournament dataset.
- `HomeDashboard.tsx`, `HomeHighlights.tsx`, and `app/page.tsx` contain overlapping homepage composition approaches.

## Pages Not in the Approved Architecture

Implemented public pages align with an approved sitemap entry:

- `/` — Home
- `/schedule` — Schedule
- `/results` — Results
- `/results/[slug]` — individual tournament result
- `/how-it-works` — How It Works

Potential violations or ambiguities:

- `/results/[slug]` acts as Event Information when reached from Schedule, although Event Information belongs beneath Schedule and tournament detail belongs beneath Results.
- `/login` and `/tournaments/eagle-mountain-lake` are referenced as pages but are not approved or implemented.
- `/api/feedback` is an undocumented supporting route.

## Global Architecture Inconsistencies

- Header is not shared globally; it is rendered only on the homepage.
- Footer is correctly shared through the root layout.
- `PageHeader` is used only by Schedule rather than consistently across major pages.
- Privacy Policy is missing.
- Terms of Use is missing.
- Social links are placeholders.
- Contact functionality is split between a global feedback widget, an email link, and a broken `/contact` link.
- FAQ & Rules has no shared landing page or organized route structure.
- Safety requirements are not organized within an Official Rules page because that page does not exist.
- Sponsors appears only as a broken fragment link and has no implemented page or homepage section.

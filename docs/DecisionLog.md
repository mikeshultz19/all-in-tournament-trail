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

### 2026-07-22 — Strengthen the participant liability waiver for on-water risk

- **Status:** Approved Draft Pending Legal Review
- **Context:** The Version 1.0 waiver needed clearer treatment of boating accidents, participant negligence, vessel operation, weather and navigation decisions, equipment failures, third-party conduct, and the limits of Tournament Official supervision.
- **Decision:** Expand the authoritative waiver without changing Version 1.0. Make each participant responsible for independent on-water judgment and safe vessel operation; state that no schedule, deadline, prize, or instruction requires unsafe operation; preserve legally non-waivable rights; and retain hidden drafting annotations for qualified Texas counsel. Team and Individual / Solo remain the only registration types.
- **Reasoning:** Clear participant responsibilities and balanced applicable-law limitations improve informed electronic acknowledgment without promising immunity or displacing AITT's legal safety obligations.
- **Impact:** `docs/LIABILITY_WAIVER.md`, `/liability-waiver`, the shared policy renderer, waiver tests, and registration-policy documentation.
- **Follow-up:** Qualified Texas counsel must review express-negligence conspicuousness, released parties, indemnification, minors, venue, and electronic acceptance before adoption.

### 2026-07-22 — Publish registration policies from their Markdown sources

- **Status:** Approved
- **Context:** Registration must provide readable public Rules and Liability Waiver pages and record which policy versions an entrant accepted without maintaining duplicate page content.
- **Decision:** Publish `/rules` from `docs/TOURNAMENT_RULES.md` and `/liability-waiver` from `docs/LIABILITY_WAIVER.md` through one shared server-side Markdown loader and renderer. Keep one unchecked combined acknowledgment, link both policies in new tabs, and carry `rulesVersion`, `waiverVersion`, `acknowledgedAt`, and `acknowledgmentAccepted` through the registration submission contract. Team and Individual / Solo are the only participation types; Angler 2 is a team participant, not a separate co-angler option.
- **Reasoning:** One content source prevents policy drift, public routes support deep links and mobile reading, and explicit version evidence prepares registration persistence without claiming that Phase 1 stores consent durably.
- **Impact:** `/rules`, `/liability-waiver`, `/register`, the quote contract, policy acceptance design, focused tests, and registration documentation.
- **Follow-up:** Obtain qualified legal approval for the waiver and persist a trusted server acknowledgment timestamp and policy versions during Phase 4 before enabling Square payment.

### 2026-07-22 — Use local information icons for deadline and Safe Light

- **Status:** Approved
- **Context:** The condensed registration header and homepage Safe Light display need clearer visual identification without adding more cards or remote dependencies.
- **Decision:** Use the local calendar asset for the registration deadline and share the local sun asset across registration and homepage Safe Light displays. Render both as decorative CSS masks so the interface controls their red and gold colors while adjacent text remains the accessible source of truth.
- **Reasoning:** One local source per icon keeps the treatment consistent, compact, colorable, and maintainable without duplicating assets or changing tournament calculations.
- **Impact:** Registration header, homepage Tournament Conditions, shared Safe Light presentation, focused tests, and local assets under `public/icons`.

### 2026-07-22 — Condense the tournament registration page

- **Status:** Approved
- **Context:** The registration page repeated deadline, tournament-morning, status, payment-policy, and payment-method information, making the form unnecessarily long and visually noisy.
- **Decision:** Use a single responsive header for the page title, selected tournament deadline, and Estimated Safe Light; omit tournament-morning instructions and the verbose status card from the form; use one combined policy acknowledgment; and keep the order summary and pre-payment Square handoff minimal. Square supplies approved payment controls and method branding only at the actual Payment step.
- **Reasoning:** The shorter hierarchy keeps required facts, fees, eligibility, validation, and legal evidence visible without duplicating operational guidance.
- **Impact:** `/register`, the registration form and summary, acknowledgment evidence design, focused tests, and the Online Registration Workflow follow this presentation.
- **Follow-up:** Add the actual Square interface only after the documented persistence, idempotency, recovery, credential, and legal-language prerequisites are complete.

### 2026-07-22 — Adopt the Early Online Registration workflow and phased payment boundary

- **Status:** Approved
- **Context:** AITT needs a complete online registration experience without presenting an unsafe or simulated production payment path before persistence and verified Square confirmation exist.
- **Decision:** AITT owns tournament selection, angler data, rules, options, pricing, acknowledgments, registration state, history, and confirmation. Square owns payment credentials and processing. WeighFish owns tournament-day operations. Phase 1 implements server-authoritative validation and quoting, price snapshots, lifecycle and recovery rules, the review experience, and a disabled payment-adapter boundary. Square checkout remains disabled until durable persistence, idempotent payment creation, and verified server-side finalization are complete.
- **Reasoning:** A durable pending record and provider verification are required to recover successful payments, prevent duplicate registrations, preserve financial evidence, and avoid confirming from browser state.
- **Impact:** Registration UI, tournament CTAs, pricing, persistence design, Square integration, confirmation, administration, testing, and launch operations follow [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md).
- **Follow-up:** Complete the Phase 2 prerequisites in the workflow before enabling Square sandbox or production checkout.

### 2026-07-22 — Use Square for card and supported wallet payments

- **Status:** Approved
- **Context:** Early Online Registration needs immediate card payment, while tournament-morning operations already belong in WeighFish and should not be duplicated by AITT.
- **Decision:** Square processes credit-card, debit-card, Apple Pay, and other supported contactless-wallet payments. Apple Pay is available on compatible devices and browsers online, and supported contactless wallets are accepted through the tournament-morning Square reader. A flat 3% Card Processing Fee applies equally to card and digital-wallet payments online and at the reader; morning cash has no fee. AITT owns Early Online Registration and confirms it only after successful Square payment. The Tournament Director owns Tournament-Morning Registration in WeighFish, including Cash or Card selection. The homepage advertises card and Apple Pay availability within Latest News & Announcements. Apple Pay branding must use only official, unmodified Apple-provided artwork under Apple's marketing guidelines; a text fallback is used until that artwork is approved and added. The AITT website does not operate a morning point of sale or live payment ledger. After the tournament, AITT will import the official WeighFish CSV through a future protected workflow.
- **Reasoning:** Clear system ownership keeps AITT focused, avoids duplicate records and reconciliation, and preserves WeighFish as the official tournament-day system.
- **Impact:** Payment operations, registration availability, public payment copy, fee calculations, future persistence, Square integration, and WeighFish import must follow this boundary.
- **Follow-up:** Complete registration persistence before enabling production Square checkout; later implement the protected CSV import without real-time synchronization.

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

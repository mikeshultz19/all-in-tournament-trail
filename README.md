# All In Tournament Trail

Official website for the All In Tournament Trail.

## Fish Your Way. Bet Your Way. Win Your Way.

The All In Tournament Trail is a unique bass fishing tournament series that allows anglers to choose their own level of competition through separate Bronze, Silver, and Gold Pots.

### Current Website

- Homepage with trail news, featured tournament information, AOY preview,
  and tournament-result placeholders
- Tournament schedule
- Tournament results index and per-tournament result shells
- Public registration page and itemized registration summary
- Public Official Tournament Rules and Participant Liability Waiver pages
- Tournament watch page
- How It Works and FAQ content
- Site feedback form backed by Resend configuration

The project uses Next.js 16, React 19, TypeScript, and Tailwind CSS 4. The
approved site structure is documented in `docs/MasterSiteMap.md`. The complete
operational registration workflow and policy acknowledgment are implemented.
Durable registration confirmation, full results, AOY, sponsors, contact, and
remaining policy pages are scheduled for future development. Major completed
and planned milestones are recorded in `docs/VersionHistory.md`.

The authoritative requirements for registration, tournament-morning
operations, weather decisions, public tournament status, and Tournament
Director workflows are defined in
`docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md`.

The complete Early Online Registration flow, responsibility boundaries,
server-authoritative pricing, registration states, Square handoff, recovery
behavior, confirmation requirements, and production prerequisites are defined
in `docs/ONLINE_REGISTRATION_WORKFLOW.md`. Phase 1 server validation and review
are implemented, but Square checkout remains disabled until durable
registration persistence and verified server-side payment finalization exist.

Early Online Registration will require immediate Square credit card, debit
card, or supported Apple Pay payment with a 3% Card Processing Fee. Apple Pay
availability depends on the angler's device and browser. Production checkout
remains unavailable until registration persistence and secure server-side
payment confirmation are implemented. Tournament-Morning Registration is
conducted by the Tournament Director in WeighFish; cash has no fee, while card,
Apple Pay, and other supported contactless-wallet payments use the Square
reader with the same 3% fee. The public homepage advertises these approved
payment options. See `public/brands/README.md` for the official Apple Pay mark
asset requirements; only unmodified, Apple-provided artwork may be used. The
protected post-tournament WeighFish CSV import is planned and not yet
implemented.

### AccuWeather tournament forecast setup

The homepage Tournament Conditions panel uses AccuWeather only when the next
tournament is within the five-day forecast horizon. To enable live forecasts:

1. Create an AccuWeather developer account and subscription, then copy the API
   key from the account dashboard.
2. Copy `.env.example` to `.env.local` and set `ACCUWEATHER_API_KEY`. Keep the
   key in the deployment platform's server-side environment settings in
   production. Never commit or expose it as a `NEXT_PUBLIC_` value.
3. Use AccuWeather's Locations API or developer console to obtain the stable
   location key for each tournament location. Set `accuWeatherLocationKey` on
   that tournament in `data/tournaments.ts`; do not use browser location
   lookup.
4. Keep the visible linked `Weather data by AccuWeather` attribution in the
   Tournament Conditions panel. If an official logo is added later, obtain it
   from AccuWeather's current brand resources, confirm the license permits its
   use, and do not redraw or modify it.

The panel shows a closer-to-event message outside the forecast horizon and a
restrained unavailable message when the key, location key, or provider is
unavailable. Safe Light and Tournament Status continue to render without
AccuWeather. No browser-side weather request is used.

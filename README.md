# All In Tournament Trail

AITT is a Next.js 16, React 19, TypeScript, and Tailwind CSS 4 bass-tournament
website with an authenticated staff application named **AITT Admin Center**.
Supabase PostgreSQL, Auth, and Storage provide the backend.

- Canonical domain: <https://allintrail.com>
- Production hosting: Cloudflare Workers through OpenNext and Wrangler
- DNS and inbound email routing: Cloudflare
- Registration-interest confirmation email: Resend when `RESEND_API_KEY` is configured
- Online payment: Square-backed registration/payment lifecycle is implemented;
  production enablement requires explicit configuration and rollout approval
- Public contact: `info@allintrail.com` through visitor-initiated `mailto:`

Start with the canonical [AITT Documentation Index](docs/DOCUMENTATION-INDEX.md)
for current technical, staff, operational, and public documentation. Dated
audits and status reports are retained only as historical references.
The primary operational source is
[AITT Tournament Lifecycle and Operations](docs/AITT_LIFECYCLE_OPERATIONS.md).
The concise repository-backed readiness summary is
[AITT Current State](docs/CURRENT_STATE.md).

## Current state

The public site reads live tournaments, registrations, announcements, published
Results, and AOY data. The Admin Center supports tournament operations,
membership administration, Tournament Reset, WeighFish import/review, payout
review, winner photos, and results publication. Seasons, anglers, memberships,
stable teams, and team-member tables are present.

The production application runs on Cloudflare Workers through OpenNext and
Wrangler. Supabase provides the database, Admin authentication, and storage.
The Admin Center includes WeighFish import and review, Official Results,
payout closeout, and AOY and Championship processing. Square registration,
payment verification/recovery, and durable completion are implemented, but
production enablement must not be inferred from implementation alone.

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the
   server-only `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npm run dev`.

Never expose or commit the service-role key.

Apply checked-in migrations with:

```bash
npx supabase login
npx supabase link
npx supabase db push --dry-run
npx supabase db push
```

## Homepage weather

The homepage uses Open-Meteo for a server-rendered, rolling five-day forecast
beginning with the current `America/Chicago` date. No weather API key is
required. Each tournament must instead have approved `weather_latitude` and
`weather_longitude` coordinates; the application does not use browser
geolocation or geocode a venue on each request.

Forecast requests use Fahrenheit and mph, remain behind the normalized
provider-neutral weather model, and are cached on the server. Weather is
informational only and cannot calculate Safe Light or change Tournament Status.
Visible **Weather data by Open-Meteo** attribution must remain with displayed
forecast data.

The public Open-Meteo endpoint is intended for non-commercial evaluation and
qualifying non-commercial use. Before production, confirm that AITT's use
complies with Open-Meteo's current licence, attribution, rate-limit, and
commercial-use terms and obtain the appropriate service plan if required.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
git diff --check
```

## Documentation

Use the [AITT Documentation Index](docs/DOCUMENTATION-INDEX.md) as the single
entry point. It separates current documentation from historical and
superseded snapshots.

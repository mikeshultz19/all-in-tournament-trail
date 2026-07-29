# All In Tournament Trail

AITT is a Next.js 16, React 19, TypeScript, and Tailwind CSS 4 bass-tournament
website with an authenticated staff application named **AITT Admin Center**.
Supabase PostgreSQL, Auth, and Storage provide the backend.

- Canonical domain: <https://allintrail.com>
- Planned production hosting: Vercel
- DNS and inbound email routing: Cloudflare
- Public contact: `info@allintrail.com` through visitor-initiated `mailto:`

## Current state

The public site reads live tournaments, registrations, announcements, published
Results, and AOY data. The Admin Center supports tournament operations,
membership administration, Tournament Reset, WeighFish import/review, payout
review, winner photos, and results publication. Seasons, anglers, memberships,
stable teams, and team-member tables are present.

The repository is not production-ready. Legacy migrations still grant broad
anonymous writes, results publication is not fully atomic or immutable, the
AOY implementation is name-based rather than stable-team based, and
Championship qualification generation is not implemented. See
[Project Status](docs/ProjectStatus.md) and the
[2026-07-29 audit](docs/CURRENT_STATE_AUDIT_2026-07-29.md).

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

## Validation

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
git diff --check
```

## Documentation

- [Current-state audit](docs/CURRENT_STATE_AUDIT_2026-07-29.md)
- [Project status](docs/ProjectStatus.md)
- [Repository map](docs/RepositoryMap.md)
- [AOY specification](docs/AOY_SPECIFICATION.md)
- [Security notes](docs/SECURITY_NOTES.md)
- [Admin Auth setup](docs/ADMIN_AUTH_SETUP.md)
- [Supabase setup](docs/SUPABASE_SETUP.md)
- [Master sitemap](docs/MasterSiteMap.md)
- [Tournament operations](docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)

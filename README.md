# All In Tournament Trail

All In Tournament Trail (AITT) is a bass-fishing tournament website and staff
administration application. The public site presents tournament information,
registration guidance, conditions, results, rules, and standings. The staff
application is named **AITT Admin Center**.

- Canonical domain: <https://allintrail.com>
- Source control: GitHub
- Planned production hosting: Vercel
- DNS and inbound email routing: Cloudflare
- Backend: Supabase PostgreSQL, with Supabase Auth and Storage planned

The domain is registered, but Vercel production deployment and custom-domain
configuration are not yet complete. `www.allintrail.com` should redirect to the
canonical domain when DNS and hosting are configured.

## Current status

The public-site design and Admin dashboard design are complete. The first
Supabase-backed feature is operational:

- Migration `supabase/migrations/202607230001_create_tournaments.sql` has been
  applied to the hosted project.
- `public.tournaments` exists with Row Level Security enabled.
- `supabase/seed.sql` has created the Lake Fork Open record.
- AITT Admin Center loads real tournament data from Supabase.
- Tournament Information reads and updates successfully, and saved changes
  persist after refresh.
- Cloudflare Email Routing forwards `info@allintrail.com` to the verified Gmail
  destination.

Tournament creation/deletion is not verified. Public homepage and schedule
integration, production deployment, Supabase Auth, Storage, announcements,
conditions, and results publishing are not verified complete. See
[Project Status](docs/ProjectStatus.md).

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL
- Vitest and Testing Library
- Planned: Supabase Auth, Supabase Storage, and Vercel

The project is beginning on free service tiers.

## Local setup

1. Install Node.js and npm.
2. Clone the GitHub repository.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env.local`.
5. Set the server-side Supabase variables:

   ```text
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   ```

   Do not commit real values. The publishable Supabase key is used as the
   anonymous/public key. Never expose a secret or service-role key to browser
   code or documentation.

6. Start the development server:

   ```bash
   npm run dev
   ```

Restart Next.js after changing environment variables.

## Contact

The Contact page and floating Contact widget open the visitor's configured
email application with a message addressed to `info@allintrail.com`. Cloudflare
Email Routing handles inbound forwarding to Gmail. The website does not submit
contact messages through a server endpoint and does not send transactional
email.

## Database setup

Use the repository migration rather than manually creating table columns:

```bash
npx supabase login
npx supabase link
npx supabase db push --dry-run
npx supabase db push
```

If the current CLI setup does not expose a working seed command, run
`supabase/seed.sql` in the hosted project's SQL Editor. The seed is idempotent
by tournament slug. Verify the `public.tournaments` table and the
`lake-fork-open-2026` row afterward.

Full setup and permission details are in
[Supabase Setup](docs/SUPABASE_SETUP.md).

## Development commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## Temporary security warning

The tournaments table currently permits anonymous reads and has a temporary
anonymous table-level `UPDATE` privilege and RLS policy for development. That
access is **not safe for production**. Before launch, implement Supabase Auth,
require authenticated Admin users for writes, and revoke anonymous update
access. Database grants and RLS policies are separate security layers; both
must be correct.

## Documentation

- [Project Status](docs/ProjectStatus.md)
- [Deployment and Hosting](docs/PROJECT_DEPLOYMENT_CHECKLIST.md)
- [Supabase Setup](docs/SUPABASE_SETUP.md)
- [Tournament Data Model](docs/DataModel.md)
- [AITT Admin Center Workflow](docs/ADMIN_CENTER_WORKFLOW.md)
- [Development Workflow](docs/AI_RELEARN.md)
- [Security Notes](docs/SECURITY_NOTES.md)
- [Roadmap](docs/DevelopmentRoadmap.md)
- [Changelog](docs/CHANGELOG.md)
- [Approved Master Sitemap](docs/MasterSiteMap.md)
- [Registration Workflow](docs/ONLINE_REGISTRATION_WORKFLOW.md)
- [Tournament Operations](docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)

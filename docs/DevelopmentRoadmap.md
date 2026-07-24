# Development Roadmap

Updated: 2026-07-23

## Complete

- Public-site design and responsive foundation
- AITT Admin Center dashboard, Current Tournament context, Website Readiness,
  and four management areas
- Supabase tournaments migration, Lake Fork Open seed, RLS, and public reads
- Live tournament loading in AITT Admin Center
- Tournament Information read/update workflow, including verified persistence
  after refresh
- Cloudflare inbound routing for `info@allintrail.com`
- Contact page and widget converted to visitor-initiated email

Sponsors remain separate from tournament readiness and the four management
areas.

## In Progress

- Connect and verify the public homepage against authoritative tournament data.
- Connect and verify the public schedule against authoritative tournament data.
- Prepare deployment without claiming production is live.

## Next — Tomorrow's Ordered Plan

### Step 2 — News & Announcements

- Review the existing page and data model.
- Create or validate the announcements migration.
- Associate announcements with a tournament where appropriate.
- Implement Admin create, edit, publish/unpublish, and delete workflows.
- Verify persistence.
- Connect approved announcements to the public website.
- Keep permissions temporary only until authentication is implemented.

### Step 3 — Tournament Conditions

- Review the existing page and expected fields.
- Create or validate the conditions data model and migration.
- Associate each conditions update with the selected tournament.
- Implement Admin editing and saving.
- Add timestamps and user-friendly freshness information.
- Connect conditions to the public tournament experience.
- Verify persistence.

### Step 4 — Tournament Results

- Review the current Results UI and existing data structures.
- Define the results schema before implementation.
- Plan the WeighFish import workflow.
- Support review before publishing.
- Include tournament winners, big bass, standings, and photo requirements.
- Do not mark results complete merely because the page exists.
- Verify public publishing behavior.

### Step 5 — Authentication and Production Security

- Implement Supabase Auth for Admin users.
- Protect all Admin pages and server actions.
- Replace anonymous Admin writes with authenticated-role policies.
- Revoke anonymous UPDATE access to public.tournaments.
- Review every table grant and RLS policy.
- Ensure secret/service-role keys are never browser accessible.
- Verify logout, unauthorized access, and session handling.
- Complete this before production launch.

## Planned Parallel Follow-ups

- Connect public homepage and schedule to authoritative tournament data.
- Configure Vercel production deployment.
- Configure the canonical domain and www redirect.
- Complete production environment variables.
- Add Supabase Storage when image uploads are implemented.
- Perform accessibility, mobile, and production smoke testing.

## Later Planned Systems

- Durable registration and membership persistence
- Secure Square payment creation and server-side confirmation
- Transactional registration email
- Protected WeighFish import, discrepancy review, results persistence, and AOY
  calculation

## Launch Gate

Production launch requires authenticated Admin writes, revoked anonymous
`UPDATE`, verified production RLS and grants, production environment
configuration, successful lint/TypeScript/tests/build, and verified Vercel,
canonical-domain, DNS, redirect, accessibility, mobile, and smoke testing.

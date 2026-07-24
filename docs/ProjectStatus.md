# Project Status

Last verified: 2026-07-23

This is the source of truth for current implementation status. Historical audit
and version documents are not current-state evidence.

## Completed

- Public-site page design
- AITT Admin Center dashboard, Current Tournament context, Website Readiness,
  and four management areas
- Registration of `allintrail.com` and GitHub source-control connection
- Hosted Supabase project link, initial tournaments migration, Lake Fork Open
  seed, Row Level Security, and anonymous public reads
- Live Supabase tournament loading in AITT Admin Center
- Tournament Information read/update workflow, verified through successful
  saves and persistence after refresh
- Friendly tournament load and save success/failure feedback
- Cloudflare Email Routing enabled for `allintrail.com`
- `info@allintrail.com` forwarding to the verified Gmail destination, tested
  successfully
- Contact page and floating widget converted to visitor-initiated `mailto:`
- Server-side feedback email route, dependency, and environment requirements
  removed

Tournament creation and deletion are not verified. Do not describe Tournament
Information as full CRUD.

## In Progress

- Public homepage integration with authoritative Supabase tournament data
- Public schedule integration with authoritative Supabase tournament data
- Deployment preparation

Code may contain partial implementation for an in-progress item. An item moves
to Completed only after its intended environment and workflow are verified.

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

## Platform Status

| Area | State | Notes |
| --- | --- | --- |
| GitHub | Complete | Repository source control is connected. |
| Domain registration | Complete | `allintrail.com` is registered. |
| Cloudflare email | Complete | Inbound `info@allintrail.com` forwarding is verified. |
| Cloudflare DNS | Partially complete | Production canonical-domain connection and `www` redirect are not verified. |
| Supabase database | Active for development | Migration, seed, and Tournament Information reads/updates are verified. |
| Supabase Auth | Planned | AITT Admin Center is not protected. |
| Supabase Storage | Planned | Image uploads are not implemented. |
| Vercel hosting | Not verified | Do not claim the production site is live. |

## Current Security Exception

`public.tournaments` has RLS enabled and the development workflow currently
uses:

```sql
grant usage on schema public to anon;
grant select on table public.tournaments to anon;
grant update on table public.tournaments to anon;
```

Table privileges allow a role to attempt an operation; RLS separately decides
which rows the operation may access. Anonymous `UPDATE` and its permissive
development policy are temporary. Before production, implement Supabase Auth,
protect all Admin actions, revoke anonymous `UPDATE`, and replace the policy
with authenticated Admin policies.

## Planned

Registration persistence, Square payment creation/finalization, transactional
email, Supabase Auth, Supabase Storage, WeighFish import, results persistence,
winner-photo uploads, Vercel production deployment, canonical-domain
connection, and the `www` redirect are not complete.

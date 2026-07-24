# All In Tournament Trail Version History

Use [Project Status](ProjectStatus.md) for current work and
[Changelog](CHANGELOG.md) for dated changes.

## v0.1 — Architecture and documentation baseline

Status: Complete

- Established repository architecture, standards, documentation, GitHub source
  control, sitemap, and initial planning.

## v0.2 — Repository cleanup

Status: Complete

- Consolidated application structure, assets, data boundaries, and
  configuration.

## v0.3 — Public tournament experience

Status: Complete for page design

- Built the public page designs, registration experience, policies, tournament
  conditions, results shells, responsive behavior, and accessibility
  foundation.

## v0.4 — AITT Admin Center foundation

Status: Complete

- Built the Admin header, warning, Current Tournament context, selector,
  Website Readiness, and four management areas.
- Removed Sponsors from the tournament dashboard workflow.

## v0.5 — Supabase tournament foundation

Status: Complete for Tournament Information read/update

- Linked hosted Supabase, applied the tournaments migration, and seeded Lake
  Fork Open.
- Enabled RLS and public tournament reads.
- Connected AITT Admin Center to live tournament data.
- Verified Tournament Information updates and persistence after refresh.
- Homepage/schedule integration remains in progress.

## v0.6 — Authenticated administration

Status: Planned

- Supabase Auth, protected Admin writes, removal of anonymous update access,
  Announcements, and Conditions.

## v0.7 — Results and media

Status: Planned

- WeighFish import, winner photos, Supabase Storage, results publishing, and
  AOY automation.

## v1.0 — Production release

Status: Planned

- Vercel deployment, Cloudflare DNS, canonical-domain configuration, and
  production-safe administration.

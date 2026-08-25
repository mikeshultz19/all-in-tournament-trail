# AITT Documentation Index

Last reconciled: 2026-08-25

This is the canonical entry point for AITT documentation. Use the sections
below to distinguish current technical guidance, staff operating instructions,
official public documents, and retained historical records.

## Primary lifecycle authority

- [AITT Tournament Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md) —
  primary human-readable source for implemented registration, tournament
  morning, import, payout/closeout, publication, public Results, AOY,
  Championship, environment, and release behavior.
- [Markdown Reconciliation — 2026-08-25](MARKDOWN_RECONCILIATION_2026-08-25.md)
  — dated inventory and consolidation record; not a business-rule authority.

The [Official Tournament Rules](TOURNAMENT_RULES.md) control competition rules.
When a supporting technical or staff document summarizes lifecycle behavior,
it must defer to the primary lifecycle document rather than establish a
different rule.

> **Historical documents are preserved for decision history and must not be
> treated as current implementation or operating instructions.** When a dated
> audit, roadmap, status report, or early design conflicts with current code or
> current documentation listed below, the current implementation and current
> authoritative document control.

## Current Technical / Developer

### Architecture

- [Current State](CURRENT_STATE.md) — current readiness, resolved former
  blockers, and remaining launch work.

- [Repository README](../README.md) — current platform and local setup.
- [Repository Map](RepositoryMap.md) — current code, route, and data ownership map.
- [System Architecture](SYSTEM_ARCHITECTURE.md) — current Cloudflare/OpenNext
  and Supabase architecture.
- [Dynamic Data Map](technical/DYNAMIC-DATA-MAP.md) — detailed source and
  consumer map.
- [Master Site Map](MasterSiteMap.md) — approved public route authority.
- [Decision Log](DecisionLog.md) — durable decisions; older entries may be
  superseded by later decisions.
- [Development Roadmap](DevelopmentRoadmap.md) — current remaining technical work.
- [Changelog](CHANGELOG.md) — dated implementation history and current milestones.

### Supabase and Admin authentication

- [Supabase Setup](SUPABASE_SETUP.md)
- [Supabase Explained](SUPABASE_EXPLAINED.md)
- [Admin Auth Setup](ADMIN_AUTH_SETUP.md)
- [Competitive Record Foundation](technical/COMPETITIVE_RECORD_FOUNDATION.md)
- [Registration Identity Review Queue](technical/REGISTRATION_IDENTITY_REVIEW_QUEUE.md)
- [Identity Reconciliation Foundation](technical/IDENTITY_RECONCILIATION_FOUNDATION.md)

### Registration

- [Online Registration Workflow](ONLINE_REGISTRATION_WORKFLOW.md) — detailed
  registration/payment implementation supporting the primary lifecycle.
- [Durable Registration](technical/DURABLE_REGISTRATION.md)

### Results, import, AOY, and Championship

- [Official Results Workflow](technical/OFFICIAL_RESULTS_WORKFLOW.md)
- [Official Results Historical Snapshot](technical/OFFICIAL_RESULTS_HISTORICAL_SNAPSHOT.md)
- [Immutable Tournament Numbering](technical/IMMUTABLE_TOURNAMENT_NUMBERING.md)
- [Official 2026–2027 Season Schedule](technical/2026_2027_SEASON_SCHEDULE.md)
- [AOY Specification](AOY_SPECIFICATION.md)
- [AOY Engine](technical/AOY_ENGINE.md)
- [Championship Qualification Engine](technical/CHAMPIONSHIP_QUALIFICATION_ENGINE.md)
- [AITT Competition Rules](AITT_COMPETITION_RULES.md) — internal computational
  rules; the Official Tournament Rules remain the public authority.

### Deployment and security

- [Project Deployment Checklist](PROJECT_DEPLOYMENT_CHECKLIST.md) — current
  OpenNext/Wrangler deployment, smoke-check, and recovery procedure.
- [Security Notes](SECURITY_NOTES.md)

Production runs on Cloudflare Workers through OpenNext and Wrangler. Supabase
server credentials remain server-only secrets and must never be committed or
placed in browser-exposed environment variables.

### UI standards

- [UI Style Guide](UI_STYLE_GUIDE.md)

## Current Staff / Operations

Start here for nondeveloper operating instructions:

1. [Knowledge Base — Start Here](knowledge-base/START-HERE.md)
2. [About AITT](knowledge-base/01-ABOUT-AITT.md)
3. [Running a Tournament](knowledge-base/02-RUNNING-A-TOURNAMENT.md)
4. [Memberships and Registration](knowledge-base/03-MEMBERSHIPS-AND-REGISTRATION.md)
5. [Results, AOY, and Championship](knowledge-base/04-RESULTS-AOY-AND-CHAMPIONSHIP.md)
6. [Admin Center Guide](knowledge-base/05-ADMIN-CENTER-GUIDE.md)
7. [Troubleshooting](knowledge-base/06-TROUBLESHOOTING.md)
8. [Operational Glossary](knowledge-base/APPENDIX-GLOSSARY.md)
9. [Launch Test Plan](knowledge-base/AITT-LAUNCH-TEST-PLAN.md)

Supporting operating references:

- [Tournament Operations and Registration Process](TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md)
- [Payment Operations Manual](PAYMENT_OPERATIONS.md)
- [Admin Center Workflow](ADMIN_CENTER_WORKFLOW.md) — abbreviated workflow;
  use the Knowledge Base Admin Center Guide for current route-by-route help.

## Official Public Documents

- [Official Tournament Rules — canonical source](TOURNAMENT_RULES.md), version
  1.8. The matching served copy is
  [`public/docs/TOURNAMENT_RULES.md`](../public/docs/TOURNAMENT_RULES.md).
- [Liability Waiver — source copy](LIABILITY_WAIVER.md), currently marked draft
  pending legal review. The matching served copy is
  [`public/docs/LIABILITY_WAIVER.md`](../public/docs/LIABILITY_WAIVER.md).

The source and public copies of each official document must remain identical.
Do not casually change Rules or waiver content.

## Historical / Superseded

These files are retained for audit trail, design history, or dated context.
They are not current implementation or operating instructions:

- [History index](history/README.md)
- [Current-State Audit — 2026-07-29](history/CURRENT_STATE_AUDIT_2026-07-29.md)
- [Repository Audit](history/RepositoryAudit.md) — July 2026 cleanup baseline.
- [Project Status](history/ProjectStatus.md) — July 2026 status/session snapshot.
- [Version History](history/VersionHistory.md) — early version plan.
- [AI Relearn](history/AI_RELEARN.md) — earlier AI handoff context.
- [How the Website Works](history/HOW_THE_WEBSITE_WORKS.md) — obsolete
  Vercel/future-work primer.
- [How Dynamic Content Works](history/HOW_DYNAMIC_CONTENT_WORKS.md) — early
  abbreviated data-flow summary.
- [Tournament Data Model](history/DataModel.md) — early model and Lake Fork demo seed.
- [Database Design](history/DATABASE_DESIGN.md) — original persistence blueprint.
- [WeighFish Integration](history/WeighFishIntegration.md) — early planned import flow.
- [UI Standards](history/UI-Standards.md) — early compact visual checklist.

[00 Start Here](00_START_HERE.md) remains only as a compatibility pointer to
this index because older protected documents mention that path.

Older Vercel-era hosting assumptions are superseded. The current production
platform is Cloudflare Workers through OpenNext and Wrangler.

Historical statements about deleted `components/AOYStandings.tsx` in
`history/RepositoryAudit.md` remain dated evidence. The current AOY module is
`lib/aoy-standings.ts`; the deleted component must not be recreated.

Version: 1.2
Last Updated: September 15, 2026

# Changelog

## 2026-09-15

### Production tournament presentation and safety

- Limited Tournament Information selection to the chronological active-season
  schedule while preserving tournament-ID-scoped editing and save navigation.
- Made Tournament Information the shared source for Schedule Hours, Stop
  Fishing, Launch Type, Morning Registration, lake overlay, and Featured
  Tournament identity.
- Added strict `HH:mm` Morning Registration validation and fail-safe public
  operations behavior for malformed optional time data.
- Added mobile Launch Type and Morning Registration details, the Featured
  Tournament presenter/title/lake hierarchy, responsive title accent lines,
  and per-tournament `presented_by` with an `AITT` default/fallback.

### Environment and operations

- Added a once-daily, manually dispatchable, GET-only staging Supabase
  keepalive with exact staging validation and explicit production refusal.
- Retained guarded OpenNext/Cloudflare production deployment through
  `scripts/deploy-production.mjs`.
- Documented implemented Square payment verification/recovery and durable
  paid-registration confirmation email delivery, including retry state and
  staging recipient restrictions.

## 2026-08-25

### Completed staging tournament lifecycle

- Reconciled independent per-tournament registration, verified Square
  activation, current public-tournament selection, public Entries scoping, and
  permanent registration closure after publication.
- Completed preparation guards, Working Result ownership validation, combined
  payout/Insurance closeout and reset protections, Official Results readiness,
  and public Results payout/pagination/mobile behavior.
- Completed deterministic AOY and Championship projections and compact public
  AOY standings. Championship public registration enforcement remains pending.
- Selected [AITT Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md) as the
  primary human-readable operating and business-rule authority.

## 2026-08-08

### Production architecture and security

- Production runs on Cloudflare Workers through OpenNext and Wrangler.
- `wrangler.jsonc` is the source-controlled Worker configuration and declares
  the `allintrail.com` Custom Domain.
- Supabase Admin Auth, fail-closed middleware, protected server actions, and
  browser sign-out are implemented.
- `SUPABASE_SERVICE_ROLE_KEY` remains a production Cloudflare Secret.
- A Wrangler remote/local metadata-drift warning remains under review; it is
  not a production outage.

### Tournament operations

- Added durable registration infrastructure and protected Registration Review.
- Added transactional WeighFish Working Results import, validation, identity
  reconciliation, and immutable Official Results publication/correction.
- Added Insurance, payout/check preparation, tournament financial closeout,
  AOY, and Championship qualification processing.
- At this dated 2026-08-08 milestone, live Square checkout/payment remained
  pending. The 2026-08-25 entry supersedes that implementation status.

### Email

- At this dated milestone, Resend handled registration-interest confirmation.
  Paid-registration confirmation delivery was added later and is recorded in
  the 2026-09-15 entry.
- Contact remains visitor-initiated `mailto:` with inbound Cloudflare Email
  Routing.

## 2026-07-23

### Domain and Infrastructure

- Registered `allintrail.com`.
- Confirmed GitHub connection.
- Selected the original Vercel, Cloudflare, and Supabase architecture. The
  Vercel hosting decision was later superseded by Cloudflare Workers/OpenNext.
- Chose free tiers for initial launch.

### Tournament Information

- Connected the Tournament Information form to live Supabase data.
- Verified successful tournament updates.
- Verified saved values persist after refresh.
- Added the temporary anon table-level UPDATE privilege required by the current
  unauthenticated development workflow.

### Contact and Email

- Enabled Cloudflare Email Routing for `allintrail.com`.
- Created and tested `info@allintrail.com` forwarding.
- Removed the original Resend package dependency and feedback-email endpoint.
- Removed the feedback email API route.
- Removed Resend requirements from the Contact workflow. A later
  registration-interest flow uses `RESEND_API_KEY` directly when configured.
- Updated the Contact page to `info@allintrail.com`.
- Converted the floating Contact widget to use the visitor's email application.
- Verified the new contact workflow.

### Security Follow-up

- Replace anonymous database writes with authenticated Supabase Admin policies
  before production.
- Historical follow-up only; current security and deployment status is recorded
  in the 2026-08-08 entry above.


---
For an overview of the project, begin with **00_START_HERE.md**.

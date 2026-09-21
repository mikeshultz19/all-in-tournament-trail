# Tournament Disaster Recovery

## Objective and authority

AITT must be able to conduct a tournament if the public website and Admin
Console are unavailable. Supabase remains the authoritative application
database. The independent Google Sheet is a human-readable continuity copy, not
a payment ledger or replacement database. It is owned by
`allintournamenttrail@gmail.com` and must contain only the approved roster
fields.

The continuity path is: independent online-registration Sheet → downloaded
Excel workbook or printed roster → paper walk-ups → combined WeighFish field →
weigh-in and payout → post-tournament AITT repair and reconciliation.

The system is **not operationally rehearsed** until an authenticated staging
browser, Google API, and GitHub Actions staging rehearsal passes. Automated tests and a
successful build do not establish live backup readiness.

## Data flow and frequency

After a registration, material edit, cancellation/status change, identity or
membership-review change, or Check-In change, a durable outbox event is created
only after the database write exists. Page loads, search, filters, pagination,
print, export, and refresh create no events. The GitHub Actions processor claims events with row
locking, renders authoritative current Supabase state, upserts `Current
Registrations`, appends one `Registration Change Log` record, and marks the
event synchronized only after both Google operations succeed.

The GitHub Actions processor is the only planned scheduler and execution path. It runs every
four hours with bounded retry/backoff; the website, laptop, and Cloudflare
Worker are not required. The practical RPO is the last Google-confirmed event; the RTO is the time to open a
downloaded workbook or printed roster and continue tournament operations. A
failed backup never rejects, rolls back, delays, or erases a valid registration.

## Google workbook

The owner must create and retain the Sheet in the organization Google account.
Expected tabs are:

- **Current Registrations:** one current row per immutable Registration ID;
  cancelled/inactive history remains clearly represented.
- **Registration Change Log:** append-only event ID, registration ID, change
  type, event time, synchronization time, and exported business state. Event
  IDs are idempotent.

Headers and stable identifiers should be protected. Rows must never be matched
by participant name. No card number, CVV, Square token, Google private key, or
Supabase service-role key may enter the Sheet, browser, logs, repository, or
error messages.

## Failure, monitoring, and recovery

The Admin Registration Review status panel reports the last Google-confirmed
time, pending count, failed count, and setup/failure warning. `Retry Failed`
releases failed events for bounded retry. `Rebuild Tournament Backup` queues a
deliberate full-tournament rebuild. A rebuild is idempotent and does not alter
registrations or payments.

If Google is unavailable, staff downloads **Download Registration Spreadsheet**
and optionally the compatibility CSV, then prints the workbook. The workbook
contains the complete active tournament roster independent of UI pagination,
search, or filters. It is a real `.xlsx` file with a frozen header, filters,
readable widths, and no formulas or macros.

## Tournament outage procedure

1. Confirm the last Google-confirmed timestamp and download the latest Excel
   workbook before connectivity is lost.
2. Print the roster and keep the downloaded file on an approved encrypted
   device; do not email or copy it to personal accounts.
3. Record tournament-day walk-ups on paper forms with the same required
   participant, selection, payment, and contact fields.
4. Combine preregistered teams and walk-ups in WeighFish, reconcile identities,
   and conduct the ordinary weigh-in and payout process.
5. Preserve paper forms and the workbook as controlled operational records.
6. When AITT returns, repair/reconcile registrations, memberships, check-in,
   results, payments, and payout records against the approved evidence. Do not
   silently overwrite historical records.

## Security and permissions

The Google adapter is server-only. The service-account JSON is parsed only in
the GitHub Actions runner process; the processor signs a short-lived JWT,
exchanges it for a Google OAuth token, and caches that token only in memory
until shortly before expiry.
Neither credential is exposed to browser JavaScript. The outbox is
service-role-only with RLS and revoked anonymous and authenticated table access.
Cloudflare's deployed DR Worker is retired and retained as an inactive legacy
shell; it must not be re-enabled, and no Cloudflare secret or Worker URL is
required by the GitHub workflow. The workflow uses the `aitt-staging-dr` environment,
concurrency control, and `0 */4 * * *`; it runs only when the repository
variable `AITT_DR_STAGING_ENABLED=true` is explicitly approved. Registration
success remains independent of Google or GitHub availability. Admin Sync Now is
disabled until an authenticated, least-privilege GitHub dispatch mechanism is
separately designed and rehearsed; Rebuild Tournament Backup remains available.

Synchronization is fail-closed: an outbox event is marked synchronized only
after the Google Sheets API returns a successful response confirming the row
write. Empty tabs, missing identifier headers, non-2xx responses, timeouts,
malformed responses, authentication failures, and permission errors remain
retryable with a sanitized stage code. Current Registrations is keyed by
immutable Registration ID; Registration Change Log is keyed by durable Event
ID. Duplicate retries update the current row and do not append duplicate
history. A finish failure is reported as `OUTBOX_FINISH_FAILED` rather than a
successful synchronization.

## Setup still required

Mike must create/confirm the organization-owned Sheet and configure the GitHub
environment `aitt-staging-dr` with encrypted secrets named
`AITT_DR_STAGING_GOOGLE_SERVICE_ACCOUNT_JSON`,
`AITT_DR_STAGING_GOOGLE_SHEET_ID`, `AITT_DR_STAGING_SUPABASE_URL`, and
`AITT_DR_STAGING_SUPABASE_SECRET_KEY`. The repository variable
`AITT_DR_STAGING_ENABLED` must remain false or unset until isolated staging
rehearsal is approved. Configure the GitHub Actions budget at $0 before
enabling the schedule. No sensitive value belongs in Git, workflow YAML, logs,
artifacts, caches, or documentation. Database-backup workflows are separate
future work.

The controlled corrected-rebuild sequence is: deploy corrected code/workflow;
configure encrypted staging secrets; apply only the versioned-rebuild migration;
enable manual workflow execution; queue Ray Hubbard version `corrected-v2`; run
the workflow manually; verify both tabs, row counts, outbox success, and
duplicate execution; then enable the four-hour schedule only after Mike
approval. The versioned migration preserves existing events and does not reset
or rewrite the 16 historically synchronized rows.

The admin workbook contains Tournament, Registration Number, Registration ID,
Registration Timestamp, Registration Status, Source, Team or Solo, both
participants' names/phones/emails/membership statuses, Base Entry, Bronze,
Silver, Gold, Big Bass, Insurance, Amount Collected, Payment Method, Payment
Status, Payment Reference, Review Status, Check-In Status, and Last Updated.
It is generated from the complete active tournament roster and is independent
of roster pagination, search, and filters. The compatibility CSV remains
available separately.

Membership status in the workbook is participant-level: current registrations
show Current Member or Purchased Membership, while an unverified current-member
claim remains Needs Review. Current registration has no non-member path and no
hypothetical membership receivable; collected payment snapshots remain the
financial authority. Historical Non-Member records remain readable for recovery
and reconciliation.

## Rehearsal evidence

The permanent four-layer standard in the Tournament Readiness Checklist applies:
human-visible authenticated staging UI, complete workflow, backend/integration
evidence, and automated regression protection. Record Automated UI Validated,
Staging Backend Validated, Staging Browser Validated, Fully Rehearsed, and Mike
Approved separately. Before October 1, Mike must complete a manual acceptance
walkthrough after Codex's full rehearsal. This capability is currently Needs
Rehearsal because Google credentials and Sheet ID have not been exercised
through the GitHub Actions staging workflow.

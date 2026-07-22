# All-In Tournament Trail Database Design

*Phase 4.1 – Registration Persistence Blueprint*

## Purpose

This document defines the data model before Supabase implementation begins. It
is a blueprint, not executable SQL.

The database will become the permanent source of truth for:

- Tournaments
- Registrations
- Anglers
- Memberships
- Pot selections
- Payments
- Future tournament results

The AITT database will manage registration and reconciliation. After a
tournament, WeighFish will eventually supply the official completed-tournament
record. Importing that record will allow AITT to reconcile registrations and
memberships and later publish results and calculate AOY.

## Design Principles

1. Store each real-world item once whenever practical.
2. Keep tournament registrations separate from individual anglers.
3. Treat each angler's membership independently.
4. Support both solo and two-angler team registrations.
5. Preserve historical information by season.
6. Never send private information to public pages.
7. Keep payment and reconciliation fields auditable.
8. Prepare for future WeighFish import without requiring it in Phase 4.
9. Prefer clear relational tables over large duplicated records.
10. Use UUID primary keys for database records.

## High-Level Relationship Diagram

```text
Season
  |
  +-- Tournaments
  |       |
  |       +-- Registrations
  |               |
  |               +-- Registration Participants
  |               |        |
  |               |        +-- Anglers
  |               |
  |               +-- Registration Pot Selections
  |               |
  |               +-- Payments
  |
  +-- Memberships
           |
           +-- Anglers

Future result relationships:

Tournament
  |
  +-- Results
         |
         +-- Result Participants
         |
         +-- AOY Points
```

A season groups tournaments and annual memberships. A registration belongs to
one tournament, while participant rows connect that registration to one or two
anglers. Pot selections belong to the registration. Membership connects an
individual angler to a season, never merely to a teammate.

Future result records will remain separate from pre-tournament registration
records. That preserves the existing boundary between event, result, and AOY
data and gives WeighFish reconciliation a clear place to work.

## Proposed Tables

The types below are general database types, not final Supabase syntax.

### `seasons`

**Purpose:** Represent a tournament season and membership year.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `name` | Text | Required | Public season name |
| `year` | Integer | Required | Membership/tournament year |
| `starts_on` | Date | Required | First date in the season |
| `ends_on` | Date | Required | Last date in the season |
| `is_current` | Boolean | Required | Defaults to false |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Tournaments and memberships belong to a season. Historical seasons remain
available. Only one season should normally be current; a database constraint
or controlled admin workflow should enforce that rule.

Future reporting may add labels or archival flags without changing historical
records.

### `tournaments`

**Purpose:** Represent each scheduled AITT tournament.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `season_id` | UUID | Required | References `seasons.id` |
| `name` | Text | Required | Tournament name |
| `lake_name` | Text | Required | Public lake name |
| `location` | Text | Required | Launch site/location |
| `tournament_date` | Date | Required | Local tournament date |
| `registration_deadline` | Timestamp | Required | Stored as an exact instant |
| `safe_light_time` | Time/timestamp | Optional | Calculated value or snapshot |
| `safe_light_override` | Time/timestamp | Optional | Later admin override |
| `status` | Controlled text | Required | Tournament lifecycle/status |
| `status_message` | Text | Optional | Current public message |
| `weighfish_tournament_id` | Text | Optional | Future external identifier |
| `public_notes` | Text | Optional | Approved public information |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Suggested lifecycle values include `scheduled`, `registration_open`,
`registration_closed`, `postponed`, `cancelled`, and `completed`. The existing
public operations model also uses `weather_watch`, `delayed`, and `rescheduled`;
the final status model must preserve those approved public states rather than
silently dropping them.

Weather data must never change tournament status automatically. The Tournament
Director retains authority. Online registration normally closes at 9:00 PM
`America/Chicago` on the evening before the tournament. Safe Light is normally
Fort Worth sunrise minus 30 minutes with automatic daylight-saving handling;
an admin override may be supported later.

Indexes will likely be useful for `season_id`, `tournament_date`, and `status`.

### `anglers`

**Purpose:** Store each individual angler once whenever practical.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `first_name` | Text | Required | Private master record |
| `last_name` | Text | Required | Private master record |
| `email` | Text | Optional | Ramp records may omit it |
| `phone` | Text | Optional | Original entered value |
| `address_line_1` | Text | Optional | Private |
| `address_line_2` | Text | Optional | Private |
| `city` | Text | Optional | Private |
| `state` | Text | Optional | Private |
| `postal_code` | Text | Optional | Private |
| `normalized_email` | Text | Optional | Duplicate-detection aid |
| `normalized_phone` | Text | Optional | Duplicate-detection aid |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

An angler is not automatically a member. Membership is separate and applies
per season. Morning/ramp records may exist without email, and normalization
helps find likely duplicates.

Private contact and address data must never appear in the public entry
projection. Duplicate records will sometimes occur; the Admin Portal should
flag and reconcile them instead of merging them automatically based on unsafe
assumptions.

### `memberships`

**Purpose:** Track an individual angler's membership for one season.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `angler_id` | UUID | Required | References `anglers.id` |
| `season_id` | UUID | Required | References `seasons.id` |
| `status` | Controlled text | Required | Membership state |
| `amount_paid` | Money/decimal | Required | Server-calculated value |
| `payment_status` | Controlled text | Required | Auditable payment state |
| `payment_method` | Controlled text | Optional | No card data |
| `purchased_at` | Timestamp | Optional | When purchase completed |
| `source` | Controlled text | Required | How record originated |
| `admin_notes` | Text | Optional | Private |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Suggested statuses are `active`, `pending`, `refunded`, `cancelled`, and
`expired`. Suggested sources are `online`, `morning_registration`, `admin`, and
`weighfish_reconciliation`.

Membership costs $40 per angler. Each angler's membership is independent, and
one teammate's membership never makes the other angler a member. There should
normally be no more than one active membership for an angler in a season.
Membership is required for Bronze, Silver, and Gold eligibility; exact team
eligibility is called out under Open Decisions.

Future reconciliation should preserve source and payment history rather than
overwriting evidence.

### `registrations`

**Purpose:** Represent one tournament entry containing one or two anglers.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `tournament_id` | UUID | Required | References `tournaments.id` |
| `registration_number` | Text/integer | Required | Unique within tournament |
| `registration_type` | Controlled text | Required | `solo` or `team` |
| `source` | Controlled text | Required | Origin of entry |
| `status` | Controlled text | Required | Registration lifecycle |
| `registered_at` | Timestamp | Required | Trusted server timestamp |
| `contact_email` | Text | Optional | Registration snapshot |
| `contact_phone` | Text | Optional | Registration snapshot |
| `admin_notes` | Text | Optional | Private |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Suggested sources are `early_online` and `weighfish_import`. AITT does not
create live Tournament-Morning Registration records; WeighFish owns that
workflow and AITT receives official history through the later CSV import.
Suggested registration statuses are `pending_payment`, `confirmed`,
`cancelled`, `refunded`, and `reconciled`.

Tournament Entry is required. A registration belongs to exactly one tournament
and has exactly one or two participants. Its timestamp and morning/online
source must be preserved. Public pages may show the timestamp but never contact,
payment, or admin details.

Registration-level contact fields preserve exactly what was supplied for that
entry and identify the primary contact even if the angler's master record later
changes.

### `payments`

**Purpose:** Preserve provider-independent payment state separately from the
registration. Initial records apply only to website-originated Square payments.

Conceptually, each payment retains its registration, provider, integer-cent
subtotal, integer-cent Card Processing Fee, integer-cent total charged, status,
minimum private provider reference, idempotency key, and trusted timestamps.
Card numbers, CVV values, magnetic-stripe data, and raw payment credentials must
never be stored.

A registration is confirmed only after Square reports successful payment.
Tournament-morning Cash or Card selection remains in WeighFish, while Square
owns the corresponding card-reader transaction. AITT does not maintain a live
morning payment ledger.

### `registration_participants`

**Purpose:** Connect anglers to registrations without fixed Angler 1 and
Angler 2 columns.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `registration_id` | UUID | Required | References `registrations.id` |
| `angler_id` | UUID | Required | References `anglers.id` |
| `participant_position` | Small integer | Required | `1` or `2` |
| `is_primary_contact` | Boolean | Required | One primary when practical |
| `membership_requested` | Boolean | Required | Registration-time choice |
| `membership_amount` | Money/decimal | Required | Registration-time snapshot |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Solo entries have one participant and team entries have two. A registration
cannot have more than two, repeat the same angler, or repeat a participant
position. Position controls public display order only. Membership remains an
individual-angler concept.

This join table is better than `angler_1_id` and `angler_2_id` because it gives
cleaner relationships, fewer nullable fields, easier reconciliation and
reporting, natural solo support, and an easier path for future expansion.

### `registration_pot_selections`

**Purpose:** Store each pot selected for a registration as a separate row.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `registration_id` | UUID | Required | References `registrations.id` |
| `pot_type` | Controlled text | Required | Selected pot |
| `amount` | Money/decimal | Required | Price snapshot |
| `payment_status` | Controlled text | Required | Item-level payment state |
| `eligibility_status` | Controlled text | Required | Validation/review state |
| `created_at` | Timestamp | Required | Server generated |
| `updated_at` | Timestamp | Required | Server maintained |

Suggested pot types are `tournament_entry`, `big_bass`, `insurance`, `bronze`,
`silver`, and `gold`. A registration may contain each type at most once.

Tournament Entry is required. Big Bass and Insurance are optional; Insurance
costs $20. Bronze, Silver, and Gold are optional, membership-gated, mutually
exclusive under the current operations specification, and each pays one place
for every five entries. Insurance pays the first out-of-the-money Tournament
Entry finisher and continues in order until its funds are exhausted.

Rows are slightly more complex to query than separate Boolean columns, but
they make reporting, price snapshots, audits, and future pot changes much more
flexible.

> **Decision boundary:** Existing operations documentation describes Insurance
> as member-only, while the requested Phase 4.1 baseline lists it as optional
> without stating that eligibility rule. Confirm and record the final rule
> before constraints are implemented.

### `registration_audit_log` (Recommended Later)

**Purpose:** Record meaningful registration changes during the Admin Portal
phase. It is recommended, but not required for the first persistence milestone.

| Column | General type | Requirement | Notes |
| --- | --- | --- | --- |
| `id` | UUID | Required | Primary key |
| `registration_id` | UUID | Required | References `registrations.id` |
| `action` | Controlled text | Required | Meaningful event |
| `changed_by` | UUID/text | Optional | Admin/system identity |
| `previous_values` | Structured data | Optional | Relevant prior values |
| `new_values` | Structured data | Optional | Relevant new values |
| `created_at` | Timestamp | Required | Immutable event time |

Actions may include `created`, `updated`, `cancelled`, `payment_verified`,
`reconciled`, `participant_changed`, and `membership_updated`. This history is
valuable when payments are verified or tournament-day corrections are made.
Audit events should be append-only rather than silently edited.

## Future Tables

These are design placeholders, not part of initial Phase 4 implementation.

### `tournament_results`

Potential fields: `id`, `tournament_id`, `registration_id`, `finish_position`,
`total_weight`, `big_bass_weight`, `winnings`, `weighfish_record_id`, and
`imported_at`.

### `result_participants`

Connect official result records to the anglers who earned them without
assuming registration participants always match imported data perfectly.

### `aoy_points`

Track approved season points per angler or team after AOY ownership and scoring
rules are finalized.

### `weighfish_imports`

Track every CSV source filename, import time, tournament association, status,
validation outcome, errors, and reconciliation session. Preserve an imported
payment-method value when present; normalize only known Cash and Card values
and retain unknown values for review.

### `admin_users`

Connect Supabase authentication profiles to approved admin roles and
permissions.

### `news_posts`

Store future admin-managed Latest News and announcements.

> Do not implement these tables until their business rules are approved.

## Registration Examples

These are plain-language record examples, not SQL.

### Example 1: Solo Registration

| Record type | Example |
| --- | --- |
| Registration | One solo entry for Tournament A |
| Participants | Angler 1 only |
| Pot rows | Tournament Entry and Big Bass |
| Membership pots | None |

### Example 2: Two-Person Member Team

| Record type | Example |
| --- | --- |
| Registration | One team entry for Tournament A |
| Participants | Angler 1 and Angler 2 |
| Memberships | Both anglers have active season memberships |
| Pot rows | Tournament Entry, Big Bass, Bronze, Silver, and Insurance |

This example demonstrates storage shape only. Current operations say Bronze,
Silver, and Gold are mutually exclusive, so the example's simultaneous Bronze
and Silver selections would fail validation unless that approved rule changes.

### Example 3: Mixed-Membership Team

| Record type | Example |
| --- | --- |
| Registration | One team entry for Tournament A |
| Participants | Angler 1 and Angler 2 |
| Memberships | Angler 1 active; Angler 2 not active |
| Member pots | Awaiting approved eligibility rule |

Member-only eligibility must follow the final approved business rule and be
validated on the server.

> **Open decision:** Confirm whether a mixed-membership team may enter Bronze,
> Silver, or Gold. The current operations specification says both anglers must
> be members, while this Phase 4.1 review explicitly reopens the question. The
> documents must be reconciled before implementation.

## Public Tournament Entries Query

The public page will start from registrations for one tournament, order them
by `registered_at` from oldest to newest, join their ordered participants to
approved display names, and join only the pot types needed for public display.
It will derive:

- Registration timestamp
- Angler 1
- Angler 2, or `Solo`
- Big Bass participation
- Bronze, Silver, or Gold participation
- Insurance participation

Summary counts will calculate Total Tournament Entries, Team Entries, Solo
Entries, Big Bass, Bronze, Silver, Gold, and Insurance Pot from the same
privacy-safe projection.

Public queries must never expose addresses, phone numbers, email addresses,
payment references, admin notes, internal IDs, or reconciliation information.
The browser should receive approved public fields, not full private rows.

## Validation Rules

Trusted server-side logic must verify that:

- The tournament exists and currently permits the applicable registration.
- Online registration arrives before its configured deadline.
- Website submission is Early Online Registration only; configured morning
  hours never open the AITT form.
- The registration contains exactly one or two anglers and required fields.
- The same participant is not repeated within a registration.
- Tournament Entry is always selected.
- A pot selection is not duplicated.
- Member-only pots have confirmed eligibility.
- Trusted server logic calculates prices and totals.
- Browser-submitted totals are never trusted.
- Card amounts use integer cents, and the 3% Card Processing Fee is rounded to
  the nearest cent with half-cent results rounded upward.
- Square payment creation uses an idempotency key, and registration is not
  confirmed from a browser redirect alone.
- Private information is never included in public output.

Database constraints should reinforce rules that are always true. Business
rules that may change should remain in clear server logic with focused tests.

## Duplicate Detection and Reconciliation

Duplicate detection is not the same as a strict uniqueness rule. Useful
signals include:

- Same normalized email
- Same normalized phone
- Same first and last name
- Similar spelling
- Same angler appearing in multiple entries for one tournament

Any signal can be incomplete or wrong. The system should flag likely matches
for admin review and preserve an audit trail. It must not automatically merge
people based only on a name match.

## Security and Supabase Row-Level Security

Row-Level Security (RLS) controls which database rows a caller may access. At a
planning level, public visitors should eventually be allowed to:

- Read approved public tournament information.
- Read approved public entry information.
- Submit a registration through controlled server-side logic.

Public visitors must not be allowed to:

- Read private angler or payment details.
- Edit registrations directly.
- Read admin notes.
- Access membership reconciliation data.

Authorized admins should eventually be able to view and edit registrations,
manage tournaments, verify payments, reconcile memberships, and export data.
Authentication alone is not enough; server-side authorization and RLS must
protect each operation.

Service-role credentials must never appear in browser code. Payment card data
must remain with the payment provider and must not be stored in AITT tables.
Final RLS SQL policies belong to a later reviewed implementation task.

## Recommended Phase 4 Implementation Order

1. Approve this database design.
2. Create the Supabase project.
3. Configure environment variables.
4. Add the Supabase server client.
5. Create the initial tables:
   - `seasons`
   - `tournaments`
   - `anglers`
   - `memberships`
   - `registrations`
   - `registration_participants`
   - `registration_pot_selections`
6. Add constraints and indexes.
7. Add seed data for the current season and tournament.
8. Persist new registrations.
9. Read live registrations on the public Tournament Entries page.
10. Add tests.
11. Update documentation.
12. Commit and push after review.

## Open Decisions Before Implementation

> **Stop point:** Do not encode any answer below in tables, constraints, or
> application logic until the business rule is approved and recorded. Where an
> older document appears to answer a reopened question, reconcile the documents
> explicitly.

1. **Mixed-membership team eligibility:** When one angler is a member and the
   other is not, can the team enter Bronze, Silver, or Gold? The operations
   specification currently says both must be members, but this review treats
   the rule as awaiting confirmation.
2. **Pot ownership:** Are Bronze, Silver, and Gold selections team-level or
   individual-angler selections?
3. **Membership purchase during registration:** Can one or both anglers buy
   membership in the tournament registration transaction?
4. **Square implementation sequencing:** Registration persistence must exist
   before production Square checkout and successful payment confirmation are
   enabled.
5. **Registration editing:** Can anglers edit their entry before the deadline,
   or must an admin handle every change?
6. **Duplicate tournament entries:** May one angler appear in more than one
   registration for the same tournament under any circumstance?
7. **Registration numbers:** Should numbers be sequential within each
   tournament or use a human-readable generated code?
8. **Insurance eligibility:** Confirm whether Insurance remains member-only,
   as stated in Tournament Operations.
9. **Status storage:** Decide whether one `status` column should combine event
   lifecycle, registration availability, and operational status, or whether
   those concerns need separate controlled fields.
10. **Example pot combination:** Confirm that Bronze, Silver, and Gold remain
    mutually exclusive; this blueprint does not approve the prompt's example
    containing both Bronze and Silver.

## Initial Recommendation

Begin with seven tables:

- `seasons`
- `tournaments`
- `anglers`
- `memberships`
- `registrations`
- `registration_participants`
- `registration_pot_selections`
- `payments`

This model is normalized enough to support multiple seasons, registrations,
public entries, administration, and future reconciliation while remaining
understandable for one administrator. It stores anglers once, keeps each
membership independent, supports solo and team entries naturally, and records
pot selections with useful flexibility and auditability.

Delay results, AOY, detailed auditing, and WeighFish import tables until their
business rules are documented and approved. That keeps Phase 4 focused on
reliable registration persistence without prematurely locking future workflows
into the database.
